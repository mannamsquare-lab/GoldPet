import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
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

const HomePage = () => <div>Home Page</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<TermsAgreementPage />} />
          <Route path="/signup/form" element={<SignupPage />} />
          <Route path="/signup/sns" element={<SnsSignupPage />} />
          <Route path="/signup/complete" element={<SignupCompletePage />} />
          <Route path="/terms/:type" element={<TermsDetailPage />} />
          <Route path="/find-username" element={<FindUsernamePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/home"
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/splash" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
