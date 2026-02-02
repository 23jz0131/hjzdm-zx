package com.wray.hjzdm.service.impl;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Comment;
import com.wray.hjzdm.entity.Disclosure;
import com.wray.hjzdm.entity.DisclosureLike;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.mapper.CommentMapper;
import com.wray.hjzdm.mapper.DisclosureLikeMapper;
import com.wray.hjzdm.mapper.DisclosureCollectMapper;
import com.wray.hjzdm.entity.DisclosureCollect;
import com.wray.hjzdm.mapper.DisclosureMapper;
import com.wray.hjzdm.service.DisclosureService;
import com.wray.hjzdm.service.GoodsService;

@Service
public class DisclosureServiceImpl extends ServiceImpl<DisclosureMapper, Disclosure> implements DisclosureService {

    private static final Long ADMIN_USER_ID = 1L;

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private com.wray.hjzdm.mapper.UserMapper userMapper;

    @Autowired
    private DisclosureLikeMapper disclosureLikeMapper;
    
    @Autowired
    private DisclosureCollectMapper disclosureCollectMapper;

    // Redis removed
    // @Autowired
    // private StringRedisTemplate stringRedisTemplate;

    // ... (helper methods preserved if any were between the deleted lines?)
    // Actually the target content spans from StringRedisTemplate definition down to
    // uncollect method.
    // I need to be careful not to delete `isAdmin`.
    // Let's break this down.

    // Step 1: Remove field.
    // Step 2: Empty methods.

    // I will use multi_replace to be safe and precise.

    @Autowired
    private com.wray.hjzdm.service.NotificationService notificationService;

    private boolean isAdmin() {
        Long currentId = BaseContext.getCurrentId();
        if (currentId == null)
            return false;
        if (ADMIN_USER_ID.equals(currentId))
            return true;

        com.wray.hjzdm.entity.User user = userMapper.selectById(currentId);
        return user != null && "admin".equals(user.getName());
    }

    @Override
    public List<Disclosure> queryDisclosure(Long goodsId) {
        List<Disclosure> disclosureList = this.baseMapper.selectList(new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getGoodsId, goodsId)
                .orderByAsc(Disclosure::getCreateTime));
        
        // 为每个披露添加点赞和收藏信息
        Long currentUserId = BaseContext.getCurrentId();
        return disclosureList.stream().map(disclosure -> {
            disclosure.setLikeCount(getLikeCount(disclosure.getDisclosureId()));
            disclosure.setLikedByCurrentUser(currentUserId != null && isLikedByUser(currentUserId, disclosure.getDisclosureId()));
            disclosure.setCollectCount(getCollectCount(disclosure.getDisclosureId()).longValue());
            disclosure.setCollectedByCurrentUser(currentUserId != null && isCollectedByUser(currentUserId, disclosure.getDisclosureId()));
            return disclosure;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Disclosure getDisclosure(Long disclosureId) {
        Disclosure disclosure = this.baseMapper.selectOne(
                new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getDisclosureId, disclosureId));
        
        if (disclosure != null) {
            // 添加点赞信息
            Long currentUserId = BaseContext.getCurrentId();
            disclosure.setLikeCount(getLikeCount(disclosureId));
            disclosure.setLikedByCurrentUser(currentUserId != null && isLikedByUser(currentUserId, disclosureId));
        }
        
        return disclosure;
    }

    @Override
    public boolean addDisclosure(Disclosure disclosure) {
        if (disclosure.getGoodsId() != null) {
            Goods goods = goodsService
                    .getOne(new LambdaQueryWrapper<Goods>().eq(Goods::getGoodsId, disclosure.getGoodsId()));
            if (goods == null) {
                return false;
            }
        }

        disclosure.setCreateTime(Date.from(java.time.Instant.now()));
        disclosure.setDisclosureId(null);
        Long userId = BaseContext.getCurrentId();
        disclosure.setAuthor(userId);
        disclosure.setStatus(0); // Default pending

        try {
            int result = this.baseMapper.insert(disclosure);
            return result > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void like(Long userId, Long disclosureId) {
        // 检查是否已点赞，避免重复点赞
        DisclosureLike existingLike = disclosureLikeMapper.selectOne(
            new QueryWrapper<DisclosureLike>()
                .eq("USER_ID", userId)
                .eq("DISCLOSURE_ID", disclosureId)
        );
        
        if (existingLike == null) {
            // 创建新的点赞记录
            DisclosureLike like = DisclosureLike.builder()
                .userId(userId)
                .disclosureId(disclosureId)
                .createTime(java.time.LocalDateTime.now())
                .build();
            disclosureLikeMapper.insert(like);
        }
    }

    @Override
    public void unlike(Long userId, Long disclosureId) {
        // 删除用户的点赞记录
        disclosureLikeMapper.delete(
            new QueryWrapper<DisclosureLike>()
                .eq("USER_ID", userId)
                .eq("DISCLOSURE_ID", disclosureId)
        );
    }

    @Override
    public boolean isLikedByUser(Long userId, Long disclosureId) {
        Long likeId = disclosureLikeMapper.selectUserIdByDisclosureId(userId, disclosureId);
        return likeId != null;
    }

    @Override
    public Long getLikeCount(Long disclosureId) {
        Integer count = disclosureLikeMapper.countLikesByDisclosureId(disclosureId);
        return count != null ? count.longValue() : 0L;
    }

    @Override
    public void collect(Long userId, Long disclosureId) {
        System.out.println("收藏操作: userId=" + userId + ", disclosureId=" + disclosureId);
        // 检查是否已收藏，避免重复收藏
        DisclosureCollect existingCollect = disclosureCollectMapper.selectOne(
            new QueryWrapper<DisclosureCollect>()
                .eq("USER_ID", userId)
                .eq("DISCLOSURE_ID", disclosureId)
        );
        
        if (existingCollect == null) {
            // 创建新的收藏记录
            DisclosureCollect collect = DisclosureCollect.builder()
                .userId(userId)
                .disclosureId(disclosureId)
                .createTime(java.time.LocalDateTime.now())
                .build();
            disclosureCollectMapper.insert(collect);
            System.out.println("新建收藏记录成功");
        } else {
            System.out.println("已存在收藏记录");
        }
    }

    @Override
    public void uncollect(Long userId, Long disclosureId) {
        System.out.println("取消收藏操作: userId=" + userId + ", disclosureId=" + disclosureId);
        // 删除用户的收藏记录
        int result = disclosureCollectMapper.delete(
            new QueryWrapper<DisclosureCollect>()
                .eq("USER_ID", userId)
                .eq("DISCLOSURE_ID", disclosureId)
        );
        System.out.println("删除收藏记录结果: " + result);
    }

    @Override
    public boolean isCollectedByUser(Long userId, Long disclosureId) {
        Long collectId = disclosureCollectMapper.selectCollectIdByUserIdAndDisclosureId(userId, disclosureId);
        return collectId != null;
    }

    @Override
    public Long getCollectCount(Long disclosureId) {
        Integer count = disclosureCollectMapper.countCollectsByDisclosureId(disclosureId);
        System.out.println("获取投稿 " + disclosureId + " 的收藏数: " + count);
        return count != null ? count.longValue() : 0L;
    }

    @Override
    public boolean delete(Long disclosureId) {
        Disclosure disclosure = this.baseMapper.selectOne(
                new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getDisclosureId, disclosureId));

        // 允许作者本人 或 管理员 删除
        if (disclosure == null) {
            return false;
        }

        boolean isAuthor = Objects.equals(disclosure.getAuthor(), BaseContext.getCurrentId());
        if (!isAuthor && !isAdmin()) {
            return false;
        }

        commentMapper.delete(new LambdaQueryWrapper<Comment>().eq(Comment::getDisclosureId, disclosureId));
        this.baseMapper.delete(new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getDisclosureId, disclosureId));
        return true;
    }

    @Override
    public boolean auditDisclosure(Long disclosureId, Integer status) {
        if (!isAdmin()) {
            return false;
        }
        Disclosure disclosure = this.baseMapper.selectById(disclosureId);
        if (disclosure == null) {
            return false;
        }
        disclosure.setStatus(status);
        this.baseMapper.updateById(disclosure);

        // 发送通知
        if (disclosure.getAuthor() != null) {
            String title = "";
            String content = "";
            if (status == 1) {
                title = "投稿公開のお知らせ";
                content = "あなたの投稿「" + (disclosure.getTitle() != null ? disclosure.getTitle() : "無題") + "」が公開されました。";
            } else if (status == 2) {
                title = "投稿却下のお知らせ";
                content = "あなたの投稿「" + (disclosure.getTitle() != null ? disclosure.getTitle() : "無題") + "」は承認されませんでした。";
            }

            if (!title.isEmpty()) {
                notificationService.sendNotification(disclosure.getAuthor(), title, content);
            }
        }

        return true;
    }

    @Override
    public List<Disclosure> queryPendingDisclosure(QueryDTO queryDto) {
        if (!isAdmin()) {
            return new java.util.ArrayList<>();
        }
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        List<Disclosure> disclosureList = this.baseMapper.selectList(
                new LambdaQueryWrapper<Disclosure>()
                        .eq(Disclosure::getStatus, 0)
                        .orderByDesc(Disclosure::getCreateTime));
        PageInfo<Disclosure> pageInfo = new PageInfo<>(disclosureList);
        
        // 为每个披露添加点赞和收藏信息
        Long currentUserId = BaseContext.getCurrentId();
        return pageInfo.getList().stream().map(disclosure -> {
            disclosure.setLikeCount(getLikeCount(disclosure.getDisclosureId()));
            disclosure.setLikedByCurrentUser(currentUserId != null && isLikedByUser(currentUserId, disclosure.getDisclosureId()));
            disclosure.setCollectCount(getCollectCount(disclosure.getDisclosureId()).longValue());
            disclosure.setCollectedByCurrentUser(currentUserId != null && isCollectedByUser(currentUserId, disclosure.getDisclosureId()));
            return disclosure;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Disclosure> queryPublicDisclosure(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        List<Disclosure> disclosureList = this.baseMapper.selectList(
                new LambdaQueryWrapper<Disclosure>()
                        .eq(Disclosure::getStatus, 1)
                        .orderByDesc(Disclosure::getCreateTime));
        PageInfo<Disclosure> pageInfo = new PageInfo<>(disclosureList);
        
        // 为每个披露添加点赞和收藏信息
        Long currentUserId = BaseContext.getCurrentId();
        List<Disclosure> enhancedList = pageInfo.getList().stream().map(disclosure -> {
            disclosure.setLikeCount(getLikeCount(disclosure.getDisclosureId()));
            disclosure.setLikedByCurrentUser(currentUserId != null && isLikedByUser(currentUserId, disclosure.getDisclosureId()));
            disclosure.setCollectCount(getCollectCount(disclosure.getDisclosureId()).longValue());
            disclosure.setCollectedByCurrentUser(currentUserId != null && isCollectedByUser(currentUserId, disclosure.getDisclosureId()));
            return disclosure;
        }).collect(java.util.stream.Collectors.toList());
        
        return enhancedList;
    }

    @Override
    public List<Disclosure> queryMyDisclosure(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return java.util.Collections.emptyList();
        }
        List<Disclosure> disclosureList = this.baseMapper.selectList(
                new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getAuthor, userId));
        PageInfo<Disclosure> pageInfo = new PageInfo<>(disclosureList);
        
        // 为每个披露添加点赞和收藏信息
        return pageInfo.getList().stream().map(disclosure -> {
            disclosure.setLikeCount(getLikeCount(disclosure.getDisclosureId()));
            disclosure.setLikedByCurrentUser(userId != null && isLikedByUser(userId, disclosure.getDisclosureId()));
            disclosure.setCollectCount(getCollectCount(disclosure.getDisclosureId()).longValue());
            disclosure.setCollectedByCurrentUser(userId != null && isCollectedByUser(userId, disclosure.getDisclosureId()));
            return disclosure;
        }).collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public List<Disclosure> queryMyCollect(QueryDTO queryDto) {
        System.out.println("查询我的收藏: userId=" + queryDto.getUserId());
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        Long userId = queryDto.getUserId();
        if (userId == null) {
            System.out.println("用户ID为空");
            return java.util.Collections.emptyList();
        }
        
        // 查询用户收藏的爆料ID列表
        List<DisclosureCollect> collectList = disclosureCollectMapper.selectList(
            new LambdaQueryWrapper<DisclosureCollect>()
                .eq(DisclosureCollect::getUserId, userId)
                .orderByDesc(DisclosureCollect::getCreateTime)
        );
        
        System.out.println("找到收藏记录数: " + collectList.size());
        
        if (collectList.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // 获取收藏的爆料ID
        List<Long> disclosureIds = collectList.stream()
            .map(DisclosureCollect::getDisclosureId)
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("收藏的爆料IDs: " + disclosureIds);
        
        // 批量查询爆料信息
        List<Disclosure> disclosureList = this.baseMapper.selectBatchIds(disclosureIds);
        
        System.out.println("查询到的爆料数: " + disclosureList.size());
        
        // 为每个披露添加点赞和收藏信息
        Long currentUserId = BaseContext.getCurrentId();
        return disclosureList.stream().map(disclosure -> {
            disclosure.setLikeCount(getLikeCount(disclosure.getDisclosureId()));
            disclosure.setLikedByCurrentUser(currentUserId != null && isLikedByUser(currentUserId, disclosure.getDisclosureId()));
            disclosure.setCollectCount(getCollectCount(disclosure.getDisclosureId()).longValue());
            disclosure.setCollectedByCurrentUser(true); // 因为是查询收藏列表，所以都是已收藏
            return disclosure;
        }).collect(java.util.stream.Collectors.toList());
    }
}
