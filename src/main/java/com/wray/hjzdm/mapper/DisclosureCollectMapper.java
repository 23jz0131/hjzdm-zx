package com.wray.hjzdm.mapper;

import com.wray.hjzdm.config.MyMapper;
import com.wray.hjzdm.entity.DisclosureCollect;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DisclosureCollectMapper extends MyMapper<DisclosureCollect> {
    
    @Select("SELECT COUNT(1) > 0 FROM disclosure_collect WHERE user_id = #{userId} AND disclosure_id = #{disclosureId}")
    boolean existsByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT id FROM disclosure_collect WHERE user_id = #{userId} AND disclosure_id = #{disclosureId}")
    Long selectCollectIdByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT COUNT(*) FROM disclosure_collect WHERE disclosure_id = #{disclosureId}")
    Integer countCollectsByDisclosureId(@Param("disclosureId") Long disclosureId);
}