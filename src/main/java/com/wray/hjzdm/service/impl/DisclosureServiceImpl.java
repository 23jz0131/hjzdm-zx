package com.wray.hjzdm.service.impl;
import java.sql.Date;
import java.util.List;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Comment;
import com.wray.hjzdm.entity.Disclosure;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.mapper.CommentMapper;
import com.wray.hjzdm.mapper.DisclosureMapper;
import com.wray.hjzdm.service.DisclosureService;
import com.wray.hjzdm.service.GoodsService;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.wray.hjzdm.common.Constants;

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
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private com.wray.hjzdm.service.NotificationService notificationService;

    private boolean isAdmin() {
        Long currentId = BaseContext.getCurrentId();
        if (currentId == null) return false;
        if (ADMIN_USER_ID.equals(currentId)) return true;
        
        com.wray.hjzdm.entity.User user = userMapper.selectById(currentId);
        return user != null && "admin".equals(user.getName());
    }

    @Override
    public List<Disclosure> queryDisclosure(Long goodsId) {
        return this.baseMapper.selectList(new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getGoodsId, goodsId)
                .orderByAsc(Disclosure::getCreateTime));
    }

    @Override
    public Disclosure getDisclosure(Long disclosureId) {
        return this.baseMapper.selectOne(
                new LambdaQueryWrapper<Disclosure>().eq(Disclosure::getDisclosureId, disclosureId));
    }

    @Override
    public boolean addDisclosure(Disclosure disclosure) {
        if (disclosure.getGoodsId() != null) {
            Goods goods = goodsService.getOne(new LambdaQueryWrapper<Goods>().eq(Goods::getGoodsId, disclosure.getGoodsId()));
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
        if (userId == null || disclosureId == null) {
            return;
        }
        String key = Constants.DISCLOSURE_LIKE + disclosureId;
        stringRedisTemplate.opsForSet().add(key, userId.toString());
    }

    @Override
    public void unlike(Long userId, Long disclosureId) {
        if (userId == null || disclosureId == null) {
            return;
        }
        String key = Constants.DISCLOSURE_LIKE + disclosureId;
        stringRedisTemplate.opsForSet().remove(key, userId.toString());
    }

    @Override
    public void collect(Long userId, Long disclosureId) {
        if (userId == null || disclosureId == null) {
            return;
        }
        String key = Constants.USER_DISCLOSURE_COLLECT + userId;
        stringRedisTemplate.opsForSet().add(key, disclosureId.toString());
    }

    @Override
    public void uncollect(Long userId, Long disclosureId) {
        if (userId == null || disclosureId == null) {
            return;
        }
        String key = Constants.USER_DISCLOSURE_COLLECT + userId;
        stringRedisTemplate.opsForSet().remove(key, disclosureId.toString());
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
        return pageInfo.getList();
    }

    @Override
    public List<Disclosure> queryPublicDisclosure(QueryDTO queryDto) {
        PageHelper.startPage(queryDto.getPageNum(), queryDto.getPageSize());
        List<Disclosure> disclosureList = this.baseMapper.selectList(
                new LambdaQueryWrapper<Disclosure>()
                        .eq(Disclosure::getStatus, 1)
                        .orderByDesc(Disclosure::getCreateTime));
        PageInfo<Disclosure> pageInfo = new PageInfo<>(disclosureList);
        return pageInfo.getList();
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
        return pageInfo.getList();
    }
}
