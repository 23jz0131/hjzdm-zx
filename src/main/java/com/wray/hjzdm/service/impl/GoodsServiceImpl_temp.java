package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.GoodsCollect;
import com.wray.hjzdm.mapper.GoodsCollectMapper;
import com.wray.hjzdm.mapper.GoodsMapper;
import com.wray.hjzdm.service.GoodsService;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Autowired
    private GoodsMapper goodsMapper;

    @Autowired
    private GoodsCollectMapper goodsCollectMapper;

    @Autowired
    private RedisTemplate redisTemplate;

    private static final ExecutorService executor = Executors.newFixedThreadPool(10);

    @Override
    public List<Goods> searchGoods(String query, Map<Long, String> attrFilters, Long catId) {
        // Implementation here
        return new ArrayList<>();
    }

    @Override
    public List<Goods> compareGoods(String query) {
        // Implementation here
        return new ArrayList<>();
    }

    @Override
    public Goods getGoods(Long goodsId) {
        return goodsMapper.selectById(goodsId);
    }

    @Override
    public List<Goods> getMyGoods(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        Long userId = BaseContext.getCurrentId();
        List<Goods> goodsList = goodsMapper.selectList(
            new LambdaQueryWrapper<Goods>().eq(Goods::getAuthor, userId));
        PageInfo<Goods> pageInfo = new PageInfo<>(goodsList);
        return pageInfo.getList();
    }

    @Override
    public List<Goods> getMyCollect(QueryDTO queryDto) {
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

    private String normalizeQuery(String query) {
        if (query == null) return "";
        
        // 移除多余空格
        return query.replaceAll("\\s+", " ").trim();
    }
}