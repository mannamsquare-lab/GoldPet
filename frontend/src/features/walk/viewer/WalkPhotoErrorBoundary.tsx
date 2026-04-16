import React from 'react';
import { reportClientError } from '../../../lib/clientErrorReporter';

type Props = { children: React.ReactNode; fallbackHref?: string };
type State = { hasError: boolean };

export class WalkPhotoErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      reportClientError(error, {
        componentStack: info.componentStack ?? null,
        extra: { context: 'WalkPhotoGallery' },
      });
    } catch {
      // reporter must never throw from boundary
    }
  }

  render() {
    if (this.state.hasError) {
      const href = this.props.fallbackHref ?? '/walk-photos';
      return (
        <div className="wpv_empty" role="alert">
          <p>갤러리를 열 수 없어요</p>
          <button type="button" onClick={() => { window.location.href = href; }}>
            목록으로
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default WalkPhotoErrorBoundary;
