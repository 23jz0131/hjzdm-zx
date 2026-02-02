package com.wray.hjzdm.mapper;

import com.wray.hjzdm.config.MyMapper;
import com.wray.hjzdm.entity.DisclosureLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DisclosureLikeMapper extends MyMapper<DisclosureLike> {
    
    @Select("SELECT COUNT(1) > 0 FROM disclosure_like WHERE user_id = #{userId} AND disclosure_id = #{disclosureId}")
    boolean existsByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT user_id FROM disclosure_like WHERE disclosure_id = #{disclosureId} AND user_id = #{userId}")
    Long selectUserIdByDisclosureId(@Param("disclosureId") Long disclosureId, @Param("userId") Long userId);
    
    @Select("SELECT COUNT(*) FROM disclosure_like WHERE disclosure_id = #{disclosureId}")
    Integer countLikesByDisclosureId(@Param("disclosureId") Long disclosureId);
}