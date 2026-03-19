import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'motion/react';
import { queryClient } from './lib/queryClient';
import ErrorBoundary from './components/common/ErrorBoundary';
// import { useAuthStore } from './stores/authStore';
import './App.css';

// Non-page imports (static)
import { AlertProvider } from './contexts/AlertContext';
import { SplashPage } from './features/splash/SplashPage';
import ScrollToTop from './components/common/ScrollToTop';
import { PullToRefresh } from './components/common/PullToRefresh';
import { PushNotificationHandler } from './components/common/PushNotificationHandler';
import { AuthExpiredHandler } from './components/common/AuthExpiredHandler';
import { TypeALayout } from './components/layout/TypeALayout';
import { TypeBLayout } from './components/layout/TypeBLayout';
import { LoadingProvider } from './contexts/LoadingContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAppHeight } from './hooks/useAppHeight';
import MaintenanceGuard from './components/common/MaintenancePage';

// Named-export pages (adapter pattern)
const OnboardingPage = lazy(() => import('./features/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const PermissionsPage = lazy(() => import('./features/permissions/PermissionsPage').then(m => ({ default: m.PermissionsPage })));
const BenefitsPage = lazy(() => import('./features/benefits/BenefitsPage').then(m => ({ default: m.BenefitsPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const TermsAgreementPage = lazy(() => import('./features/auth/TermsAgreementPage').then(m => ({ default: m.TermsAgreementPage })));
const TermsDetailPage = lazy(() => import('./features/auth/TermsDetailPage').then(m => ({ default: m.TermsDetailPage })));
const SignupPage = lazy(() => import('./features/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const FindUsernamePage = lazy(() => import('./features/auth/FindUsernamePage').then(m => ({ default: m.FindUsernamePage })));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const SignupCompletePage = lazy(() => import('./features/auth/SignupCompletePage').then(m => ({ default: m.SignupCompletePage })));
const SnsSignupPage = lazy(() => import('./features/auth/SnsSignupPage').then(m => ({ default: m.SnsSignupPage })));
const LoginSuccessPage = lazy(() => import('./features/auth/LoginSuccessPage').then(m => ({ default: m.LoginSuccessPage })));
const FriendFindPage = lazy(() => import('./features/friend/FriendFindPage').then(m => ({ default: m.FriendFindPage })));
const FriendsListPage = lazy(() => import('./features/friend/FriendsListPage').then(m => ({ default: m.FriendsListPage })));
const ProfileTermsPage = lazy(() => import('./features/profile/ProfileTermsPage').then(m => ({ default: m.ProfileTermsPage })));
const CoursePage = lazy(() => import('./features/course/CoursePage').then(m => ({ default: m.CoursePage })));
const CourseCreatePage = lazy(() => import('./features/course/CourseCreatePage').then(m => ({ default: m.CourseCreatePage })));

// Default-export pages (standard lazy)
const HomePage = lazy(() => import('./features/home/HomePage'));
const ChatListPage = lazy(() => import('./features/chat/ChatListPage'));
const ChatDetailPage = lazy(() => import('./features/chat/ChatDetailPage'));
const WalkPage = lazy(() => import('./features/walk/WalkPage'));
const WalkMapPage = lazy(() => import('./features/walk/WalkMapPage'));
const WalkDetailPage = lazy(() => import('./features/walk/WalkDetailPage'));
const WalkRankingPage = lazy(() => import('./features/walk/WalkRankingPage'));
const WalkMapExpandPage = lazy(() => import('./features/walk/WalkMapExpandPage'));
const CommunityListPage = lazy(() => import('./features/community/CommunityListPage'));
const CommunityDetailPage = lazy(() => import('./features/community/CommunityDetailPage'));
const CommunityWritePage = lazy(() => import('./features/community/CommunityWritePage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const ProfileOwnerWritePage = lazy(() => import('./features/profile/ProfileOwnerWritePage'));
const ProfilePetWritePage = lazy(() => import('./features/profile/ProfilePetWritePage'));
const PetRegisterPage = lazy(() => import('./features/pet/PetRegisterPage'));
const GamificationTabPage = lazy(() => import('./features/gamification/GamificationTabPage'));
const NotificationPage = lazy(() => import('./features/notification/NotificationPage'));
const NoticeDetailPage = lazy(() => import('./features/notification/NoticeDetailPage'));
const AIProfilePage = lazy(() => import('./features/aiprofile/AIProfilePage'));
const AIProfileStyleSelectPage = lazy(() => import('./features/aiprofile/AIProfileStyleSelectPage'));
const AIProfileResultPage = lazy(() => import('./features/aiprofile/AIProfileResultPage'));
const AIProfileSimplePage = lazy(() => import('./features/aiprofile/AIProfileSimplePage'));
const AIProfileCustomPage = lazy(() => import('./features/aiprofile/AIProfileCustomPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const PasswordChangePage = lazy(() => import('./features/settings/PasswordChangePage'));
const MyPage = lazy(() => import('./features/mypage/MyPage'));
const MyPostsPage = lazy(() => import('./features/mypage/MyPostsPage'));
const BlockManagementPage = lazy(() => import('./features/mypage/BlockManagementPage'));
const MyPagePetEditPage = lazy(() => import('./features/mypage/MyPagePetEditPage'));
const MyWalkPage = lazy(() => import('./features/mypage/MyWalkPage'));
const DormantAccountPage = lazy(() => import('./features/auth/DormantAccountPage'));
const WithdrawnAccountPage = lazy(() => import('./features/auth/WithdrawnAccountPage'));
const SuspendedAccountPage = lazy(() => import('./features/auth/SuspendedAccountPage'));
const PlaceListPage = lazy(() => import('./features/checkin/PlaceListPage'));
const PlaceDetailPage = lazy(() => import('./features/checkin/PlaceDetailPage'));
const GoldMainPage = lazy(() => import('./features/gold/GoldMainPage'));
const GoldPurchasePage = lazy(() => import('./features/gold/GoldPurchasePage'));
const GoldHistoryPage = lazy(() => import('./features/gold/GoldHistoryPage'));
const LocationSettingPage = lazy(() => import('./features/location/LocationSettingPage'));
const CourseDetailPage = lazy(() => import('./features/course/CourseDetailPage'));

// queryClient is imported from './lib/queryClient'

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
              {/* Entry point - stays static to avoid blank screen */}
              <Route path="/splash" element={<SplashPage />} />

              {/* Login - standalone */}
              <Route path="/login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />

              {/* Type A Layout (Logo Only): Onboarding, Permissions, Benefits, Terms Agreement, Signup Complete */}
              <Route element={<TypeALayout variant="logo-only" />}>
                <Suspense fallback={null}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/permissions" element={<PermissionsPage />} />
                  <Route path="/benefits" element={<BenefitsPage />} />
                  <Route path="/signup/complete" element={<SignupCompletePage />} />
                </Suspense>
              </Route>

              {/* Type A Layout (Back Only): Signup Form */}
              <Route element={<TypeALayout variant="back-only" />}>
                <Suspense fallback={null}>
                  <Route path="/signup" element={<TermsAgreementPage />} />
                  <Route path="/signup/form" element={<SignupPage />} />
                  <Route path="/signup/sns" element={<SnsSignupPage />} />
                  <Route path="/loginSuccess" element={<LoginSuccessPage />} />
                </Suspense>
              </Route>

              {/* No Layout: Find Account (custom header per state) */}
              <Suspense fallback={null}>
                <Route path="/find-username" element={<FindUsernamePage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Suspense>

              {/* Type A Layout (Close Only / Layout E): Account Edge Cases + Terms Detail */}
              <Route element={<TypeALayout variant="close-only" />}>
                <Suspense fallback={null}>
                  <Route path="/account/dormant" element={<DormantAccountPage />} />
                  <Route path="/account/withdrawn" element={<WithdrawnAccountPage />} />
                  <Route path="/account/suspended" element={<SuspendedAccountPage />} />
                  <Route path="/terms/:type" element={<TermsDetailPage />} />
                </Suspense>
              </Route>

              {/* No Layout: Walk pages */}
              <Suspense fallback={null}>
                <Route path="/walk/ranking" element={<WalkRankingPage />} />
                <Route path="/walk/map" element={<WalkMapPage />} />
                <Route path="/walk/detail/:walkId" element={<WalkDetailPage />} />
                <Route path="/walk/map-expand/:walkId" element={<WalkMapExpandPage />} />
              </Suspense>

              {/* No Layout: Gold pages (uses SubPageLayout internally) */}
              <Suspense fallback={null}>
                <Route path="/gold" element={<GoldMainPage />} />
                <Route path="/gold/purchase" element={<GoldPurchasePage />} />
                <Route path="/gold/history" element={<GoldHistoryPage />} />
              </Suspense>

              {/* No Layout: Custom header pages */}
              <Suspense fallback={null}>
                <Route path="/location/setting" element={<LocationSettingPage />} />
              </Suspense>

              {/* Type B Layout (Logo + Icons): Home, Main Features */}
              <Route element={<TypeBLayout variant="logo-with-icons" />}>
                <Suspense fallback={null}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/friend-find" element={<FriendFindPage />} />
                  <Route path="/friend-list" element={<FriendsListPage />} />
                  <Route path="/chat" element={<ChatListPage />} />
                  <Route path="/walk" element={<WalkPage />} />
                  <Route path="/community" element={<CommunityListPage />} />
                  <Route path="/places" element={<PlaceListPage />} />
                  <Route path="/places/:placeId" element={<PlaceDetailPage />} />
                  <Route path="/ai-profile" element={<AIProfilePage />} />
                </Suspense>
              </Route>

              {/* No Layout: Community */}
              <Suspense fallback={null}>
                <Route path="/community/:postId" element={<CommunityDetailPage />} />
                <Route path="/community/write" element={<CommunityWritePage />} />
              </Suspense>

              {/* Course routes */}
              <Suspense fallback={null}>
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/courses/create" element={<CourseCreatePage />} />
                <Route path="/courses/create/from-walk/:walkId" element={<CourseCreatePage />} />
                <Route path="/courses/:courseId/edit" element={<CourseCreatePage />} />
                <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              </Suspense>

              {/* MyPage / Profile / Settings */}
              <Suspense fallback={null}>
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/mypage/pet/edit" element={<MyPagePetEditPage />} />
                <Route path="/mypage/posts" element={<MyPostsPage />} />
                <Route path="/my-walks" element={<MyWalkPage />} />
                <Route path="/block-management" element={<BlockManagementPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/owner/edit" element={<ProfileOwnerWritePage />} />
                <Route path="/profile/pet/edit" element={<ProfilePetWritePage />} />
                <Route path="/profile/terms" element={<ProfileTermsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/password" element={<PasswordChangePage />} />
              </Suspense>

              {/* Notifications */}
              <Suspense fallback={null}>
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/notices/:id" element={<NoticeDetailPage />} />
              </Suspense>

              {/* AI Profile Routes */}
              <Suspense fallback={null}>
                <Route path="/ai-profile/styles" element={<AIProfileStyleSelectPage />} />
                <Route path="/ai-profile/simple" element={<AIProfileSimplePage />} />
                <Route path="/ai-profile/custom" element={<AIProfileCustomPage />} />
                <Route path="/ai-profile/result/:requestId" element={<AIProfileResultPage />} />
              </Suspense>

              {/* Chat - No Layout */}
              <Suspense fallback={null}>
                <Route path="/chat/:chatId" element={<ChatDetailPage />} />
                <Route path="/chat/group/:chatId" element={<ChatDetailPage />} />
              </Suspense>

              {/* Misc */}
              <Suspense fallback={null}>
                <Route path="/pet/register" element={<PetRegisterPage />} />
                <Route path="/pet/edit/:petId" element={<PetRegisterPage />} />
                <Route path="/my-badges" element={<GamificationTabPage />} />
                <Route path="/missions" element={<GamificationTabPage />} />
              </Suspense>

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
