import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/settings/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import CommunityPage from './pages/community/CommunityPage';
import CommunityDetailPage from './pages/community/CommunityDetailPage';
import ChatManagementPage from './pages/chat/ChatManagementPage';
import ReportsPage from './pages/reports/ReportsPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import EconomyPage from './pages/economy/EconomyPage';
import GamificationPage from './pages/gamification/GamificationPage';
import LBSPage from './pages/lbs/LBSPage';
import MarketingPage from './pages/marketing/MarketingPage';
import DataPage from './pages/data/DataPage';
import BreedsPage from './pages/data/BreedsPage';
import AttributesPage from './pages/data/AttributesPage';
import UserAttributesPage from './pages/data/UserAttributesPage';
import SystemPage from './pages/system/SystemPage';
import AIProfilePage from './pages/aiprofile/AIProfilePage';
import NoticeManagementPage from './pages/notice/NoticeManagementPage';

const DetailPlaceholder = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">상세 페이지 준비중</p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-900">
        ← 목록으로 돌아가기
      </button>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
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
            <Route path="data/breeds" element={<BreedsPage />} />
            <Route path="data/attributes" element={<AttributesPage />} />
            <Route path="data/user-attributes" element={<UserAttributesPage />} />
            <Route path="ai-profile" element={<AIProfilePage />} />
            <Route path="notices" element={<NoticeManagementPage />} />
            <Route path="notices/:noticeId" element={<DetailPlaceholder />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="community/:postId" element={<CommunityDetailPage />} />
            <Route path="chat/:roomId" element={<DetailPlaceholder />} />
            <Route path="reports/:reportId" element={<ReportDetailPage />} />
            <Route path="marketing/templates/:templateId" element={<DetailPlaceholder />} />
            <Route path="economy/transactions/:transactionId" element={<DetailPlaceholder />} />
            <Route path="ai-profile/requests/:requestId" element={<DetailPlaceholder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
