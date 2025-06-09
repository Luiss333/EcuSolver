import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return null; // No muestra nada, la página se recarga
    }
    return this.props.children;
  }
}

export default ErrorBoundary;