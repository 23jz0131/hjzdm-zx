import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ComparePage from './pages/ComparePage';
import ProfilePage from './pages/ProfilePage';
import MyCollectionPage from './pages/MyCollectionPage';
import BrowseHistoryPage from './pages/BrowseHistoryPage';
import MyTipPage from './pages/MyTipPage';
import CommunityPage from './pages/CommunityPage';
import AdminDisclosurePage from './pages/AdminDisclosurePage';
import NotificationPage from './pages/NotificationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-collection" element={<MyCollectionPage />} />
          <Route path="/browse-history" element={<BrowseHistoryPage />} />
          <Route path="/my-tip" element={<MyTipPage />} />
          <Route path="/admin/disclosures" element={<AdminDisclosurePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
