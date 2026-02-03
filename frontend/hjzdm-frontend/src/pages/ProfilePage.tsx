import React, { useState, useEffect } from 'react';
import { userApi, disclosureApi, notificationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { useWebSocket } from '../services/websocketService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();



  const [profile, setProfile] = useState<{ id: number; name: string; nickname?: string; avatar?: string; gender?: number; age?: number; birthDate?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // 控制编辑状态
  const [editForm, setEditForm] = useState({
    name: '',
    nickname: '',
    gender: 0,
    birthDate: ''
  });

  const [featureCounts, setFeatureCounts] = useState([
    { id: 4, name: 'マイヒント', icon: '📢', count: 0 },
    { id: 5, name: '通知', icon: '🔔', count: 0 }
  ]);

  // 使用WebSocket接收实时通知
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

  // ユーザーデータの読み込み
  useEffect(() => {
    loadUserData();
  }, []);

  const loadNotificationCount = async () => {
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
      console.warn('通知情報取得エラー:', notiError);
    }
  };

  const loadUserData = async () => {
    try {
      console.log('开始获取用户信息...');
      
      // 获取用户基本信息
      const meRes = await userApi.getProfile();
      
      console.log('API响应原始数据:', meRes);
      console.log('API响应数据结构:', {
        hasData: !!meRes.data,
        dataKeys: meRes.data ? Object.keys(meRes.data) : [],
        code: meRes.data?.code,
        message: meRes.data?.message,
        dataContent: meRes.data?.data
      });
      
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
      console.log('状态码检查:', {
        actualCode: meRes.data.code,
        codeType: typeof meRes.data.code,
        isInSuccessCodes: successCodes.includes(meRes.data.code),
        hasDataField: !!meRes.data.data,
        backupCondition: (meRes.data.code === undefined && meRes.data.data)
      });
      
      const isSuccessful = successCodes.includes(meRes.data.code) || 
                          (meRes.data.code === undefined && meRes.data.data);
      
      console.log('最终判断结果:', { isSuccessful });
      
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
        gender: me.gender,
        birthDate: formattedBirthDate
      });
      
      // 初始化编辑表单
      setEditForm({
        name: me.name || `ユーザー${me.id}`,
        nickname: me.nickname || '',
        gender: me.gender || 0,
        birthDate: formattedBirthDate
      });
      
      console.log('用户数据加载完成:', {
        profile: me,
        formattedBirthDate: formattedBirthDate
      });





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
        console.warn('投稿情報取得エラー:', tipError);
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
        console.warn('通知情報取得エラー:', notiError);
        // 不显示通知错误，以免影響主流程
      }
    } catch (error: any) {
      console.error('ユーザーデータ全体の読み込みエラー:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });

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

  const handleFeatureClick = (id: number) => {
    switch (id) {
      case 4:
        navigate('/my-tip');
        break;
      case 5:
        // 更新最后查看时间，消除红点
        localStorage.setItem('last_notification_check_time', Date.now().toString());
        navigate('/notifications');
        break;
      default:
        break;
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // 取消编辑，恢复原始数据
      if (profile) {
        setEditForm({
          name: profile.name || `ユーザー${profile.id}`,
          nickname: profile.nickname || '',
          gender: profile.gender !== undefined && profile.gender !== null ? profile.gender : 0,
          birthDate: profile.birthDate || ''
        });
        setErrorMsg(null); // 清除错误信息
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 特殊处理gender字段，确保传给后端的是数字类型
    if (name === 'gender') {
      setEditForm(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 计算年龄的辅助函数
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

  const handleSave = async () => {
    if (!profile) return;

    try {
      console.log('准备更新用户资料:', {
        nickname: editForm.nickname,
        gender: editForm.gender,
        genderType: typeof editForm.gender,
        birthDate: editForm.birthDate
      });

      // 调用API更新用户资料
      const response = await userApi.updateProfile({
        nickname: editForm.nickname,
        gender: editForm.gender,
        birthDate: editForm.birthDate
      });

      console.log('API响应完整数据:', response);
      console.log('API响应数据结构:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        code: response.data?.code,
        message: response.data?.message,
        msg: response.data?.msg,
        dataContent: response.data?.data
      });

      // 更宽松的成功判断
      const successCodes = [200, 0, '200', '0'];
      const isSuccessful = successCodes.includes(response.data?.code) || 
                          (response.data?.code === undefined && response.data?.data);
      
      if (isSuccessful) {
        // 更新成功，更新本地状态
        setProfile({
          ...profile,
          nickname: editForm.nickname,
          gender: editForm.gender,
          birthDate: editForm.birthDate
        });
        setIsEditing(false);
        alert('プロフィールが更新されました！');
        setErrorMsg(null); // 清除错误信息
      } else {
        const errorMsg = response.data?.message || response.data?.msg || '更新に失敗しました';
        setErrorMsg(`更新失败: ${errorMsg}`);
        console.error('更新失败详情:', {
          code: response.data?.code,
          message: errorMsg,
          fullResponse: response.data
        });
      }
    } catch (error: any) {
      console.error('=== 个人信息更新错误详情 ===');
      console.error('错误对象:', error);
      
      let displayErrorMsg = 'プロフィールの更新中にエラーが発生しました';
      
      if (error.response) {
        // 服务器响应了错误状态码
        console.error('服务器响应错误:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        const serverMessage = error.response.data?.message || 
                             error.response.data?.msg || 
                             `HTTP ${error.response.status}`;
        displayErrorMsg = `サーバーエラー: ${serverMessage}`;
        
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('网络请求无响应:', error.request);
        displayErrorMsg = 'ネットワーク接続エラー。サーバーに接続できません。';
        
      } else {
        // 其他错误
        console.error('其他错误:', error.message);
        displayErrorMsg = `予期せぬエラー: ${error.message}`;
      }
      
      setErrorMsg(displayErrorMsg);
      console.error('===========================');
    }
  };

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
                  {profile?.gender !== undefined && profile.gender !== null && (
                    <span className="meta-item">
                      {profile.gender === 1 ? '男性' : profile.gender === 2 ? '女性' : '未設定'}
                    </span>
                  )}
                  {profile?.birthDate && (
                    <span className="meta-item">
                      {calculateAge(profile.birthDate)}歳
                    </span>
                  )}
                </div>
              </div>
              
              <div className="edit-action">
                {!isEditing ? (
                  <>
                    <button className="edit-profile-btn" onClick={toggleEdit}>
                      <span className="btn-icon">✏️</span>
                      編集
                    </button>
                    {/* 测试按钮 - 仅在开发时使用 */}
                    <button 
                      className="test-btn" 
                      onClick={async () => {
                        try {
                          const testResponse = await userApi.getProfile();
                          console.log('测试API连接:', testResponse);
                          console.log('测试数据结构:', {
                            hasData: !!testResponse.data,
                            dataKeys: testResponse.data ? Object.keys(testResponse.data) : [],
                            code: testResponse.data?.code,
                            message: testResponse.data?.message,
                            dataContent: testResponse.data?.data
                          });
                          alert(`API连接正常\n状态码: ${testResponse.data?.code}\n数据: ${!!testResponse.data?.data}`);
                        } catch (error) {
                          console.error('API连接测试失败:', error);
                          alert('API连接失败');
                        }
                      }}
                      style={{ marginLeft: '10px', fontSize: '12px', padding: '4px 8px' }}
                    >
                      テスト
                    </button>
                  </>
                ) : (
                  <div className="edit-actions-inline">
                    <button className="save-btn" onClick={handleSave}>保存</button>
                    <button className="cancel-btn" onClick={toggleEdit}>キャンセル</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 编辑表单（仅在编辑模式下显示） */}
          {isEditing && (
            <div className="edit-form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">ニックネーム</label>
                  <input
                    type="text"
                    name="nickname"
                    value={editForm.nickname}
                    onChange={handleInputChange}
                    placeholder="ニックネーム"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">性別</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value={0}>未設定</option>
                    <option value={1}>男性</option>
                    <option value={2}>女性</option>
                  </select>
                </div>
                

                
                <div className="form-group">
                  <label className="form-label">生年月日</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={editForm.birthDate}
                    onChange={handleInputChange}
                    className="form-input"
                    max="2020-12-31"  // 限制最大日期
                    min="1900-01-01"  // 限制最小日期
                  />
                </div>
              </div>
            </div>
          )}

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
        
        {/* 侧边栏 */}
        <div className="sidebar-content">
          <UserSidebar />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;