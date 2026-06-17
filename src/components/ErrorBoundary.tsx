import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-natural-600 mb-8 max-w-md">We're sorry, but an unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-natural-700 text-white rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-natural-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
