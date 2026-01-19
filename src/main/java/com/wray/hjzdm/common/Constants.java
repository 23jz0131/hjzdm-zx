package com.wray.hjzdm.common;

public class Constants {

    // JWT 中存的 userId
    public static final String USER_ID = "userId";

    // Redis key 前缀
    public static final String GOODS_LIKE = "goods_like:";       // ⭐ 点赞集合
    public static final String USER_COLLECT = "user_collect:";   // ⭐ 收藏集合
    public static final String DISCLOSURE_LIKE = "disclosure_like:";
    public static final String USER_DISCLOSURE_COLLECT = "user_disclosure_collect:";

    // 操作类型
    public static final String LIKE = "0";
    public static final String DISLIKE = "1";
    public static final String COLLECT = "2";
    public static final String UNCOLLECT = "3";
}
