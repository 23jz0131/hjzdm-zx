import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import './ProfileSetupPage.css';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1); // 1: 选择头像, 2: 填写信息
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [gender, setGender] = useState<number>(0); // 0: 未设定, 1: 男性, 2: 女性
  const [birthDate, setBirthDate] = useState<string>('');

  // 默认头像选项
  const defaultAvatars = [
    'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A',
    'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=B',
    'https://via.placeholder.com/150/45B7D1/FFFFFF?text=C',
    'https://via.placeholder.com/150/96CEB4/FFFFFF?text=D',
    'https://via.placeholder.com/150/FFEAA7/FFFFFF?text=E',
    'https://via.placeholder.com/150/DDA0DD/FFFFFF?text=F'
  ];

  const handleNext = () => {
    if (step === 1 && !selectedAvatar) {
      alert('请选择一个头像');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!nickname) {
      alert('请输入昵称');
      return;
    }

    try {
      // 调用API保存用户资料
      const response = await userApi.updateProfile({
        avatar: selectedAvatar,
        nickname,
        gender,
        birthDate: birthDate || null
      });

      if (response.data.code === 200) {
        // 跳转到首页
        navigate('/');
      } else {
        alert(response.data.message || '保存失败，请重试');
      }
    } catch (error) {
      console.error('保存用户资料时发生错误:', error);
      alert('保存失败，请重试');
    }
  };

  const handleSkip = () => {
    // 跳过设置，直接进入首页
    navigate('/');
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h2 className="setup-title">プロフィール設定</h2>
        <p className="setup-subtitle">以下の情報を設定して、アカウントをカスタマイズしましょう</p>
        
        {/* 步骤指示 */}
        <div className="setup-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. アバター</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. 基本情報</div>
        </div>

        {/* 歩骤内容 */}
        {step === 1 && (
          <div className="setup-step-content">
            <h3>お気に入りのアバターを選択してください</h3>
            <div className="avatar-grid">
              {defaultAvatars.map((avatar, index) => (
                <div 
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} />
                </div>
              ))}
            </div>
            <button className="next-btn" onClick={handleNext}>次へ</button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step-content">
            <h3>基本情報を入力してください</h3>
            <div className="info-form">
              <div className="form-group">
                <label>ニックネーム *</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="ニックネームを入力"
                />
              </div>
              
              <div className="form-group">
                <label>性別</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(Number(e.target.value))}
                >
                  <option value={0}>未設定</option>
                  <option value={1}>男性</option>
                  <option value={2}>女性</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>生年月日</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="button-group">
              <button className="submit-btn" onClick={handleSubmit}>完了</button>
              <button className="skip-btn" onClick={handleSkip}>スキップ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetupPage;