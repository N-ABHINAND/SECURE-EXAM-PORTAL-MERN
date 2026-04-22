import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const auth = useAuth();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
        setIsOpen(false);
    };

    if (!auth.isAuthed) return null;

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <button
                className="profile-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Profile menu"
            >
                {/* Avatar with initials */}
                <img
                    className="profile-avatar"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'User')}&background=random&color=fff&bold=true`}
                    alt="Profile"
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />

                {/* Name and role */}
                <div className="profile-info">
                    <div className="profile-name">{auth.user?.name || 'User'}</div>
                    <div className="profile-role">{auth.user?.role || 'student'}</div>
                </div>

                {/* Dropdown arrow */}
                <svg
                    className="profile-arrow"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="profile-menu">
                    <div className="profile-menu-header">
                        <img
                            className="profile-menu-avatar"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'User')}&background=random&color=fff&bold=true`}
                            alt="Profile"
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                            <div className="profile-menu-name">{auth.user?.name}</div>
                            <div className="profile-menu-email">{auth.user?.email}</div>
                        </div>
                    </div>

                    <div className="profile-menu-divider" />

                    {/* Profile details */}
                    <div className="profile-menu-section">
                        {auth.user?.department && (
                            <div className="profile-menu-item">
                                <span className="profile-menu-label">🏢 Department</span>
                                <span className="profile-menu-value">{auth.user.department}</span>
                            </div>
                        )}
                        {auth.user?.college && (
                            <div className="profile-menu-item">
                                <span className="profile-menu-label">🎓 College</span>
                                <span className="profile-menu-value">{auth.user.college}</span>
                            </div>
                        )}
                        {!auth.user?.department && !auth.user?.college && (
                            <div className="profile-menu-item" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                                <span className="profile-menu-label">ℹ️ No profile details</span>
                            </div>
                        )}
                    </div>

                    <div className="profile-menu-divider" />

                    {/* Logout button */}
                    <button className="profile-menu-logout" onClick={handleLogout}>
                        <span>🚪 Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
