package com.wray.hjzdm.mapper;

import com.wray.hjzdm.config.MyMapper;
import com.wray.hjzdm.entity.DisclosureCollect;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DisclosureCollectMapper extends MyMapper<DisclosureCollect> {
    
    @Select("SELECT COUNT(1) > 0 FROM DISCLOSURE_COLLECT WHERE USER_ID = #{userId} AND DISCLOSURE_ID = #{disclosureId}")
    boolean existsByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT ID FROM DISCLOSURE_COLLECT WHERE USER_ID = #{userId} AND DISCLOSURE_ID = #{disclosureId}")
    Long selectCollectIdByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT COUNT(*) FROM DISCLOSURE_COLLECT WHERE DISCLOSURE_ID = #{disclosureId}")
    Integer countCollectsByDisclosureId(@Param("disclosureId") Long disclosureId);
}