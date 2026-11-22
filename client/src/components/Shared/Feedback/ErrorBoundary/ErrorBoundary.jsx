import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import './ErrorBoundary.scss';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-card">
            <div className="error-boundary-card__icon">
              <AlertTriangle size={32} />
            </div>
            <h2 className="error-boundary-card__title">Something went wrong</h2>
            <p className="error-boundary-card__message">
              An unexpected error occurred in the application. Please try reloading the page or
              navigate back.
            </p>
            {this.state.error?.message && (
              <pre className="error-boundary-card__detail">
                {this.state.error.message}
              </pre>
            )}
            <div className="error-boundary-card__actions">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
