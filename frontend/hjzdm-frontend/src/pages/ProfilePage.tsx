// 个人资料页面组件
// 负责展示和管理用户的个人信息、功能统计等
import React, { useState, useEffect } from 'react';
import { userApi, disclosureApi, notificationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

import { useWebSocket } from '../services/websocketService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // 用户基本信息状态
  const [profile, setProfile] = useState<{ id: number; name: string; nickname?: string; avatar?: string; gender?: number; age?: number; birthDate?: string } | null>(null);
  
  // 错误信息状态
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // 移除编辑模式状态

  // 功能统计计数状态
  const [featureCounts, setFeatureCounts] = useState([
    { id: 4, name: 'マイ投稿', icon: '📢', count: 0 },
    { id: 5, name: '通知', icon: '🔔', count: 0 }
  ]);

  // 使用WebSocket服务接收实时通知
  // 监听消息事件并相应地更新UI
  useWebSocket({
    onMessage: (message) => {
      console.log('Received WebSocket message in Profile:', message);
      if (message.type === 'notification') {
        // 收到新通知时刷新通知计数
        loadNotificationCount();
      }
    },
    onOpen: () => {
      console.log('WebSocket connected for profile');
    },
    onClose: (event) => {
      console.log('WebSocket disconnected from profile:', event);
    },
    onError: (error) => {
      console.error('WebSocket error in profile:', error);
    },
    onNotification: (notification) => {
      console.log('Received notification via WebSocket in profile:', notification);
      // 收到实时通知时更新通知计数
      loadNotificationCount();
    }
  });

  // 组件挂载时加载用户数据
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * 加载通知计数
   * 获取用户未读通知数量并更新状态
   */
  const loadNotificationCount = async () => {
    try {
      const notiRes = await notificationApi.getMyNotifications();
      if (notiRes?.data?.code === 200) {
        const notiList = notiRes?.data?.data || [];
        const unreadList = notiList.filter((n: { isRead: number }) => n.isRead === 0);

        let notiCount = 0;
        if (unreadList.length > 0) {
          // 检查最新消息时间是否比上次点击时间更新
          const latestMsg = unreadList[0]; // 假设后端已按时间倒序返回
          const latestTime = new Date(latestMsg.createTime).getTime();
          const lastCheck = parseInt(localStorage.getItem('last_notification_check_time') || '0');

          if (latestTime > lastCheck) {
            notiCount = unreadList.length;
          }
        }

        setFeatureCounts(prev =>
          prev.map(item => {
            if (item.id === 5) return { ...item, count: notiCount };
            return item;
          })
        );
      }
    } catch (notiError) {
      console.warn('通知情報取得エラー:', notiError);
    }
  };

  /**
   * 加载用户数据
   * 获取用户基本信息、投稿统计和通知信息
   * 包含完善的错误处理和降级机制
   */
  const loadUserData = async () => {
    try {
      // 获取用户基本信息
      const meRes = await userApi.getProfile();
      
      // 更严格的错误检查
      if (!meRes) {
        // 如果API调用失败，使用模拟数据
        console.warn('API调用失败，使用模拟数据');
        setProfile({
          id: 1,
          name: 'テストユーザー',
          nickname: 'テストニックネーム',
          gender: 1,
          birthDate: '1990-01-01'
        });
        setErrorMsg('API接続エラーのため、テストデータを表示しています');
        return;
      }
      
      if (!meRes.data) {
        // 如果响应数据为空，使用模拟数据
        console.warn('API响应数据为空，使用模拟数据');
        setProfile({
          id: 1,
          name: 'テストユーザー',
          nickname: 'テストニックネーム',
          gender: 1,
          birthDate: '1990-01-01'
        });
        setErrorMsg('APIデータエラーのため、テストデータを表示しています');
        return;
      }
      
      // 检查多种可能的成功状态码
      const successCodes = [200, 0, '200', '0'];
      const isSuccessful = successCodes.includes(meRes.data.code) || 
                          (meRes.data.code === undefined && meRes.data.data);
      
      if (!isSuccessful) {
        const errorMessage = meRes.data.message || meRes.data.msg || `API错误: ${meRes.data.code}`;
        // 即使API返回错误，也显示模拟数据
        console.warn('API返回错误，使用模拟数据:', errorMessage);
        setProfile({
          id: 1,
          name: 'テストユーザー',
          nickname: 'テストニックネーム',
          gender: 1,
          birthDate: '1990-01-01'
        });
        setErrorMsg(`APIエラー: ${errorMessage} (テストデータを表示)`);
        return;
      }

      const me = meRes.data.data;
      if (!me) {
        // 如果用户数据为空，使用模拟数据
        console.warn('用户数据为空，使用模拟数据');
        setProfile({
          id: 1,
          name: 'テストユーザー',
          nickname: 'テストニックネーム',
          gender: 1,
          birthDate: '1990-01-01'
        });
        setErrorMsg('ユーザー情報が見つかりません。テストデータを表示しています');
        return;
      }

      // 修复日期格式化问题，确保正确显示YYYY-MM-DD格式
      let formattedBirthDate = '';
      if (me.birthDate) {
        const birthDateObj = new Date(me.birthDate);
        // 确保年份是4位数
        const year = birthDateObj.getFullYear();
        const month = String(birthDateObj.getMonth() + 1).padStart(2, '0');
        const day = String(birthDateObj.getDate()).padStart(2, '0');
        formattedBirthDate = `${year}-${month}-${day}`;
      }
      
      setProfile({
        id: me.id,
        name: me.name || `ユーザー${me.id}`,
        nickname: me.nickname,
        avatar: me.avatar,
        birthDate: formattedBirthDate
      });
      
      // 移除编辑表单初始化
      






      try {
        const tipRes = await disclosureApi.getMyDisclosure(1, 100);
        if (tipRes?.data?.code === 200) {
          const tipData = tipRes?.data?.data;
          const tipCount = Array.isArray(tipData) ? tipData.length : (tipData?.records?.length || 0);

          setFeatureCounts(prev =>
            prev.map(item =>
              item.id === 4 ? { ...item, count: tipCount } : item
            )
          );
        }
      } catch (tipError) {
        // 不显示投稿情報错误，以免影響主流程
      }

      // 通知取得
      try {
        const notiRes = await notificationApi.getMyNotifications();
        if (notiRes?.data?.code === 200) {
          const notiList = notiRes?.data?.data || [];
          const unreadList = notiList.filter((n: { isRead: number }) => n.isRead === 0);

          let notiCount = 0;
          if (unreadList.length > 0) {
            // 最新メッセージ時間が前回のクリック時間より新しいかチェック
            const latestMsg = unreadList[0]; // 假设后端已按時間倒序返回
            const latestTime = new Date(latestMsg.createTime).getTime();
            const lastCheck = parseInt(localStorage.getItem('last_notification_check_time') || '0');

            if (latestTime > lastCheck) {
              notiCount = unreadList.length;
            }
          }

          setFeatureCounts(prev =>
            prev.map(item => {
              if (item.id === 5) return { ...item, count: notiCount };
              return item;
            })
          );
        }
      } catch (notiError) {
        // 不显示通知错误，以免影響主流程
      }
    } catch (error: any) {
      // 检查错误类型并提供更精确の错误情報
      if (error.response) {
        // 服务器响应了错误状态码
        console.error('服务器响应错误:', error.response.status, error.response.data);
        
        if (error.response.status === 401) {
          // 401错误可能是因为JWT过期，尝试刷新页面以重新获取令牌
          setErrorMsg('ログイン情報の期限が切れています。ページを再読み込みします。');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (error.response.status === 403) {
          setErrorMsg('アクセス権限がありません。');
        } else if (error.response.status === 405) {
          setErrorMsg('APIエンドポイントが利用できません。システム管理者に連絡してください。(405 Method Not Allowed)');
        } else if (error.response.status >= 500) {
          setErrorMsg('サーバーエラーが発生しました。しばらくしてから再度お試しください。');
        } else {
          const serverMessage = error.response.data?.message || error.response.data?.msg || 'データ取得に失敗しました';
          const displayMessage = serverMessage || `エラーが発生しました (${error.response.status})`;
          setErrorMsg(displayMessage);
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('网络请求无响应:', error.request);
        setErrorMsg('ネットワーク接続エラー。インターネット接続を確認してください。');
      } else {
        // 其他错误
        console.error('其他错误:', error.message);
        const errorMessage = error.message || '不明なエラー';
        setErrorMsg(`予期せぬエラーが発生しました: ${errorMessage}`);
      }
    }
  };

  /**
   * 处理功能卡片点击事件
   * 根据不同的功能ID导航到相应的页面
   * @param id 功能卡片ID
   */
  const handleFeatureClick = (id: number) => {
    switch (id) {
      case 4:
        // 跳转到我的投稿页面
        navigate('/my-tip');
        break;
      case 5:
        // 更新最后查看时间，消除红点，并跳转到通知页面
        localStorage.setItem('last_notification_check_time', Date.now().toString());
        navigate('/notifications');
        break;
      default:
        break;
    }
  };

  /**
   * 移除编辑模式切换功能
   */

  /**
   * 移除表单输入处理功能
   */

  /**
   * 计算年龄的辅助函数
   * 根据出生日期计算当前年龄
   * @param birthDate 出生日期字符串（YYYY-MM-DD格式）
   * @returns number 计算得出的年龄
   */
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    // 解析日期字符串，确保正确处理格式
    let birth: Date;
    if (birthDate.includes('T')) {
      // ISO格式日期
      birth = new Date(birthDate);
    } else {
      // YYYY-MM-DD格式日期
      const parts = birthDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 月份从0开始
        const day = parseInt(parts[2], 10);
        birth = new Date(year, month, day);
      } else {
        birth = new Date(birthDate);
      }
    }
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? age : 0;
  };

  /**
   * 移除保存用户资料功能
   */

  // 健康检查函数被移除

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* 主要内容区域 */}
        <div className="main-content">
          {/* 用户头部信息 */}
          <div className="user-header">
            <div className="user-avatar-section">
              <div className="avatar-placeholder">
                <span className="avatar-initials">
                  {(profile?.nickname?.charAt(0) || profile?.name?.charAt(0) || 'U').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="user-info-section">
              <div className="user-main-info">
                <h1 className="user-display-name">
                  {profile?.nickname || profile?.name || 'ユーザー'}
                </h1>
                <div className="user-meta">
                  {profile?.birthDate && (
                    <span className="meta-item">
                      {calculateAge(profile.birthDate)}歳
                    </span>
                  )}
                </div>
              </div>
              
              <div className="edit-action">
                {/* 移除编辑按钮 */}
              </div>
            </div>
          </div>

          {/* 移除编辑表单 */}

          {/* 功能统计卡片 */}
          <div className="stats-section">
            {errorMsg && (
              <div className="error-alert">
                <span className="error-message">{errorMsg}</span>
                <button className="retry-btn" onClick={loadUserData}>
                  再読み込み
                </button>
              </div>
            )}
            
            <div className="stats-grid">
              {featureCounts.map(feature => (
                <div
                  key={feature.id}
                  className="stat-card"
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <div className="stat-icon-wrapper">
                    <span className="stat-icon">{feature.icon}</span>
                    {feature.id === 5 && feature.count > 0 && (
                      <span className="badge-notification">{feature.count}</span>
                    )}
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-name">{feature.name}</h3>
                    <div className="stat-value">{feature.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
        

      </div>
    </div>
  );
};

export default ProfilePage;