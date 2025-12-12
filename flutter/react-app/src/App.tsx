import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useAuthStore } from './stores/authStore';
import './App.css';

// Pages
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
            {/* Add other main routes here, e.g., /community */}
            {/* <Route path="/community" element={<CommunityPage />} /> */}
          </Route>

          {/* Chat Detail - No Layout */}
          <Route path="/chat/:chatId" element={<ChatDetailPage />} />
          <Route path="/chat/group/:chatId" element={<ChatDetailPage />} />

          <Route path="/" element={<Navigate to="/splash" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
