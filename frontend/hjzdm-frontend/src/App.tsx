import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ComparePage from './pages/ComparePage';
import ProfilePage from './pages/ProfilePage';
import MyDisclosureCollectionPage from './pages/MyDisclosureCollectionPage';

import MyTipPage from './pages/MyTipPage';
import CommunityPage from './pages/CommunityPage';
import AdminDisclosurePage from './pages/AdminDisclosurePage';
import NotificationPage from './pages/NotificationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SubmitDisclosurePage from './pages/SubmitDisclosurePage';
import TestProfileSave from './pages/TestProfileSave';
import UserSwitchTest from './pages/UserSwitchTest';
import CollectionCountTest from './components/CollectionCountTest';
import DateTestPage from './pages/DateTestPage';
import './App.css';
import './styles/breakpoints.css'; // 导入响应式设计规范
import './styles/touch-friendly.css'; // 导入触摸友好样式
import './styles/typography.css'; // 导入字体和间距响应式样式

function App() {
  return (
    <div className="App">
      <Header />
      <main style={{ flex: 1, overflow: 'auto', zIndex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-disclosure-collection" element={<ProtectedRoute><MyDisclosureCollectionPage /></ProtectedRoute>} />
          <Route path="/my-tip" element={<ProtectedRoute><MyTipPage /></ProtectedRoute>} />
          <Route path="/submit-disclosure" element={<ProtectedRoute><SubmitDisclosurePage /></ProtectedRoute>} />
          <Route path="/admin/disclosures" element={<ProtectedRoute><AdminDisclosurePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/test-profile" element={<TestProfileSave />} />
          <Route path="/user-switch-test" element={<UserSwitchTest />} />
          <Route path="/collection-count-test" element={<CollectionCountTest />} />
          <Route path="/date-test" element={<DateTestPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;