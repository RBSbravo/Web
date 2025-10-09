// Debug component to check environment variables
import React from 'react';

const DebugEnv = () => {
  const envVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
  };

  console.log('Environment Variables:', envVars);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '10px' }}>
      <h3>Environment Variables Debug</h3>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
    </div>
  );
};

export default DebugEnv;
