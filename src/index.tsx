import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContent from './AppContent';

window.React = React;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>,
);
