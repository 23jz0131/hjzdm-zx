import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../services/api';

interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: number;
  createTime: string;
}

const NotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getMyNotifications();
      setList(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRead = async (id: number) => {
    // 乐观更新
    setList(prev => prev.map(it => it.id === id ? { ...it, isRead: 1 } : it));
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadAll = async () => {
    setList(prev => prev.map(it => ({ ...it, isRead: 1 })));
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('この通知を削除してもよろしいですか？')) {
      try {
        await notificationApi.deleteNotification(id);
        // 通知リストを更新
        setList(prev => prev.filter(it => it.id !== id));
      } catch (e) {
        console.error(e);
        alert('通知の削除に失敗しました');
      }
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
        <h2 style={{ margin: 0 }}>メッセージ通知</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleReadAll} 
            style={{ padding: '6px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
          >
            全て既読にする
          </button>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
          >
            戻る
          </button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div> : (
        <div>
          {list.length === 0 && <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>通知はありません</div>}
          {list.map(item => (
            <div 
              key={item.id} 
              onClick={() => item.isRead === 0 && handleRead(item.id)}
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid #eee', 
                background: item.isRead === 0 ? '#e6f7ff' : '#fff',
                cursor: item.isRead === 0 ? 'pointer' : 'default',
                transition: 'background 0.3s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  {item.isRead === 0 && <span style={{ color: '#1890ff', marginRight: 6 }}>●</span>}
                  {item.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(item.createTime).toLocaleString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent click handler
                      handleDelete(item.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div style={{ color: '#666', fontSize: 14, lineHeight: 1.5 }}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
