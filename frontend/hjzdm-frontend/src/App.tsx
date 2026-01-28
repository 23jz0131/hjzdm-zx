import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ComparePage from './pages/ComparePage';
import ProfilePage from './pages/ProfilePage';
import MyCollectionPage from './pages/MyCollectionPage';

import MyTipPage from './pages/MyTipPage';
import CommunityPage from './pages/CommunityPage';
import AdminDisclosurePage from './pages/AdminDisclosurePage';
import NotificationPage from './pages/NotificationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SubmitDisclosurePage from './pages/SubmitDisclosurePage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-collection" element={<ProtectedRoute><MyCollectionPage /></ProtectedRoute>} />
                    <Route path="/my-tip" element={<ProtectedRoute><MyTipPage /></ProtectedRoute>} />
          <Route path="/submit-disclosure" element={<ProtectedRoute><SubmitDisclosurePage /></ProtectedRoute>} />
          <Route path="/admin/disclosures" element={<ProtectedRoute><AdminDisclosurePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;