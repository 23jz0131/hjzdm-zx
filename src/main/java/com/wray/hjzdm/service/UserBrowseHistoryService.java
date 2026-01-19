package com.wray.hjzdm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.UserBrowseHistory;
import java.util.List;

public interface UserBrowseHistoryService extends IService<UserBrowseHistory> {
    void addHistory(OperateDTO operateDto);
    List<Goods> queryHistory(QueryDTO queryDto);
    void clearHistory(Long userId);
    void deleteHistory(Long userId, Long goodsId);
}
