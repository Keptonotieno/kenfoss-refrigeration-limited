import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-xl mx-auto space-y-5 my-8 shadow-2xl text-slate-200">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">
              {this.props.fallbackTitle || 'Component Rendering Exception Caught'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              A temporary application error occurred while attempting to render this section. The rest of the platform remains safe and accessible.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-36">
              {this.state.error.toString()}
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Component Render</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Reload Web Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
