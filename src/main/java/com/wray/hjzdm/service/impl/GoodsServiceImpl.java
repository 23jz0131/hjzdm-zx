package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.dto.CompareGroupDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.GoodsCollect;
import com.wray.hjzdm.mapper.GoodsCollectMapper;
import com.wray.hjzdm.mapper.GoodsMapper;
import com.wray.hjzdm.service.GoodsService;
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

    @Override
    public List<Goods> searchGoods(String query, java.util.Map<Long, String> attrFilters, Long catId) {
        return new ArrayList<>();
    }

    @Override
    public List<CompareGroupDTO> compareGoods(QueryDTO queryDto) {
        return new ArrayList<>();
    }

    @Override
    public Goods queryGoodsDetail(Long goodsId) {
        return goodsMapper.selectById(goodsId);
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
        return query.replaceAll("\\s+", " ").trim();
    }
}