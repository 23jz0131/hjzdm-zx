package com.wray.hjzdm.service;

import java.util.List;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Disclosure;
public interface DisclosureService extends IService<Disclosure> {
    List<Disclosure> queryDisclosure(Long goodsId);

    List<Disclosure> queryMyDisclosure(QueryDTO queryDto);

    List<Disclosure> queryPendingDisclosure(QueryDTO queryDto);

    Disclosure getDisclosure(Long disclosureId);

    boolean addDisclosure(Disclosure disclosure);

    boolean delete(Long disclosureId);

    boolean auditDisclosure(Long disclosureId, Integer status);

    List<Disclosure> queryPublicDisclosure(QueryDTO queryDto);

    boolean like(Long userId, Long disclosureId);
    boolean unlike(Long userId, Long disclosureId);
    boolean isLikedByUser(Long userId, Long disclosureId);
    Long getLikeCount(Long disclosureId);
    boolean collect(Long userId, Long disclosureId);
    boolean uncollect(Long userId, Long disclosureId);
    boolean isCollectedByUser(Long userId, Long disclosureId);
    Long getCollectCount(Long disclosureId);
    List<Disclosure> queryMyCollect(QueryDTO queryDto);
}