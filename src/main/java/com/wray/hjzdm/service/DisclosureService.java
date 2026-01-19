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

    void like(Long userId, Long disclosureId);
    void unlike(Long userId, Long disclosureId);
    void collect(Long userId, Long disclosureId);
    void uncollect(Long userId, Long disclosureId);
}
