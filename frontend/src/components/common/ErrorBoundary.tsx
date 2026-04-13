import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    try {
      const payload = {
        url: typeof window !== 'undefined' ? window.location.href : null,
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
      const apiBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? '';
      const url = `${apiBase}/api/v1/client-logs/error`;
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // swallow — reporting must never itself throw
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Pretendard, sans-serif'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#333' }}>
            문제가 발생했습니다
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            일시적인 오류가 발생했습니다. 다시 시도해 주세요.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              backgroundColor: '#F59E0B',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
