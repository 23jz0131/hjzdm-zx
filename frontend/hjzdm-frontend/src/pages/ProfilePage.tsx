import React, { useState, useEffect } from 'react';
import { goodsApi, userApi, disclosureApi, notificationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { useWebSocket } from '../services/websocketService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const isAdmin = (() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.userId === 1;
    } catch {
      return false;
    }
  })();

  const [profile, setProfile] = useState<{ id: number; name: string; nickname?: string; avatar?: string; gender?: number; age?: number; birthDate?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // 控制编辑状态
  const [editForm, setEditForm] = useState({
    name: '',
    nickname: '',
    gender: 0,
    age: 0,
    birthDate: ''
  });

  const [featureCounts, setFeatureCounts] = useState([
    { id: 1, name: 'マイコレクション', icon: '❤️', count: 0 },
    { id: 2, name: '閲覧履歴', icon: '🕒', count: 0 },
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
          // 検查最新メッセージ時間是否晚于上次クリック時間
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
      // 获取用户基本信息
      const meRes = await userApi.getProfile();
      if (meRes?.data?.code !== 200) {
        setErrorMsg(meRes?.data?.message || 'ユーザー情報の取得に失敗しました');
        console.warn('ユーザー情報取得APIエラー:', meRes?.data?.message);
        return;
      }

      const me = meRes?.data?.data;
      if (!me) {
        setErrorMsg('ユーザー情報が見つかりません');
        return;
      }

      setProfile({
        id: me.id,
        name: me.name || `ユーザー${me.id}`,
        nickname: me.nickname,
        avatar: me.avatar,
        gender: me.gender,
        age: me.age,
        birthDate: me.birthDate ? new Date(me.birthDate).toISOString().split('T')[0] : '' // 将日期转换为 YYYY-MM-DD 格式
      });
      // 初始化编辑表单
      setEditForm({
        name: me.name || `ユーザー${me.id}`,
        nickname: me.nickname || '',
        gender: me.gender || 0,
        age: me.age || 0,
        birthDate: me.birthDate ? new Date(me.birthDate).toISOString().split('T')[0] : ''
      });

      // コレクション商品数の取得
      try {
        const collectResponse = await goodsApi.getMyCollect(1, 100);
        if (collectResponse?.data?.code === 200) {
          const collectData = collectResponse?.data?.data;
          const collectCount = Array.isArray(collectData) ? collectData.length : (collectData?.records?.length || 0);

          // コレクション数の更新
          setFeatureCounts(prev =>
            prev.map(item =>
              item.id === 1 ? { ...item, count: collectCount } : item
            )
          );
        }
      } catch (collectError) {
        console.warn('コレクション情報取得エラー:', collectError);
        // 不显示收集错误，以免影響主流程
      }

      // 閲覧履歴の取得
      try {
        const historyResponse = await userApi.getHistory(1, 100);
        if (historyResponse?.data?.code === 200) {
          const historyData = historyResponse?.data?.data;
          const historyCount = Array.isArray(historyData) ? historyData.length : (historyData?.records?.length || 0);

          setFeatureCounts(prev =>
            prev.map(item =>
              item.id === 2 ? { ...item, count: historyCount } : item
            )
          );
        }
      } catch (historyError) {
        console.warn('閲覧履歴取得エラー:', historyError);
        // 不显示浏览历史错误，以免影響主流程
      }

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
            // 検查最新メッセージ時間是否晚于上次クリック時間
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

      // 検查错误类型并提供更精确の错误情報
      if (error.response) {
        // 服务器响应了错误状态码
        if (error.response.status === 401) {
          // 401错误可能是因为JWT过期，尝试刷新页面以重新获取令牌
          setErrorMsg('ログイン情報の期限が切れています。ページを再読み込みします。');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (error.response.status === 403) {
          setErrorMsg('アクセス権限がありません。');
        } else if (error.response.status >= 500) {
          setErrorMsg('サーバーエラーが発生しました。しばらくしてから再度お試しください。');
        } else {
          setErrorMsg(`${error.response.data?.message || 'データ取得に失敗しました。'} (${error.response.status})`);
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        setErrorMsg('ネットワーク接続エラー。インターネット接続を確認してください。');
      } else {
        // 其他错误
        setErrorMsg('予期せぬエラーが発生しました。');
      }
    }
  };

  const handleFeatureClick = (id: number) => {
    switch (id) {
      case 1:
        navigate('/my-collection');
        break;
      case 2:
        navigate('/my-collection');
        break;
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
          gender: profile.gender || 0,
          age: profile.age || 0,
          birthDate: profile.birthDate || ''
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      // 调用API更新用户资料
      const response = await userApi.updateProfile({
        nickname: editForm.nickname,
        gender: editForm.gender,
        age: editForm.age,
        birthDate: editForm.birthDate
      });

      if (response.data.code === 200) {
        // 更新成功，更新本地状态
        setProfile({
          ...profile,
          nickname: editForm.nickname,
          gender: editForm.gender,
          age: editForm.age,
          birthDate: editForm.birthDate
        });
        setIsEditing(false);
        alert('プロフィールが更新されました！');
      } else {
        setErrorMsg(response.data.message || '更新に失敗しました');
      }
    } catch (error) {
      setErrorMsg('プロフィールの更新中にエラーが発生しました');
      console.error('プロフィール更新エラー:', error);
    }
  };

  // 健康检查函数被移除

  return (
    <div className="profile-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="profile-page" style={{ flex: 1, padding: 0, margin: 0, maxWidth: 'none', minHeight: 'auto' }}>
        <div className="profile-header">
          <div className="user-info">
            {!isEditing ? (
              <>
                <h2>{profile?.nickname || profile?.name || 'ユーザー'}</h2>
                <div className="user-details">
                  {profile?.gender !== undefined && profile.gender !== null && (
                    <span>性別: {profile.gender === 1 ? '男性' : profile.gender === 2 ? '女性' : '未設定'}</span>
                  )}
                  {profile?.age && <span>, 年齢: {profile.age}</span>}
                  {profile?.birthDate && <span>, 生年月日: {profile.birthDate}</span>}
                </div>
              </>
            ) : (
              <div className="edit-form">
                <input
                  type="text"
                  name="nickname"
                  value={editForm.nickname}
                  onChange={handleInputChange}
                  placeholder="ニックネーム"
                  className="edit-input"
                />
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleInputChange}
                  className="edit-input"
                >
                  <option value={0}>未設定</option>
                  <option value={1}>男性</option>
                  <option value={2}>女性</option>
                </select>
                <input
                  type="number"
                  name="age"
                  value={editForm.age || ''}
                  onChange={handleInputChange}
                  placeholder="年齢"
                  className="edit-input"
                  min="1"
                  max="120"
                />
                <input
                  type="date"
                  name="birthDate"
                  value={editForm.birthDate}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              </div>
            )}
          </div>
          <div className="edit-button-group">
            {!isEditing ? (
              <button className="edit-profile-btn" onClick={toggleEdit}>プロフィールを編集</button>
            ) : (
              <>
                <button className="save-profile-btn" onClick={handleSave}>保存</button>
                <button className="cancel-edit-btn" onClick={toggleEdit}>キャンセル</button>
              </>
            )}
          </div>
        </div>

        <div className="profile-features">
          {errorMsg && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px 12px', marginBottom: '10px', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{errorMsg}</span>
              <button
                onClick={loadUserData}
                style={{ background: '#ffc107', border: '1px solid #d39e00', color: '#856404', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                再読み込み
              </button>
            </div>
          )}
          {featureCounts.map(feature => (
            <div
              key={feature.id}
              className="feature-item"
              onClick={() => handleFeatureClick(feature.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-name">{feature.name}</div>
              {feature.id === 5 && feature.count > 0 && <div className="feature-count">{feature.count}</div>}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="settings-section">
            <div className="setting-item" onClick={() => navigate('/admin/disclosures')} style={{ cursor: 'pointer' }}>
              <span>管理者：投稿審査</span>
              <span className="arrow">›</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;