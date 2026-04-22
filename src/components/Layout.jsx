import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // Hide sidebar during exams
  const isExamPage = location.pathname.startsWith('/exams/');

  if (!auth.isAuthed) {
    return <div className="container">{children}</div>;
  }

  // Full screen layout for exam pages (no sidebar)
  if (isExamPage) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        background: 'var(--bg-main)',
        padding: '20px'
      }}>
        {children}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

