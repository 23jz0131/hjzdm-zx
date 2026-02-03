package com.wray.hjzdm.mapper;

import com.wray.hjzdm.config.MyMapper;
import com.wray.hjzdm.entity.DisclosureLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DisclosureLikeMapper extends MyMapper<DisclosureLike> {
    
    @Select("SELECT COUNT(1) > 0 FROM DISCLOSURE_LIKE WHERE USER_ID = #{userId} AND DISCLOSURE_ID = #{disclosureId}")
    boolean existsByUserIdAndDisclosureId(@Param("userId") Long userId, @Param("disclosureId") Long disclosureId);
    
    @Select("SELECT USER_ID FROM DISCLOSURE_LIKE WHERE DISCLOSURE_ID = #{disclosureId} AND USER_ID = #{userId}")
    Long selectUserIdByDisclosureId(@Param("disclosureId") Long disclosureId, @Param("userId") Long userId);
    
    @Select("SELECT COUNT(*) FROM DISCLOSURE_LIKE WHERE DISCLOSURE_ID = #{disclosureId}")
    Integer countLikesByDisclosureId(@Param("disclosureId") Long disclosureId);
}