import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'motion/react';
import { queryClient } from './lib/queryClient';
import ErrorBoundary from './components/common/ErrorBoundary';
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
import WalkRankingPage from './features/walk/WalkRankingPage';
import WalkMapExpandPage from './features/walk/WalkMapExpandPage';
import CommunityListPage from './features/community/CommunityListPage';
import CommunityDetailPage from './features/community/CommunityDetailPage';
import CommunityWritePage from './features/community/CommunityWritePage';
import ProfilePage from './features/profile/ProfilePage';
import ProfileOwnerWritePage from './features/profile/ProfileOwnerWritePage';
import ProfilePetWritePage from './features/profile/ProfilePetWritePage';
import PetRegisterPage from './features/pet/PetRegisterPage';
import GamificationTabPage from './features/gamification/GamificationTabPage';
import NotificationPage from './features/notification/NotificationPage';
import NoticeDetailPage from './features/notification/NoticeDetailPage';
import { ProfileTermsPage } from './features/profile/ProfileTermsPage';
import ScrollToTop from './components/common/ScrollToTop';
import { PullToRefresh } from './components/common/PullToRefresh';
import { PushNotificationHandler } from './components/common/PushNotificationHandler';
import { AuthExpiredHandler } from './components/common/AuthExpiredHandler';
import AIProfilePage from './features/aiprofile/AIProfilePage';
import AIProfileStyleSelectPage from './features/aiprofile/AIProfileStyleSelectPage';
import AIProfileResultPage from './features/aiprofile/AIProfileResultPage';
import SettingsPage from './features/settings/SettingsPage';
import PasswordChangePage from './features/settings/PasswordChangePage';
import MyPage from './features/mypage/MyPage';
import MyPostsPage from './features/mypage/MyPostsPage';
import BlockManagementPage from './features/mypage/BlockManagementPage';
import MyPagePetEditPage from './features/mypage/MyPagePetEditPage';
import MyWalkPage from './features/mypage/MyWalkPage';
import DormantAccountPage from './features/auth/DormantAccountPage';
import WithdrawnAccountPage from './features/auth/WithdrawnAccountPage';
import SuspendedAccountPage from './features/auth/SuspendedAccountPage';
import PlaceListPage from './features/checkin/PlaceListPage';
import PlaceDetailPage from './features/checkin/PlaceDetailPage';
import GoldMainPage from './features/gold/GoldMainPage';
import GoldPurchasePage from './features/gold/GoldPurchasePage';
import GoldHistoryPage from './features/gold/GoldHistoryPage';
import LocationSettingPage from './features/location/LocationSettingPage';
import CourseDetailPage from './features/course/CourseDetailPage';
import { CoursePage } from './features/course/CoursePage';
import { CourseCreatePage } from './features/course/CourseCreatePage';



// queryClient is imported from './lib/queryClient'

import { TypeALayout } from './components/layout/TypeALayout';
import { TypeBLayout } from './components/layout/TypeBLayout';

import { LoadingProvider } from './contexts/LoadingContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAppHeight } from './hooks/useAppHeight';
import MaintenanceGuard from './components/common/MaintenancePage';

/* ... imports ... */

const AIProfileSimplePage = lazy(() => import('./features/aiprofile/AIProfileSimplePage'));
const AIProfileCustomPage = lazy(() => import('./features/aiprofile/AIProfileCustomPage'));

function App() {
  useAppHeight();
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ErrorBoundary>
    <LazyMotion features={domAnimation}>
    <QueryClientProvider client={queryClient}>
      <MaintenanceGuard>
      <AlertProvider>
        <LoadingProvider>
          <ToastProvider>
           <BrowserRouter>
            <ScrollToTop />
            <PushNotificationHandler />
            <AuthExpiredHandler />
            <PullToRefresh />
            <Routes>
              {/* ... routes ... */}
              <Route path="/splash" element={<SplashPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Type A Layout (Logo Only): Onboarding, Permissions, Benefits, Terms Agreement, Signup Complete */}
              <Route element={<TypeALayout variant="logo-only" />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/permissions" element={<PermissionsPage />} />
                <Route path="/benefits" element={<BenefitsPage />} />
                <Route path="/signup/complete" element={<SignupCompletePage />} />
              </Route>

              {/* Type A Layout (Back Only): Signup Form */}
              <Route element={<TypeALayout variant="back-only" />}>
                <Route path="/signup" element={<TermsAgreementPage />} />
                <Route path="/signup/form" element={<SignupPage />} />
                <Route path="/signup/sns" element={<SnsSignupPage />} />
                <Route path="/loginSuccess" element={<LoginSuccessPage />} />
              </Route>

              {/* No Layout: Find Account (custom header per state) */}
              <Route path="/find-username" element={<FindUsernamePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Type A Layout (Close Only / Layout E): Account Edge Cases + Terms Detail */}
              <Route element={<TypeALayout variant="close-only" />}>
                <Route path="/account/dormant" element={<DormantAccountPage />} />
                <Route path="/account/withdrawn" element={<WithdrawnAccountPage />} />
                <Route path="/account/suspended" element={<SuspendedAccountPage />} />
                <Route path="/terms/:type" element={<TermsDetailPage />} />
              </Route>

              {/* No Layout: Walk Ranking (uses own header) */}
              <Route path="/walk/ranking" element={<WalkRankingPage />} />

              {/* No Layout: Gold pages (uses SubPageLayout internally) */}
              <Route path="/gold" element={<GoldMainPage />} />
              <Route path="/gold/purchase" element={<GoldPurchasePage />} />
              <Route path="/gold/history" element={<GoldHistoryPage />} />

              {/* No Layout: Custom header pages */}
              <Route path="/location/setting" element={<LocationSettingPage />} />

              {/* Type B Layout (Logo + Icons): Home, Main Features */}
              <Route element={<TypeBLayout variant="logo-with-icons" />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/friend-find" element={<FriendFindPage />} />
                <Route path="/friend-list" element={<FriendsListPage />} />
                <Route path="/chat" element={<ChatListPage />} />
                <Route path="/walk" element={<WalkPage />} />
                <Route path="/community" element={<CommunityListPage />} />
                <Route path="/places" element={<PlaceListPage />} />
                <Route path="/places/:placeId" element={<PlaceDetailPage />} />
                <Route path="/ai-profile" element={<AIProfilePage />} />
              </Route>

              {/* No Layout: Community Detail (uses own history_util header) */}
              <Route path="/community/:postId" element={<CommunityDetailPage />} />

              {/* No Layout: Walk Map (uses MainHeader back-only + BottomNav) */}
              <Route path="/walk/map" element={<WalkMapPage />} />

              {/* Walk Detail - uses own header + BottomNav */}
              <Route path="/walk/detail/:walkId" element={<WalkDetailPage />} />

              {/* Walk Map Expand - full screen, no layout wrapper */}
              <Route path="/walk/map-expand/:walkId" element={<WalkMapExpandPage />} />

              {/* Course routes */}
              <Route path="/courses" element={<CoursePage />} />
              <Route path="/courses/create" element={<CourseCreatePage />} />
              <Route path="/courses/create/from-walk/:walkId" element={<CourseCreatePage />} />
              <Route path="/courses/:courseId/edit" element={<CourseCreatePage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />

              {/* Layout B pages using SubPageLayout internally */}
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mypage/pet/edit" element={<MyPagePetEditPage />} />
              <Route path="/mypage/posts" element={<MyPostsPage />} />
              <Route path="/my-walks" element={<MyWalkPage />} />
              <Route path="/block-management" element={<BlockManagementPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/password" element={<PasswordChangePage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/notices/:id" element={<NoticeDetailPage />} />
              
              <Route path="/profile/owner/edit" element={<ProfileOwnerWritePage />} />
              <Route path="/profile/pet/edit" element={<ProfilePetWritePage />} />
              <Route path="/profile/terms" element={<ProfileTermsPage />} />

              {/* AI Profile Routes */}
              <Route path="/ai-profile/styles" element={<AIProfileStyleSelectPage />} />
              <Route path="/ai-profile/simple" element={<Suspense fallback={null}><AIProfileSimplePage /></Suspense>} />
              <Route path="/ai-profile/custom" element={<Suspense fallback={null}><AIProfileCustomPage /></Suspense>} />
              <Route path="/ai-profile/result/:requestId" element={<AIProfileResultPage />} />

              {/* Chat - No Layout */}
              <Route path="/chat/:chatId" element={<ChatDetailPage />} />
              <Route path="/chat/group/:chatId" element={<ChatDetailPage />} />

              {/* Settings etc */}
              <Route path="/community/write" element={<CommunityWritePage />} />
              <Route path="/pet/register" element={<PetRegisterPage />} />
              <Route path="/pet/edit/:petId" element={<PetRegisterPage />} />
              <Route path="/my-badges" element={<GamificationTabPage />} />
              <Route path="/missions" element={<GamificationTabPage />} />



              <Route path="/" element={<Navigate to="/splash" replace />} />
            </Routes>
          </BrowserRouter>
          </ToastProvider>
        </LoadingProvider>
      </AlertProvider>
      </MaintenanceGuard>
    </QueryClientProvider>
    </LazyMotion>
    </ErrorBoundary>
  );
}

export default App;
