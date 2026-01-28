import * as React from 'react';
import { createContext, useContext, useState } from 'react';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const throwError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // 5秒后清除错误
  };

  return (
    <ErrorContext.Provider value={{ error, throwError }}>
      {error && <div className="error-toast">{error}</div>}
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
