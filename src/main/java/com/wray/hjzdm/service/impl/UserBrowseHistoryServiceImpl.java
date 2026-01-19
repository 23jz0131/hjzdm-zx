package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.UserBrowseHistory;
import com.wray.hjzdm.mapper.GoodsMapper;
import com.wray.hjzdm.mapper.UserBrowseHistoryMapper;
import com.wray.hjzdm.service.UserBrowseHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Service
public class UserBrowseHistoryServiceImpl extends ServiceImpl<UserBrowseHistoryMapper, UserBrowseHistory> implements UserBrowseHistoryService {

    @Autowired
    private GoodsMapper goodsMapper;

    @Override
    public void addHistory(OperateDTO operateDto) {
        if (operateDto.getUserId() == null || operateDto.getGoodsId() == null) {
            return;
        }

        // Check if exists
        UserBrowseHistory exists = this.getOne(new LambdaQueryWrapper<UserBrowseHistory>()
                .eq(UserBrowseHistory::getUserId, operateDto.getUserId())
                .eq(UserBrowseHistory::getGoodsId, operateDto.getGoodsId()));

        if (exists != null) {
            exists.setBrowseTime(new Date());
            this.updateById(exists);
        } else {
            UserBrowseHistory history = UserBrowseHistory.builder()
                    .userId(operateDto.getUserId())
                    .goodsId(operateDto.getGoodsId())
                    .browseTime(new Date())
                    .build();
            this.save(history);
        }
    }

    @Override
    public List<Goods> queryHistory(QueryDTO queryDto) {
        if (queryDto.getUserId() == null) {
            return new ArrayList<>();
        }
        return goodsMapper.queryBrowseHistory(queryDto.getUserId());
    }

    @Override
    public void clearHistory(Long userId) {
        if (userId == null) {
            return;
        }
        this.remove(new LambdaQueryWrapper<UserBrowseHistory>().eq(UserBrowseHistory::getUserId, userId));
    }

    @Override
    public void deleteHistory(Long userId, Long goodsId) {
        if (userId == null || goodsId == null) {
            return;
        }
        this.remove(new LambdaQueryWrapper<UserBrowseHistory>()
                .eq(UserBrowseHistory::getUserId, userId)
                .eq(UserBrowseHistory::getGoodsId, goodsId));
    }
}
