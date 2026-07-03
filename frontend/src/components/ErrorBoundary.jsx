import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
            <h1 className="text-xl font-bold mb-2">⚠️ Algo salió mal</h1>
            <p className="text-sm">Hubo un error al cargar la aplicación. Por favor, intenta recargar la página.</p>
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