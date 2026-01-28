import React from "react";

export class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      console.error("Error Boundary Caught:", error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              color: "white",
              padding: "20px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                backgroundColor: "#333",
                padding: "20px",
                borderRadius: "8px",
                width: "80%",
                maxWidth: "400px",
              }}
            >
              <h2>Oops! Something went wrong</h2>
              <p>An error occurred. Please refresh the page or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        );
      }
  
      return this.props.children;
    }
  }
  
  export default ErrorBoundary;
  