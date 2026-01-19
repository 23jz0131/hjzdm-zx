import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../services/api';
import './RegisterPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误和成功信息
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります。');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('有効なメールアドレスを入力してください。');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 调用真实API - 注册端点
      const response = await userApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      console.log('Response data:', response.data); // 调试日志
      
      if (response.data && response.data.code === 200) {
        setSuccess('登録が完了しました！ログインしてください。');
        // 重置表单
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // 3秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // 尝试从响应中获取错误消息
        const errorMessage = response.data?.message || response.data?.msg || '登録に失敗しました。再試行してください。';
        setError(errorMessage);
      }
    } catch (err: any) {
      // 处理不同的错误情况
      if (err.response) {
        // 服务器响应错误
        switch (err.response.status) {
          case 400:
            setError(err.response.data?.message || '登録情報に誤りがあります。');
            break;
          case 409:
            setError('このユーザー名またはメールアドレスは既に使用されています。');
            break;
          case 500:
            setError('サーバーエラーが発生しました。後ほど再試行してください。');
            break;
          default:
            setError(err.response.data?.message || '登録に失敗しました。再試行してください。');
        }
      } else if (err.request) {
        // 网络错误
        setError(`ネットワーク接続に失敗しました。バックエンド(${apiBaseUrl})が起動しているか確認してください。`);
      } else {
        // 其他错误
        setError('登録中にエラーが発生しました。再試行してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>新規登録</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ユーザー名を入力"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="メールアドレスを入力"
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
              placeholder="パスワードを入力（6文字以上）"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="パスワードを再入力"
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        
        <div className="register-footer">
          <p>すでにアカウントをお持ちですか？ <Link to="/login" className="link">ログイン</Link></p>
          <Link to="/" className="link">トップページへ戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
