import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../services/api';
import './LoginPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

interface LoginFormData {
  username: string; // 用户名字段
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除之前的错误信息
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 调用真实API - 使用新的login端点
      const response = await userApi.login({
        username: formData.username,
        password: formData.password
      });

      if (response.data && response.data.code === 200) {
        // ログイン成功、ホームページにリダイレクト
        const token = response.data.token || response.data.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        }
        navigate('/');
      } else {
        // 応答からエラーメッセージを取得しようとする
        const errorMessage = response.data?.message || response.data?.msg || 'ログインに失敗しました。再試行してください。';
        setError(errorMessage);
      }
    } catch (err: any) {
      // 处理不同的错误情况
      if (err.response) {
        // 服务器响应错误
        switch (err.response.status) {
          case 401:
            setError('ユーザー名またはパスワードが間違っています。');
            break;
          case 404:
            setError('ユーザーが存在しません。');
            break;
          case 500:
            setError('サーバーエラーが発生しました。後ほど再試行してください。');
            break;
          default:
            setError(err.response.data?.message || 'ログインに失敗しました。再試行してください。');
        }
      } else if (err.request) {
        // 网络错误
        setError(`ネットワーク接続に失敗しました。バックエンド(${apiBaseUrl})が起動しているか確認してください。`);
      } else {
        // 其他错误
        setError('ログイン中にエラーが発生しました。再試行してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>ログイン</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名またはメールアドレス</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ユーザー名またはメールアドレスを入力"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>アカウントをお持ちでないですか？ <Link to="/register" className="link">新規登録</Link></p>
          <Link to="/" className="link">トップページへ戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
