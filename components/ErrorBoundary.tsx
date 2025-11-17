import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    (this as any).setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    (this as any).setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-start gap-4">
              <div className="text-red-500 text-4xl">⚠️</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-400 mb-3">
                  문제가 발생했습니다
                </h1>
                <p className="text-gray-300 mb-4">
                  애플리케이션에서 예기치 않은 오류가 발생했습니다.
                  페이지를 새로고침하거나 아래 버튼을 클릭하여 다시 시도해주세요.
                </p>

                {this.state.error && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-purple-400 hover:text-purple-300 mb-2">
                      기술 세부 정보 보기
                    </summary>
                    <div className="bg-gray-900 p-4 rounded border border-gray-700 text-sm">
                      <p className="text-red-400 font-mono mb-2">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="text-gray-400 text-xs overflow-auto max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={this.handleReset}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition-colors"
                  >
                    다시 시도
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors"
                  >
                    페이지 새로고침
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
