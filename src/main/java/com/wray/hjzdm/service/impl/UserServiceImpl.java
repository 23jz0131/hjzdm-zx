package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.dto.LocalLoginDTO;
import com.wray.hjzdm.dto.UserLoginDTO;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.entity.User;
import com.wray.hjzdm.mapper.UserMapper;
import com.wray.hjzdm.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Calendar;

/**
 * 用户服务实现类
 * 提供用户管理的核心业务逻辑实现
 * 包括登录认证、用户注册、个人信息管理等功能
 */
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    /** 密码加密器，用于用户密码的安全存储 */
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 本地手机号登录实现
     * 支持手机号自动注册功能，简化用户使用流程
     * @param dto 登录数据传输对象
     * @return User 登录成功的用户对象
     * @throws RuntimeException 当手机号为空或密码不符合要求时抛出异常
     */
    public User localLogin(LocalLoginDTO dto) {

        String phone = dto.getPhone();
        String password = dto.getPassword();

        // 验证手机号是否为空
        if (!StringUtils.hasText(phone)) {
            throw new RuntimeException("手机号不能为空");
        }

        // 查询该手机号是否已存在用户
        User user = this.lambdaQuery()
                .eq(User::getPhone, phone)
                .one();

        // 如果用户不存在，则自动创建新用户
        if (user == null) {
            if (!StringUtils.hasText(password) || password.length() < 6) {
                throw new RuntimeException("密码至少6位");
            }
            user = User.builder()
                    .phone(phone)
                    .name("用户" + phone.substring(Math.max(0, phone.length() - 4)))
                    .password(passwordEncoder.encode(password))
                    .createTime(new Date())
                    .build();
            this.save(user);
        } else {
            if (StringUtils.hasText(user.getPassword())) {
                if (!StringUtils.hasText(password) || !passwordEncoder.matches(password, user.getPassword())) {
                    throw new RuntimeException("用户名或密码错误");
                }
            } else if (StringUtils.hasText(password)) {
                if (password.length() < 6) {
                    throw new RuntimeException("密码至少6位");
                }
                user.setPassword(passwordEncoder.encode(password));
                this.updateById(user);
            }
        }

        return user;
    }
    
    /**
     * 用户名或邮箱登录实现
     * 支持用户名和手机号双重登录方式
     * @param dto 登录数据传输对象
     * @return User 登录成功的用户对象
     * @throws RuntimeException 当用户名或密码错误时抛出异常
     */
    @Override
    public User login(UserLoginDTO dto) {
        String username = dto.getUsername();
        String password = dto.getPassword();

        // 验证用户名和密码是否为空
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 按用户名精确查找用户
        User user = this.lambdaQuery()
                .eq(User::getName, username)
                .one();

        // 注意：已移除手机号查找功能，因为phone字段已被删除
        
        if (user == null || !StringUtils.hasText(user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        return user;
    }
    
    /**
     * 用户注册实现
     * 处理新用户注册流程，包含数据验证和用户创建
     * @param dto 注册数据传输对象
     * @return User 新创建的用户对象
     * @throws RuntimeException 当注册信息不完整或用户名已存在时抛出异常
     */
    @Override
    public User register(UserRegisterDTO dto) {
        // 验证注册信息是否为空
        if (dto == null) {
            throw new RuntimeException("注册信息不能为空");
        }

        // 验证用户名是否为空
        if (!StringUtils.hasText(dto.getUsername())) {
            throw new RuntimeException("用户名不能为空");
        }

        // 验证密码长度是否符合要求
        if (!StringUtils.hasText(dto.getPassword()) || dto.getPassword().length() < 6) {
            throw new RuntimeException("密码至少6位");
        }

        // 检查用户名是否已被占用
        User existingUser = this.lambdaQuery()
                .eq(User::getName, dto.getUsername())
                .one();
        
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 验证两次输入的密码是否一致
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("两次输入的密码不一致");
        }

        // 创建新用户对象
        User user = User.builder()
                .name(dto.getUsername())
                .openid("user_" + System.currentTimeMillis()) // 使用时间戳生成唯一的openid
                .password(passwordEncoder.encode(dto.getPassword())) // 密码加密存储
                .createTime(new Date())
                .build();
        
        // 保存到数据库
        this.save(user);
        
        return user;
    }
    
    /**
     * 获取用户个人资料实现
     * 根据用户ID查询完整的用户信息
     * 包含详细的日志记录和异常处理
     * @param userId 用户唯一标识符
     * @return User 用户对象，如果未找到则返回null
     */
    @Override
    public User getUserProfile(Long userId) {
        try {
            // 验证用户ID是否为空
            if (userId == null) {
                log.warn("用户ID为空，无法获取用户信息");
                return null;
            }
            
            log.debug("正在查询用户信息，用户ID: {}", userId);
            // 从数据库查询用户信息
            User user = this.getById(userId);
            log.debug("数据库查询结果，用户ID: {}, 查询结果: {}", userId, user != null);
            
            // 如果未找到用户，记录调试信息
            if (user == null) {
                log.warn("未找到用户信息，用户ID: {}", userId);
                // 查询所有用户以帮助调试
                List<User> allUsers = this.list();
                log.info("数据库中总共有 {} 个用户，示例用户: {}", allUsers.size(), 
                    allUsers.stream().limit(3).map(u -> u.getId() + ":"+ u.getName()).collect(java.util.stream.Collectors.toList()));
                return null;
            }
            
            return user;
        } catch (Exception e) {
            // 记录获取用户信息时的异常
            log.error("获取用户信息失败，用户ID: {}", userId, e);
            return null;
        }
    }
    
    /**
     * 移除更新用户个人资料实现
     * 个人信息编辑功能已被删除
     */
    
    /**
     * 移除年龄计算方法
     * 相关功能已被删除
     */
    
    /**
     * 重置用户密码实现
     * 用于用户忘记密码时的安全密码重置
     * @param userId 用户ID
     * @param newPassword 新密码
     * @throws RuntimeException 当用户ID为空、密码不符合要求或用户不存在时抛出异常
     */
    @Override
    public void resetPassword(Long userId, String newPassword) {
        // 验证用户ID是否为空
        if (userId == null) {
            throw new RuntimeException("用户ID不能为空");
        }
        
        // 验证新密码是否符合要求
        if (!StringUtils.hasText(newPassword) || newPassword.length() < 6) {
            throw new RuntimeException("密码至少6位");
        }
        
        // 验证用户是否存在
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 对新密码进行加密处理
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        user.setUpdateTime(new Date());
        
        // 更新数据库中的密码
        this.updateById(user);
        
        log.info("用户 {} 的密码已重置", userId);
    }
}