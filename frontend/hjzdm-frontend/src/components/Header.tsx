import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../services/api';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 現在価格比較ページかどうかをチェック
  const isComparePage = location.pathname === '/compare';
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.includes('/admin');
  const isProfilePage = location.pathname.includes('/profile');
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
  const isCommunityPage = location.pathname === '/community';
  const isRegisterPage = location.pathname === '/register'; // Also treat register separately for consistency
  const isDisclosureCollectionPage = location.pathname === '/my-disclosure-collection';
  const isMyTipPage = location.pathname === '/my-tip';

  // デバッグログ
  useEffect(() => {
    // Debug logs removed
  }, [location.pathname, isComparePage, isHomePage, isAdminPage, isProfilePage, isLoginPage, isCommunityPage, isRegisterPage, isDisclosureCollectionPage, isMyTipPage]);

  const syncAuthState = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setUsername('');
      setDisplayName('');
      setIsAdmin(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload?.userId;
      setUsername(userId ? `user${userId}` : 'ユーザー');

      const adminStatus = payload?.userId === 1 || payload?.sub === 'admin' || payload?.username === 'admin' || payload?.name === 'admin';
      setIsAdmin(adminStatus);
      
      // 获取用户详细信息以显示昵称
      fetchUserProfile();
    } catch {
      setUsername('ユーザー');
      setDisplayName('ユーザー');
      setIsAdmin(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.data.code === 200 && response.data.data) {
        const userProfile = response.data.data;
        // 如果设置了昵称，显示昵称；否则显示用户名
        const displayNameToShow = userProfile.nickname || userProfile.name || username;
        setDisplayName(displayNameToShow);
      } else {
        setDisplayName(username);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setDisplayName(username);
    }
  };

  useEffect(() => {
    syncAuthState();
  }, [location.pathname]);

  // 监听localStorage变化，确保用户切换时能及时更新状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 定期检查token状态，确保状态同步
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      const storedPayload = currentToken ? JSON.parse(atob(currentToken.split('.')[1])) : null;
      const currentUserId = storedPayload?.userId;
      
      // 如果用户ID发生变化，重新同步
      if (isLoggedIn && currentUserId && currentUserId !== parseInt(username.replace('user', ''))) {
        syncAuthState();
      }
    }, 1000); // 每秒检查一次

    return () => clearInterval(interval);
  }, [isLoggedIn, username]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setDisplayName('');
    setIsAdmin(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('query')?.toString();
    if (query) {
      // 価格比較ページにリダイレクトし、検索パラメータを渡すことができます
      navigate(`/compare?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <Link to="/">惠購価格比較</Link>
        </div>
        <nav className="nav">
          <Link to="/">ホーム</Link>
          <Link to="/compare">価格比較</Link>
          <Link to="/community">みんなの投稿</Link>
          {isAdmin && <Link to="/admin/disclosures" style={{ color: '#ff4d4f' }}>投稿審査</Link>}
          <Link to={isLoggedIn ? '/profile' : '/login'}>マイページ</Link>
        </nav>
        <div className="user-actions">
          {isLoggedIn ? (
            <>
              <span className="user-name">{displayName || username}</span>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link auth-primary">ログイン</Link>
              <Link to="/register" className="auth-link">新規登録</Link>
            </>
          )}
        </div>
      </div>
      {!isComparePage && !isHomePage && !isAdminPage && !isProfilePage && !isLoginPage && !isCommunityPage && !isRegisterPage && !isDisclosureCollectionPage && !isMyTipPage && (
        <div className="header-search">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              name="query" 
              placeholder="商品を検索..." 
              className="search-input"
            />
            <button type="submit" className="search-button">検索</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;