import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F6F7F9] px-6 text-center text-[#111827]">
          <div className="max-w-md rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6">
            <h1 className="text-lg font-bold">表示中にエラーが発生しました</h1>
            <p className="mt-2 text-sm text-[#4B5563]">
              ページを再読み込みするか、ブラウザの保存データをリセットして再度お試しください。
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D5F59]"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
