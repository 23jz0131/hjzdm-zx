import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './UserSidebar.css';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isAdmin = (() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.userId === 1 || payload?.sub === 'admin' || payload?.username === 'admin' || payload?.name === 'admin';
    } catch {
      return false;
    }
  })();

  const menuItems = [
    { path: '/profile', label: 'マイページ', icon: '👤' },
    { path: '/my-collection', label: 'マイコレクション', icon: '❤️' },
    { path: '/my-tip', label: 'マイ投稿', icon: '📢' },
    ...(isAdmin ? [{ path: '/admin/disclosures', label: '管理者：投稿審査', icon: '🛡️' }] : [])
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="user-sidebar">
      <div className="sidebar-menu">
        <h3 className="sidebar-title">マイメニュー</h3>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={currentPath === item.path ? 'active' : ''}>
              <Link to={item.path}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
          <li className="logout-item">
            <button onClick={handleLogout} className="sidebar-logout-btn">
              <span className="menu-icon">🚪</span>
              <span className="menu-label">ログアウト</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserSidebar;
