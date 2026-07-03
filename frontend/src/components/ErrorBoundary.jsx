import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full">
            <h1 className="text-xl font-bold mb-2">⚠️ Algo salió mal</h1>
            <details className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <summary className="font-bold cursor-pointer">Ver detalles del error</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#22d3ee] text-black font-bold rounded-lg"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;