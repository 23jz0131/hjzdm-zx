import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ComparePage from './pages/ComparePage';
import ProfilePage from './pages/ProfilePage';

import MyTipPage from './pages/MyTipPage';
import CommunityPage from './pages/CommunityPage';
import AdminDisclosurePage from './pages/AdminDisclosurePage';
import NotificationPage from './pages/NotificationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import SubmitDisclosurePage from './pages/SubmitDisclosurePage';
// 测试组件已移除
// import CollectionCountTest from './components/CollectionCountTest';
// import DateTestPage from './pages/DateTestPage';
// import TestProfileSave from './pages/TestProfileSave';
// import UserSwitchTest from './pages/UserSwitchTest';
// import MyDisclosureCollectionPage from './pages/MyDisclosureCollectionPage';
import './App.css';
// 样式文件已移除
// import './styles/breakpoints.css'; // 导入响应式设计规范
// import './styles/touch-friendly.css'; // 导入触摸友好样式
// import './styles/typography.css'; // 导入字体和间距响应式样式

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/submit-disclosure" element={<ProtectedRoute><SubmitDisclosurePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-tip" element={<ProtectedRoute><MyTipPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/admin/disclosures" element={<ProtectedRoute><AdminDisclosurePage /></ProtectedRoute>} />
        {/* 用户管理页面路由已移除 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;