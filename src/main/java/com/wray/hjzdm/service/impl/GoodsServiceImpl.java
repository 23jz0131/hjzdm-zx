package com.wray.hjzdm.service.impl;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.config.RakutenProperties;
import com.wray.hjzdm.config.YahooProperties;
import com.wray.hjzdm.dto.CompareGroupDTO;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.GoodsCollect;
import com.wray.hjzdm.entity.GoodsLike;
import com.wray.hjzdm.mapper.GoodsCollectMapper;
import com.wray.hjzdm.mapper.GoodsLikeMapper;
import com.wray.hjzdm.mapper.GoodsMapper;
import com.wray.hjzdm.service.AiClient;
import com.wray.hjzdm.service.GoodsService;
import com.wray.hjzdm.common.HttpClientUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.*;
import java.util.stream.Collectors;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

@Service
@Slf4j
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Autowired
    private RakutenProperties rakutenProperties;

    @Autowired
    private YahooProperties yahooProperties;

    @Autowired
    private GoodsLikeMapper goodsLikeMapper;

    @Autowired
    private GoodsCollectMapper goodsCollectMapper;

    @Autowired
    private AiClient aiClient;

    @Value("${features.rakuten.enabled:true}")
    private boolean rakutenEnabled;

    private static final String RAKUTEN_API =
            "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706"
                    + "?applicationId=%s"
                    + "&affiliateId=%s"
                    + "&keyword=%s"
                    + "&page=%d"
                    + "&hits=%d"
                    + "&format=json";

    private static final int RAKUTEN_MAX_PAGES = 10;
    private static final int YAHOO_MAX_PAGES = 10;

    /* ================== 基础方法 ================== */

    @Override
    public boolean add(Goods goods) {
        log.info("GoodsServiceImpl.add called with: {}", JSON.toJSONString(goods));
        try {
            if (goods.getCreateTime() == null) {
                goods.setCreateTime(new Date());
            }
            if (goods.getStatus() == null) {
                goods.setStatus(1);
            }
            if (goods.getGoodsNumber() == null) {
                goods.setGoodsNumber(1);
            }
            // Set default values for potentially non-null columns
            if (goods.getCatId() == null) {
                goods.setCatId(1L);
            }
            if (goods.getAuthor() == null) {
                goods.setAuthor(1L);
            }
            if (goods.getBrand() == null) {
                goods.setBrand("其他");
            }
            if (goods.getMallType() == null) {
                goods.setMallType(0);
            }
            if (goods.getGoodsName() == null) {
                goods.setGoodsName("未命名商品");
            }
            if (goods.getGoodsPrice() == null) {
                goods.setGoodsPrice(0.0);
            }
            if (goods.getGoodsLink() == null) {
                goods.setGoodsLink("");
            }
            if (goods.getImgUrl() == null) {
                goods.setImgUrl("");
            }
            if (goods.getUpdateTime() == null) {
                goods.setUpdateTime(new Date());
            }
            log.info("Adding goods with: catId={}, author={}, brand={}, mallType={}", goods.getCatId(), goods.getAuthor(), goods.getBrand(), goods.getMallType());
            if (StringUtils.hasText(goods.getGoodsLink())) {
                Goods existed = this.lambdaQuery()
                        .eq(Goods::getGoodsLink, goods.getGoodsLink())
                        .one();
                if (existed != null) {
                    goods.setGoodsId(existed.getGoodsId());
                    return true;
                }
            }
            boolean ok = this.save(goods);
            if (ok && goods.getGoodsId() == null && StringUtils.hasText(goods.getGoodsLink())) {
                Goods saved = this.lambdaQuery()
                        .eq(Goods::getGoodsLink, goods.getGoodsLink())
                        .orderByDesc(Goods::getCreateTime)
                        .one();
                if (saved != null) {
                    goods.setGoodsId(saved.getGoodsId());
                }
            }
            return ok;
        } catch (Exception e) {
            log.error("添加商品失败: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public List<Goods> queryGoods(QueryDTO queryDto) {
        List<Goods> all = new ArrayList<>();
        if (rakutenEnabled) {
            for (int p = 1; p <= RAKUTEN_MAX_PAGES; p++) {
                List<Goods> pageList = searchRakuten(queryDto, p);
                if (pageList == null || pageList.isEmpty()) {
                    break;
                }
                all.addAll(pageList);
            }
        } else {
            log.info("Rakuten 数据源已禁用，改用 Yahoo 搜索");
            for (int p = 1; p <= YAHOO_MAX_PAGES; p++) {
                List<Goods> pageList = searchYahoo(queryDto, p);
                if (pageList == null || pageList.isEmpty()) {
                    break;
                }
                all.addAll(pageList);
            }
        }
        return all;
    }

    @Override
    public Goods queryGoodsDetail(Long goodsId) {
        return this.getById(goodsId);
    }

    @Override
    public Set<Long> queryGoodsLike(Long goodsId) {
        log.info("查询商品喜欢状态: goodsId={}", goodsId);
        return new HashSet<>();
    }

    @Override
    public List<Goods> queryGoodsByName(String query) {
        if (!StringUtils.hasText(query)) {
            return new ArrayList<>();
        }

        QueryWrapper<Goods> wrapper = new QueryWrapper<>();
        wrapper.like("goods_name", query);
        return this.list(wrapper);
    }

    @Override
    public void like(OperateDTO operateDto) {
        Long userId = operateDto.getUserId();
        Long goodsId = operateDto.getGoodsId();
        if (userId == null || goodsId == null) {
            return;
        }
        GoodsLike exists = goodsLikeMapper.selectOne(new LambdaQueryWrapper<com.wray.hjzdm.entity.GoodsLike>()
                .eq(com.wray.hjzdm.entity.GoodsLike::getUserId, userId)
                .eq(com.wray.hjzdm.entity.GoodsLike::getGoodsId, goodsId));
        Date now = new Date();
        if (exists != null) {
            exists.setStatus(1);
            exists.setUpdateTime(now);
            goodsLikeMapper.updateById(exists);
        } else {
            com.wray.hjzdm.entity.GoodsLike like = com.wray.hjzdm.entity.GoodsLike.builder()
                    .userId(userId)
                    .goodsId(goodsId)
                    .status(1)
                    .updateTime(now)
                    .build();
            goodsLikeMapper.insert(like);
        }
    }

    @Override
    public void dislike(OperateDTO operateDto) {
        Long userId = operateDto.getUserId();
        Long goodsId = operateDto.getGoodsId();
        if (userId == null || goodsId == null) {
            return;
        }
        GoodsLike exists = goodsLikeMapper.selectOne(new LambdaQueryWrapper<com.wray.hjzdm.entity.GoodsLike>()
                .eq(com.wray.hjzdm.entity.GoodsLike::getUserId, userId)
                .eq(com.wray.hjzdm.entity.GoodsLike::getGoodsId, goodsId));
        if (exists != null) {
            exists.setStatus(0);
            exists.setUpdateTime(new Date());
            goodsLikeMapper.updateById(exists);
        }
    }

    @Override
    public void collect(OperateDTO operateDto) {
        Long userId = operateDto.getUserId();
        Long goodsId = operateDto.getGoodsId();
        if (userId == null || goodsId == null) {
            return;
        }
        GoodsCollect exists = goodsCollectMapper.selectOne(new LambdaQueryWrapper<GoodsCollect>()
                .eq(GoodsCollect::getUserId, userId)
                .eq(GoodsCollect::getGoodsId, goodsId));
        Date now = new Date();
        if (exists != null) {
            exists.setUpdateTime(now);
            goodsCollectMapper.updateById(exists);
        } else {
            GoodsCollect collect = GoodsCollect.builder()
                    .userId(userId)
                    .goodsId(goodsId)
                    .updateTime(now)
                    .build();
            goodsCollectMapper.insert(collect);
        }
    }

    @Override
    public void cancelCollect(OperateDTO operateDto) {
        Long userId = operateDto.getUserId();
        Long goodsId = operateDto.getGoodsId();
        if (userId == null || goodsId == null) {
            return;
        }
        goodsCollectMapper.delete(new LambdaQueryWrapper<GoodsCollect>()
                .eq(GoodsCollect::getUserId, userId)
                .eq(GoodsCollect::getGoodsId, goodsId));
    }

    @Override
    public void pullLikedGoods(Long id) {
        log.info("拉取喜欢商品: userId={}", id);
    }

    @Override
    public List<Goods> queryLikedGoods() {
        log.info("查询喜欢的商品列表");
        return new ArrayList<>();
    }

    @Override
    public List<Goods> queryMyGoods(QueryDTO queryDto) {
        log.info("查询我的商品: queryDto={}", queryDto);
        return new ArrayList<>();
    }

    @Override
    public boolean delete(Long goodsId) {
        log.info("删除商品: goodsId={}", goodsId);
        return this.removeById(goodsId);
    }

    @Override
    public List<Goods> queryMyCollect(QueryDTO queryDto) {
        log.info("查询我的收藏: queryDto={}", queryDto);
        if (queryDto.getUserId() == null) {
            return new ArrayList<>();
        }
        return this.baseMapper.queryMyCollect(queryDto.getUserId());
    }

    @Override
    public Page<Goods> queryByCondition(QueryDTO queryDto) {
        log.info("条件查询商品: queryDto={}", queryDto);

        Page<Goods> page = new Page<>(
                queryDto != null ? queryDto.getPageNum() : 1,
                queryDto != null ? queryDto.getPageSize() : 10
        );
        
        // Use the new mapper method that supports attribute filtering
        return this.baseMapper.queryGoodsWithAttrs(page, queryDto);
    }

    @Override
    public Page<Goods> queryAllGoods(QueryDTO queryDto) {
        log.info("查询所有商品: queryDto={}", queryDto);

        Page<Goods> page = new Page<>(
                queryDto != null ? queryDto.getPageNum() : 1,
                queryDto != null ? queryDto.getPageSize() : 20
        );

        QueryWrapper<Goods> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time");

        return this.page(page, wrapper);
    }

    @Override
    public boolean auditPass(Long goodsId) {
        log.info("审核通过商品: goodsId={}", goodsId);

        Goods goods = this.getById(goodsId);
        if (goods == null) {
            log.warn("商品不存在: goodsId={}", goodsId);
            return false;
        }

        goods.setStatus(2); // 假设 2 = 审核通过
        goods.setUpdateTime(new Date());

        return this.updateById(goods);
    }

    @Override
    public boolean auditReject(Long goodsId) {
        log.info("审核拒绝商品: goodsId={}", goodsId);

        Goods goods = this.getById(goodsId);
        if (goods == null) {
            log.warn("商品不存在: goodsId={}", goodsId);
            return false;
        }

        goods.setStatus(3); // 假设 3 = 审核拒绝
        goods.setUpdateTime(new Date());

        return this.updateById(goods);
    }

    /* ================== 🔥 比价核心 ================== */

    @Override
    public List<CompareGroupDTO> compareGoods(QueryDTO queryDto) {
        log.info(">>>>>>>>>> ENTER compareGoods: queryDto={} <<<<<<<<<<", queryDto);
        log.info("Rakuten Enabled Status: {}", rakutenEnabled);

        List<CompletableFuture<List<Goods>>> futures = new ArrayList<>();

        if (rakutenEnabled) {
            futures.add(CompletableFuture.supplyAsync(() -> {
                List<Goods> list = new ArrayList<>();
                for (int p = 1; p <= RAKUTEN_MAX_PAGES; p++) {
                try {
                        List<Goods> pageList = searchRakuten(queryDto, p);
                        if (pageList == null || pageList.isEmpty()) {
                            break;
                        }
                        list.addAll(pageList);
                } catch (Exception e) {
                        log.error("Rakuten P{} Error", p, e);
                }
                }
                return list;
            }));
        } else {
            log.info("Rakuten 数据源已暂时关闭");
        }

        futures.add(CompletableFuture.supplyAsync(() -> {
            List<Goods> list = new ArrayList<>();
            for (int p = 1; p <= YAHOO_MAX_PAGES; p++) {
            try {
                    List<Goods> pageList = searchYahoo(queryDto, p);
                    if (pageList == null || pageList.isEmpty()) {
                        break;
                    }
                    list.addAll(pageList);
            } catch (Exception e) {
                    log.error("Yahoo P{} Error", p, e);
            }
            }
            return list;
        }));

        // 3. Wait All & Merge
        List<Goods> allGoods = new ArrayList<>();
        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            for (CompletableFuture<List<Goods>> f : futures) {
                List<Goods> list = f.get();
                if (list != null) {
                    allGoods.addAll(list);
                }
            }
        } catch (Exception e) {
            log.error("并发搜索合并异常", e);
        }

        if (allGoods.isEmpty()) {
            log.warn("所有平台都没有返回商品数据");
            return new ArrayList<>();
        }

        // 去重 (根据 URL 或者 名称+价格 简单去重，防止重复)
        // 这里暂时不做复杂去重，直接交给后续的分组逻辑

        // 按商品名称分组
        Map<String, List<Goods>> groupMap = allGoods.stream()
                .filter(g -> g.getGoodsName() != null && !g.getGoodsName().trim().isEmpty())
                .collect(Collectors.groupingBy(Goods::getGoodsName));

        log.info("分组后得到 {} 个商品组", groupMap.size());

        List<CompareGroupDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<Goods>> entry : groupMap.entrySet()) {
            String goodsName = entry.getKey();
            List<Goods> goodsList = entry.getValue();

            log.info("商品组 '{}' 有 {} 个商品", goodsName, goodsList.size());

            // 找出最低价
            Double minPrice = goodsList.stream()
                    .map(Goods::getGoodsPrice)
                    .filter(Objects::nonNull)
                    .min(Double::compareTo)
                    .orElse(null);

            log.info("商品组 '{}' 最低价: {}", goodsName, minPrice);

            // 确定最低价平台
            String lowestPlatform = null;
            if (minPrice != null) {
                Optional<Goods> lowestGoods = goodsList.stream()
                        .filter(g -> g.getGoodsPrice() != null && g.getGoodsPrice().equals(minPrice))
                        .findFirst();
                if (lowestGoods.isPresent()) {
                    Integer mallType = lowestGoods.get().getMallType();
                    if (mallType != null) {
                        switch (mallType) {
                            case 10:
                                lowestPlatform = "Rakuten";
                                break;
                            case 20:
                                lowestPlatform = "Yahoo";
                                break;
                            default:
                                lowestPlatform = "Unknown";
                        }
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

    /* ================== Amazon 搜索 (Deprecated Jsoup) ================== */

    // NOTE: Old Jsoup method removed/deprecated in favor of official AmazonService
    // private List<Goods> searchAmazon(QueryDTO queryDto) { ... }

    /* ================== Rakuten 搜索 ================== */

    private List<Goods> searchRakuten(QueryDTO queryDto, int page) {
        log.info("开始搜索 Rakuten 商品, page={}", page);

        List<Goods> result = new ArrayList<>();

        if (queryDto == null || queryDto.getQuery() == null
                || queryDto.getQuery().trim().isEmpty()) {
            log.warn("搜索参数为空");
            return result;
        }

        String originalKeyword = normalizeQuery(queryDto.getQuery().trim());
        log.info("原始关键词(Normalized): '{}'", originalKeyword);

        try {
            String keyword = URLEncoder.encode(
                    originalKeyword,
                    StandardCharsets.UTF_8.name()
            );

            log.info("URL编码后关键词: '{}'", keyword);

            // Rakuten API hits max=30
            int hits = 30;

            String url = String.format(
                    RAKUTEN_API,
                    rakutenProperties.getAppId(),
                    rakutenProperties.getAffiliateId(),
                    keyword,
                    page,
                    hits
            );

            log.error("DEBUG: Rakuten URL: " + url);
            System.out.println("DEBUG_SYSOUT: Rakuten URL: " + url);

            log.info("调用 Rakuten API URL: {}", url);

            // 打印 Rakuten API 配置
            log.info("Rakuten AppId: {}", rakutenProperties.getAppId());

            String json = HttpClientUtil.doGet(url, Collections.emptyMap());

            log.error("DEBUG: Rakuten Response: " + json);
            System.out.println("DEBUG_SYSOUT: Rakuten Response length: " + (json != null ? json.length() : "null"));

            if (json == null || json.trim().isEmpty()) {
                log.error("Rakuten API 返回空响应");
                return result;
            }

            // 打印API返回的前500个字符用于调试
            String preview = json.length() > 500 ? json.substring(0, 500) + "..." : json;
            log.info("Rakuten API 返回 (前{}字符): {}", Math.min(json.length(), 500), preview);

            JSONObject root = JSON.parseObject(json);

            // 检查错误
            if (root.containsKey("error")) {
                String error = root.getString("error");
                log.error("Rakuten API 返回错误: {}", error);
                return result;
            }

            JSONArray items = root.getJSONArray("Items");

            if (items == null || items.isEmpty()) {
                log.warn("Rakuten 返回空数据，keyword='{}'", originalKeyword);
                log.warn("完整响应: {}", json);
                return result;
            }

            log.info("Rakuten 返回 {} 个商品", items.size());

            for (int i = 0; i < items.size(); i++) {
                try {
                    JSONObject itemObj = items.getJSONObject(i);
                    if (itemObj == null) {
                        log.warn("第 {} 个商品对象为空", i);
                        continue;
                    }

                    JSONObject item = itemObj.getJSONObject("Item");
                    if (item == null) {
                        log.warn("第 {} 个商品Item字段为空", i);
                        continue;
                    }

                    Goods g = new Goods();

                    String itemName = item.getString("itemName");
                    String itemUrl = item.getString("itemUrl");

                    log.info("商品 {}: 名称='{}', 链接='{}'",
                            i, itemName, itemUrl);

                    g.setGoodsName(itemName);
                    g.setGoodsLink(itemUrl);
                    g.setMallType(10);
                    g.setStatus(1);
                    g.setCreateTime(new Date());

                    // 价格
                    Object priceObj = item.get("itemPrice");
                    if (priceObj != null) {
                        try {
                            Double price = Double.valueOf(priceObj.toString());
                            g.setGoodsPrice(price);
                            log.info("商品 {} 价格: {}", i, price);
                        } catch (Exception e) {
                            log.warn("商品 {} 价格解析失败: {}", i, priceObj);
                        }
                    } else {
                        log.warn("商品 {} 价格为空", i);
                    }

                    // 图片
                    JSONArray imgs = item.getJSONArray("mediumImageUrls");
                    if (imgs != null && !imgs.isEmpty()) {
                        String imgUrl = imgs.getJSONObject(0).getString("imageUrl");
                        g.setImgUrl(imgUrl);
                        log.info("商品 {} 图片: {}", i, imgUrl);
                    } else {
                        log.warn("商品 {} 图片为空", i);
                    }

                    result.add(g);
                    log.info("商品 {} 添加成功", i);

                } catch (Exception e) {
                    log.error("处理第 {} 个商品时出错", i, e);
                }
            }

            log.info("Rakuten 搜索成功，返回 {} 条有效商品", result.size());

        } catch (Exception e) {
            log.error("Rakuten 搜索失败", e);
        }

        return result;
    }

    /* ================== Yahoo 搜索 ================== */

    private List<Goods> searchYahoo(QueryDTO queryDto, int page) {
        log.info("開始搜索 Yahoo 商品, page={}", page);

        List<Goods> result = new ArrayList<>();

        if (queryDto == null || queryDto.getQuery() == null
                || queryDto.getQuery().trim().isEmpty()) {
            log.warn("Yahoo 搜索参数为空");
            return result;
        }

        String originalKeyword = normalizeQuery(queryDto.getQuery().trim());
        log.info("Yahoo 原始关键词(Normalized): '{}'", originalKeyword);

        try {
            String keyword = URLEncoder.encode(
                    originalKeyword,
                    StandardCharsets.UTF_8.name()
            );

            log.info("Yahoo URL编码后关键词: '{}'", keyword);

            int pageSize = 50;
            int start = (page - 1) * pageSize + 1;

            String url = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch"
                    + "?appid=" + yahooProperties.getClientId()
                    + "&query=" + keyword
                    + "&results=" + pageSize
                    + "&start=" + start;

            log.info("调用 Yahoo API URL: {}", url);

            Map<String, String> headers = new HashMap<>();
            headers.put("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.put("Accept", "application/json");

            String json = HttpClientUtil.doGetWithHeaders(url, Collections.emptyMap(), headers);

            if (json == null || json.trim().isEmpty()) {
                log.error("Yahoo API 返回空响应");
                return result;
            }

            String preview = json.length() > 500 ? json.substring(0, 500) + "..." : json;
            log.info("Yahoo API 返回 (前{}字符): {}", Math.min(json.length(), 500), preview);

            JSONObject root = JSON.parseObject(json);

            if (root.containsKey("error")) {
                log.error("Yahoo API 返回错误: {}", root.get("error"));
                return result;
            }

            JSONArray items = root.getJSONArray("hits");

            if (items == null || items.isEmpty()) {
                log.warn("Yahoo 返回空数据，keyword='{}'", originalKeyword);
                log.warn("完整响应: {}", json);
                return result;
            }

            log.info("Yahoo 返回 {} 个商品", items.size());

            for (int i = 0; i < items.size(); i++) {
                try {
                    JSONObject item = items.getJSONObject(i);
                    if (item == null) {
                        log.warn("第 {} 个 Yahoo 商品对象为空", i);
                        continue;
                    }

                    String itemName = item.getString("name");
                    String itemUrl = item.getString("url");

                    if (!StringUtils.hasText(itemName) || !StringUtils.hasText(itemUrl)) {
                        log.warn("Yahoo 商品 {} 缺少名称或链接", i);
                        continue;
                    }

                    Goods g = new Goods();
                    g.setGoodsName(itemName);
                    g.setGoodsLink(itemUrl);
                    g.setMallType(20);
                    g.setStatus(1);
                    g.setCreateTime(new Date());

                    Double price = null;
                    if (item.containsKey("price")) {
                        try {
                            price = item.getDouble("price");
                        } catch (Exception e) {
                            log.warn("Yahoo 商品 {} price 字段解析失败: {}", i, item.get("price"));
                        }
                    }

                    if (price == null) {
                        JSONObject priceLabel = item.getJSONObject("priceLabel");
                        if (priceLabel != null) {
                            if (priceLabel.containsKey("discountedPrice")) {
                                price = priceLabel.getDouble("discountedPrice");
                            }
                            if (price == null && priceLabel.containsKey("defaultPrice")) {
                                price = priceLabel.getDouble("defaultPrice");
                            }
                        }
                    }

                    if (price != null && price > 0) {
                        g.setGoodsPrice(price);
                        log.info("Yahoo 商品 {} 价格: {}", i, price);
                    } else {
                        log.warn("Yahoo 商品 {} 价格缺失或无效", i);
                    }

                    JSONObject image = item.getJSONObject("image");
                    if (image != null) {
                        String imgUrl = image.getString("medium");
                        if (!StringUtils.hasText(imgUrl)) {
                            imgUrl = image.getString("small");
                        }
                        if (!StringUtils.hasText(imgUrl)) {
                            imgUrl = image.getString("url");
                        }
                        if (StringUtils.hasText(imgUrl)) {
                            g.setImgUrl(imgUrl);
                            log.info("Yahoo 商品 {} 图片: {}", i, imgUrl);
                        } else {
                            log.warn("Yahoo 商品 {} 图片字段为空", i);
                        }
                    } else {
                        log.warn("Yahoo 商品 {} 缺少图片字段", i);
                    }

                    if (g.getGoodsPrice() != null && g.getGoodsPrice() > 0) {
                        result.add(g);
                        log.info("Yahoo 商品 {} 添加成功", i);
                    } else {
                        log.warn("Yahoo 商品 {} 因价格无效未加入结果集", i);
                    }

                } catch (Exception e) {
                    log.error("处理第 {} 个 Yahoo 商品时出错", i, e);
                }
            }

            log.info("Yahoo 搜索成功，返回 {} 条有效商品", result.size());

        } catch (Exception e) {
            log.error("Yahoo 搜索失败", e);
        }

        return result;
    }

    private String normalizeQuery(String original) {
        if (original == null || original.isEmpty()) {
            return original;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < original.length(); i++) {
            char c = original.charAt(i);
            sb.append(c);
            if (i < original.length() - 1) {
                char next = original.charAt(i + 1);
                if (c == ' ' || next == ' ') {
                    continue;
                }
                boolean cIsLatin = isLatinOrDigit(c);
                boolean nIsLatin = isLatinOrDigit(next);
                if (cIsLatin != nIsLatin) {
                    sb.append(' ');
                }
            }
        }
        return sb.toString();
    }

    private boolean isLatinOrDigit(char c) {
        return (c >= 'a' && c <= 'z')
                || (c >= 'A' && c <= 'Z')
                || (c >= '0' && c <= '9');
    }
}
