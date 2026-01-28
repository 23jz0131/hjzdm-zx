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

@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User localLogin(LocalLoginDTO dto) {

        String phone = dto.getPhone();
        String password = dto.getPassword();

        if (!StringUtils.hasText(phone)) {
            throw new RuntimeException("手机号不能为空");
        }

        // 先查是否已有用户
        User user = this.lambdaQuery()
                .eq(User::getPhone, phone)
                .one();

        // 没有就自动注册一个
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
    
    @Override
    public User login(UserLoginDTO dto) {
        String username = dto.getUsername();
        String password = dto.getPassword();

        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 首先尝试按用户名查找
        User user = this.lambdaQuery()
                .eq(User::getName, username)
                .one();

        // 如果没找到，尝试按邮箱查找（使用openid字段存储邮箱）
        if (user == null) {
            user = this.lambdaQuery()
                .eq(User::getOpenid, username)
                .one();
        }

        // 如果没找到，尝试按手机号查找
        if (user == null) {
            user = this.lambdaQuery()
                    .eq(User::getPhone, username)
                    .one();
        }
        
        if (user == null || !StringUtils.hasText(user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        return user;
    }
    
    @Override
    public User register(UserRegisterDTO dto) {
        if (dto == null) {
            throw new RuntimeException("注册信息不能为空");
        }

        if (!StringUtils.hasText(dto.getUsername())) {
            throw new RuntimeException("用户名不能为空");
        }

        if (!StringUtils.hasText(dto.getEmail())) {
            throw new RuntimeException("邮箱不能为空");
        }

        if (!StringUtils.hasText(dto.getPassword()) || dto.getPassword().length() < 6) {
            throw new RuntimeException("密码至少6位");
        }

        // 检查用户名是否已存在
        User existingUser = this.lambdaQuery()
                .eq(User::getName, dto.getUsername())
                .one();
        
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 检查邮箱是否已存在（暂时注释，因为数据库可能没有email字段）
        // existingUser = this.lambdaQuery()
        //         .eq(User::getEmail, dto.getEmail())
        //         .one();
        // 
        // if (existingUser != null) {
        //     throw new RuntimeException("邮箱已被注册");
        // }
        
        // 检查密码是否一致
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("两次输入的密码不一致");
        }

        User existingAccount = this.lambdaQuery()
                .eq(User::getOpenid, dto.getEmail())
                .one();
        if (existingAccount != null) {
            throw new RuntimeException("邮箱已被注册");
        }
        
        // 创建新用户
        User user = User.builder()
                .name(dto.getUsername())
                .openid(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .createTime(new Date())
                .build();
        
        this.save(user);
        
        return user;
    }
    
    @Override
    public User getUserProfile(Long userId) {
        try {
            if (userId == null) {
                log.warn("用户ID为空，无法获取用户信息");
                return null;
            }
            
            log.debug("正在查询用户信息，用户ID: {}", userId);
            User user = this.getById(userId);
            log.debug("数据库查询结果，用户ID: {}, 查询结果: {}", userId, user != null);
            
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
            log.error("获取用户信息失败，用户ID: {}", userId, e);
            return null;
        }
    }
    
    @Override
    public User updateUserProfile(Long userId, String avatar, String nickname, String name, Integer gender, Integer age, Date birthDate) {
        User user = this.getById(userId);
        if (user != null) {
            if (avatar != null) {
                user.setAvatar(avatar);
            }
            if (nickname != null) {
                user.setNickname(nickname);
            }
            if (name != null) {
                user.setName(name);
            }
            if (gender != null) {
                user.setGender(gender);
            }
            if (age != null) {
                user.setAge(age);
            }
            if (birthDate != null) {
                user.setBirthDate(birthDate);
            }
            
            this.updateById(user);
        }
        return user;
    }
}