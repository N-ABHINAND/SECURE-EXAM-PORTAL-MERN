import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    if (!auth.isAuthed) return null;

    const isActive = (path) => location.pathname === path;

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            auth.logout();
            navigate('/login');
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="brand-logo">Secure Exam Portal</div>
            </div>

            <div className="nav-menu">
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <span>🏠</span> Dashboard
                </Link>

                {auth.isAdmin ? (
                    // Admin Menu
                    <>
                        <Link to="/admin/create-exam" className={`nav-item ${isActive('/admin/create-exam') ? 'active' : ''}`}>
                            <span>📝</span> Create Exam
                        </Link>
                        <Link to="/admin/manage-exams" className={`nav-item ${isActive('/admin/manage-exams') ? 'active' : ''}`}>
                            <span>📋</span> Manage Exams
                        </Link>
                        <Link to="/admin/submissions" className={`nav-item ${isActive('/admin/submissions') ? 'active' : ''}`}>
                            <span>📊</span> View Submissions
                        </Link>
                        <Link to="/leaderboard" className={`nav-item ${isActive('/leaderboard') ? 'active' : ''}`}>
                            <span>🏆</span> Leaderboard
                        </Link>
                    </>
                ) : (
                    // Student Menu
                    <>
                        <Link to="/my-exams" className={`nav-item ${isActive('/my-exams') ? 'active' : ''}`}>
                            <span>📝</span> My Exams
                        </Link>
                        <Link to="/results" className={`nav-item ${isActive('/results') ? 'active' : ''}`}>
                            <span>📊</span> My Results
                        </Link>
                        <Link to="/leaderboard" className={`nav-item ${isActive('/leaderboard') ? 'active' : ''}`}>
                            <span>🏆</span> Leaderboard
                        </Link>
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-profile">
                    <div className="avatar">
                        {auth.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: 'white', fontSize: 14 }}>{auth.user?.name?.split(' ')[0] || 'User'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{auth.isAdmin ? 'Administrator' : 'Student'}</div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    <span>🚪</span> Logout
                </button>
            </div>
        </div>
    );
}
