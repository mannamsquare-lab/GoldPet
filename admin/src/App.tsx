import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/settings/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import CommunityPage from './pages/community/CommunityPage';
import ChatManagementPage from './pages/chat/ChatManagementPage';
import ReportsPage from './pages/reports/ReportsPage';
import EconomyPage from './pages/economy/EconomyPage';
import GamificationPage from './pages/gamification/GamificationPage';
import LBSPage from './pages/lbs/LBSPage';
import MarketingPage from './pages/marketing/MarketingPage';
import DataPage from './pages/data/DataPage';
import SystemPage from './pages/system/SystemPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chat" element={<ChatManagementPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="economy" element={<EconomyPage />} />
            <Route path="lbs" element={<LBSPage />} />
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="data" element={<DataPage />} />
            <Route path="system" element={<SystemPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
