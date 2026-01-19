package com.wray.hjzdm.service;

import com.wray.hjzdm.entity.Goods;
import java.util.List;

public interface AmazonService {
    List<Goods> searchGoods(String keyword);
}
