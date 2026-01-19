import React, { useState, useEffect } from 'react';
import { goodsApi, userApi, disclosureApi, notificationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
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
  
  const [profile, setProfile] = useState<{ name: string; avatar?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [featureCounts, setFeatureCounts] = useState([
    { id: 1, name: 'マイコレクション', icon: '❤️', count: 0 },
    { id: 2, name: '閲覧履歴', icon: '🕒', count: 0 },
    { id: 4, name: 'マイヒント', icon: '📢', count: 0 },
    { id: 5, name: '通知', icon: '🔔', count: 0 }
  ]);
  
  // ユーザーデータの読み込み
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      const meRes = await userApi.getProfile();
      const me = meRes?.data?.data;
      if (me) {
        setProfile({ name: me.name || `ユーザー${me.id}`, avatar: me.avatar });
      }
      // コレクション商品数の取得
      const collectResponse = await goodsApi.getMyCollect(1, 100);
      const collectData = collectResponse?.data?.data;
      const collectCount = Array.isArray(collectData) ? collectData.length : (collectData?.records?.length || 0);
      
      // コレクション数の更新
      setFeatureCounts(prev => 
        prev.map(item => 
          item.id === 1 ? { ...item, count: collectCount } : item
        )
      );
      
      // 閲覧履歴の取得
      const historyResponse = await userApi.getHistory(1, 100);
      const historyData = historyResponse?.data?.data;
      const historyCount = Array.isArray(historyData) ? historyData.length : (historyData?.records?.length || 0);

      const tipRes = await disclosureApi.getMyDisclosure(1, 100);
      const tipData = tipRes?.data?.data;
      const tipCount = Array.isArray(tipData) ? tipData.length : (tipData?.records?.length || 0);

      // 通知取得
      const notiRes = await notificationApi.getMyNotifications();
      const notiList = notiRes?.data?.data || [];
      const unreadList = notiList.filter((n: any) => n.isRead === 0);
      
      let notiCount = 0;
      if (unreadList.length > 0) {
        // 检查最新消息时间是否晚于上次点击时间
        const latestMsg = unreadList[0]; // 假设后端已按时间倒序返回
        const latestTime = new Date(latestMsg.createTime).getTime();
        const lastCheck = parseInt(localStorage.getItem('last_notification_check_time') || '0');
        
        if (latestTime > lastCheck) {
          notiCount = unreadList.length;
        }
      }
      
      setFeatureCounts(prev => 
        prev.map(item => {
          if (item.id === 2) return { ...item, count: historyCount };
          if (item.id === 4) return { ...item, count: tipCount };
          if (item.id === 5) return { ...item, count: notiCount };
          return item;
        })
      );
    } catch (error) {
      setErrorMsg('データ取得に失敗しました。後ほど再試行してください');
      console.warn('ユーザーデータの読み込みに失敗:', error);
    }
  };
  
  const handleFeatureClick = (id: number) => {
    switch(id) {
      case 1:
        navigate('/my-collection');
        break;
      case 2:
        navigate('/browse-history');
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

  return (
    <div className="profile-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="profile-page" style={{ flex: 1, padding: 0, margin: 0, maxWidth: 'none', minHeight: 'auto' }}>
      <div className="profile-header">
        <div className="avatar-section">
          <img src={profile?.avatar || 'https://placehold.co/60x60'} alt="アバター" className="avatar" />
          <div className="user-info">
            <h2>{profile?.name || 'ユーザー'}</h2>
          </div>
        </div>
      </div>

      <div className="profile-features">
        {errorMsg && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px 12px', marginBottom: '10px', borderRadius: '2px' }}>
            {errorMsg}
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
