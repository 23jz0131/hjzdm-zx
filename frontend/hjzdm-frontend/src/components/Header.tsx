import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查当前是否在比价页面
  const isComparePage = location.pathname === '/compare';
  const isHomePage = location.pathname === '/';

  const syncAuthState = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setUsername('');
      setIsAdmin(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload?.userId;
      setUsername(userId ? `ユーザー${userId}` : 'ユーザー');

      const adminStatus = payload?.userId === 1 || payload?.sub === 'admin' || payload?.username === 'admin' || payload?.name === 'admin';
      setIsAdmin(adminStatus);
    } catch {
      setUsername('ユーザー');
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    syncAuthState();
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setIsAdmin(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('query')?.toString();
    if (query) {
      // 可以跳转到比价页面并传递搜索参数
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
          {isLoggedIn && <Link to="/browse-history">閲覧履歴</Link>}
          {isAdmin && <Link to="/admin/disclosures" style={{ color: '#ff4d4f' }}>投稿審査</Link>}
          <Link to={isLoggedIn ? '/profile' : '/login'}>マイページ</Link>
        </nav>
        <div className="user-actions">
          {isLoggedIn ? (
            <>
              <span className="user-name">{username}</span>
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
      {!isComparePage && !isHomePage && (
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
