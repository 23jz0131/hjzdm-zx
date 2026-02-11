package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.dto.CompareGroupDTO;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.GoodsCollect;
import com.wray.hjzdm.mapper.GoodsCollectMapper;
import com.wray.hjzdm.mapper.GoodsMapper;
import com.wray.hjzdm.service.GoodsService;
import com.wray.hjzdm.util.YahooShoppingApiUtil;
import com.wray.hjzdm.util.RakutenIchibaApiUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Autowired
    private GoodsMapper goodsMapper;

    @Autowired
    private GoodsCollectMapper goodsCollectMapper;
    
    @Autowired
    private YahooShoppingApiUtil yahooApiUtil;
    
    @Autowired
    private RakutenIchibaApiUtil rakutenApiUtil;

    public List<Goods> searchGoods(String query, java.util.Map<Long, String> attrFilters, Long catId) {
        return new ArrayList<>();
    }

    @Override
    public List<CompareGroupDTO> compareGoods(QueryDTO queryDto) {
        log.info("========== 开始商品比价搜索 ==========");
        
        String searchKeyword = queryDto.getQuery();
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            searchKeyword = queryDto.getKeyword();
            if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
                queryDto.setQuery(searchKeyword);
            }
        }
        
        log.info("搜索关键词: {}", searchKeyword);

        // 从真实电商平台获取商品数据
        List<Goods> allGoods = new ArrayList<>();
        
        try {
            // 从乐天搜索商品
            log.info("开始乐天商品搜索...");
            List<Goods> rakutenGoods = rakutenApiUtil.searchGoods(searchKeyword, 15);
            allGoods.addAll(rakutenGoods);
            log.info("乐天搜索返回 {} 个商品", rakutenGoods.size());
        } catch (Exception e) {
            log.error("乐天API调用失败: ", e);
        }
        
        try {
            // 从Yahoo搜索商品
            log.info("开始Yahoo商品搜索...");
            List<Goods> yahooGoods = yahooApiUtil.searchGoods(searchKeyword, 15);
            allGoods.addAll(yahooGoods);
            log.info("Yahoo搜索返回 {} 个商品", yahooGoods.size());
        } catch (Exception e) {
            log.error("Yahoo API调用失败: ", e);
        }
        
        log.info("总共获取商品数量: {}", allGoods.size());

        if (allGoods.isEmpty()) {
            log.warn("未找到任何商品，返回空结果");
            return new ArrayList<>();
        }

        // 按商品名称分组（简化版本）
        Map<String, List<Goods>> groupedGoods = new HashMap<>();
        groupedGoods.put(searchKeyword, allGoods);

        List<CompareGroupDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<Goods>> entry : groupedGoods.entrySet()) {
            String goodsName = entry.getKey();
            List<Goods> goodsList = entry.getValue();

            // 找出最低价格和对应平台
            double minPrice = Double.MAX_VALUE;
            String lowestPlatform = "未知";

            for (Goods goods : goodsList) {
                if (goods.getGoodsPrice() != null && goods.getGoodsPrice() < minPrice) {
                    minPrice = goods.getGoodsPrice();
                    switch (goods.getMallType()) {
                        case 10:
                            lowestPlatform = "楽天市場";
                            break;
                        case 20:
                            lowestPlatform = "Yahoo!ショッピング";
                            break;
                        default:
                            lowestPlatform = "その他";
                    }
                }
            }

            CompareGroupDTO dto = new CompareGroupDTO();
            dto.setGoodsName(goodsName);
            dto.setGoodsList(goodsList);
            dto.setLowestPrice(minPrice);
            dto.setLowestPlatform(lowestPlatform);

            result.add(dto);
        }

        log.info("========== 比价搜索完成，返回 {} 个结果 ==========", result.size());
        return result;
    }

    @Override
    public Goods queryGoodsDetail(Long goodsId) {
        return goodsMapper.selectById(goodsId);
    }

    @Override
    public void like(OperateDTO operateDto) {
        // 空实现
    }

    @Override
    public void dislike(OperateDTO operateDto) {
        // 空实现
    }

    @Override
    public void collect(OperateDTO operateDto) {
        // 空实现
    }

    @Override
    public void cancelCollect(OperateDTO operateDto) {
        // 空实现
    }

    @Override
    public void pullLikedGoods(Long id) {
        // 空实现
    }

    @Override
    public List<Goods> queryLikedGoods() {
        return new ArrayList<>();
    }

    @Override
    public List<Goods> queryMyGoods(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        Long userId = BaseContext.getCurrentId();
        List<Goods> goodsList = goodsMapper.selectList(
            new LambdaQueryWrapper<Goods>().eq(Goods::getAuthor, userId));
        PageInfo<Goods> pageInfo = new PageInfo<>(goodsList);
        return pageInfo.getList();
    }

    @Override
    public List<Goods> queryMyCollect(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        Long userId = BaseContext.getCurrentId();
        List<GoodsCollect> collectList = goodsCollectMapper.selectList(
            new LambdaQueryWrapper<GoodsCollect>().eq(GoodsCollect::getUserId, userId));
        
        List<Long> goodsIds = collectList.stream()
            .map(GoodsCollect::getGoodsId)
            .collect(Collectors.toList());
            
        if (goodsIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Goods> goodsList = goodsMapper.selectBatchIds(goodsIds);
        PageInfo<Goods> pageInfo = new PageInfo<>(goodsList);
        return pageInfo.getList();
    }

    @Override
    @Transactional
    public boolean delete(Long goodsId) {
        Goods goods = goodsMapper.selectById(goodsId);
        if (goods == null) {
            return false;
        }
        
        Long currentId = BaseContext.getCurrentId();
        boolean isAuthor = Objects.equals(goods.getAuthor(), currentId);
        if (!isAuthor) {
            return false;
        }
        
        goodsMapper.deleteById(goodsId);
        return true;
    }

    @Override
    public boolean add(Goods goods) {
        return goodsMapper.insert(goods) > 0;
    }

    @Override
    public List<Goods> queryGoods(QueryDTO queryDto) {
        return new ArrayList<>();
    }

    @Override
    public Set<Long> queryGoodsLike(Long goodsId) {
        return new HashSet<>();
    }

    @Override
    public List<Goods> queryGoodsByName(String query) {
        return new ArrayList<>();
    }

    @Override
    public Page<Goods> queryByCondition(QueryDTO queryDto) {
        return new Page<>();
    }

    @Override
    public Page<Goods> queryAllGoods(QueryDTO queryDto) {
        return new Page<>();
    }

    @Override
    public boolean auditPass(Long goodsId) {
        return false;
    }

    @Override
    public boolean auditReject(Long goodsId) {
        return false;
    }

    private String normalizeQuery(String query) {
        if (query == null) return "";
        
        // 移除多余空格
        String normalized = query.replaceAll("\\s+", " ").trim();
        
        // 转换全角字符为半角
        StringBuilder sb = new StringBuilder();
        for (char c : normalized.toCharArray()) {
            // 全角英文字母转半角
            if (c >= 'Ａ' && c <= 'Ｚ') {
                sb.append((char)(c - 'Ａ' + 'A'));
            } else if (c >= 'ａ' && c <= 'ｚ') {
                sb.append((char)(c - 'ａ' + 'a'));
            }
            // 全角数字转半角
            else if (c >= '０' && c <= '９') {
                sb.append((char)(c - '０' + '0'));
            }
            // 其他字符保持不变
            else {
                sb.append(c);
            }
        }
        normalized = sb.toString();
            
        return normalized;
    }

    /**
     * 标准化商品名称用于比价分组
     * 解决不同平台商品名称格式差异导致无法正确分组的问题
     */
    private String standardizeProductName(Goods goods) {
        if (goods == null || goods.getGoodsName() == null) {
            return "";
        }
        
        String name = goods.getGoodsName().trim();
        
        // 提取核心品牌和型号信息
        // 优先提取知名品牌
        String[] brands = {"iPhone", "iPad", "MacBook", "AirPods", "Apple", 
                          "Nintendo", "Switch", "PlayStation", "Xbox", 
                          "Samsung", "Galaxy", "Sony", "Google", "Pixel"};
        
        StringBuilder coreName = new StringBuilder();
        
        // 查找品牌
        for (String brand : brands) {
            if (name.toLowerCase().contains(brand.toLowerCase())) {
                coreName.append(brand).append(" ");
                break;
            }
        }
        
        // 提取型号数字
        java.util.regex.Pattern numberPattern = java.util.regex.Pattern.compile("(\\\\d+[\\\\.\\\\d]*)");
        java.util.regex.Matcher matcher = numberPattern.matcher(name);
        if (matcher.find()) {
            coreName.append(matcher.group(1)).append(" ");
        }
        
        // 提取重要的产品系列关键词
        String[] series = {"Pro", "Max", "Mini", "Plus", "Ultra", "Standard", 
                          "Lite", "SE", "Air", "Touch", "Classic"};
        
        for (String serie : series) {
            if (name.toLowerCase().contains(serie.toLowerCase())) {
                coreName.append(serie).append(" ");
                break;
            }
        }
        
        String standardized = coreName.toString().trim();
        
        // 如果提取不到核心信息，使用原名称的关键部分
        if (standardized.isEmpty()) {
            // 取前20个字符作为基础
            standardized = name.length() > 20 ? name.substring(0, 20) : name;
        }
        
        log.debug("商品名称标准化: '{}' -> '{}' (平台:{})", 
            goods.getGoodsName(), standardized, goods.getMallType());
        
        return standardized;
    }
}