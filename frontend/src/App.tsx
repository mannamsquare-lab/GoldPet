import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useAuthStore } from './stores/authStore';
import './App.css';

// Pages
import { AlertProvider } from './contexts/AlertContext';
import { SplashPage } from './features/splash/SplashPage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { PermissionsPage } from './features/permissions/PermissionsPage';
import { BenefitsPage } from './features/benefits/BenefitsPage';
import { LoginPage } from './features/auth/LoginPage';
import { TermsAgreementPage } from './features/auth/TermsAgreementPage';
import { TermsDetailPage } from './features/auth/TermsDetailPage';
import { SignupPage } from './features/auth/SignupPage';
import { FindUsernamePage } from './features/auth/FindUsernamePage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { SignupCompletePage } from './features/auth/SignupCompletePage';
import { SnsSignupPage } from './features/auth/SnsSignupPage';
import { LoginSuccessPage } from './features/auth/LoginSuccessPage';
import HomePage from './features/home/HomePage';
import { FriendFindPage } from './features/friend/FriendFindPage';
import { FriendsListPage } from './features/friend/FriendsListPage';
import ChatListPage from './features/chat/ChatListPage';
import ChatDetailPage from './features/chat/ChatDetailPage';
import WalkPage from './features/walk/WalkPage';
import WalkMapPage from './features/walk/WalkMapPage';
import WalkDetailPage from './features/walk/WalkDetailPage';
import CommunityListPage from './features/community/CommunityListPage';
import CommunityDetailPage from './features/community/CommunityDetailPage';
import CommunityWritePage from './features/community/CommunityWritePage';
import ProfilePage from './features/profile/ProfilePage';
import SettingsPage from './features/profile/SettingsPage';
import PetRegisterPage from './features/pet/PetRegisterPage';
import BadgesPage from './features/gamification/BadgesPage';
import ChallengesPage from './features/gamification/ChallengesPage';
import NotificationPage from './features/notification/NotificationPage';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { TypeALayout } from './components/layout/TypeALayout';
import { TypeBLayout } from './components/layout/TypeBLayout';

function App() {
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Type A Layout (Logo Only): Onboarding, Permissions, Benefits, Terms Agreement */}
            <Route element={<TypeALayout variant="logo-only" />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/permissions" element={<PermissionsPage />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/signup" element={<TermsAgreementPage />} />
            </Route>

            {/* Type A Layout (Back Only): Signup Form, Find Account */}
            <Route element={<TypeALayout variant="back-only" />}>
              <Route path="/signup/form" element={<SignupPage />} />
              <Route path="/signup/sns" element={<SnsSignupPage />} />
              <Route path="/loginSuccess" element={<LoginSuccessPage />} />
              <Route path="/signup/complete" element={<SignupCompletePage />} />
              <Route path="/terms/:type" element={<TermsDetailPage />} />
              <Route path="/find-username" element={<FindUsernamePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
            
            {/* Type B Layout (Logo + Icons): Home, Main Features */}
            <Route element={<TypeBLayout variant="logo-with-icons" />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/friend-find" element={<FriendFindPage />} />
              <Route path="/friend-list" element={<FriendsListPage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/walk" element={<WalkPage />} />
              <Route path="/walk/map" element={<WalkMapPage />} />
              <Route path="/walk/detail/:walkId" element={<WalkDetailPage />} />
              {/* <Route path="/walk/detail/:walkId" element={<WalkDetailPage />} /> */ /* Already there */ }
              <Route path="/community" element={<CommunityListPage />} />
              <Route path="/community/:postId" element={<CommunityDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Chat Detail - No Layout */}
            <Route path="/chat/:chatId" element={<ChatDetailPage />} />
            <Route path="/chat/group/:chatId" element={<ChatDetailPage />} />

            {/* Settings etc */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/community/write" element={<CommunityWritePage />} />
            <Route path="/pet/register" element={<PetRegisterPage />} />
            <Route path="/pet/edit/:petId" element={<PetRegisterPage />} />
            <Route path="/my-badges" element={<BadgesPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/notifications" element={<NotificationPage />} />



            <Route path="/" element={<Navigate to="/splash" replace />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </QueryClientProvider>
  );
}

export default App;
