import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState('');
    const auth = useAuth();

    const fetchLeaderboard = async () => {
        try {
            const data = await apiFetch('/api/auth/leaderboard');
            setLeaderboard(data.leaderboard || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const userRank = leaderboard.findIndex(u => u.email === auth.user?.email) + 1;

    return (
        <div>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Leaderboard 🏆</h1>
                    <p>Top performers ranked by XP points</p>
                </div>
                {!auth.isAdmin && userRank > 0 && (
                    <div style={{ padding: '12px 24px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: '#818cf8', fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        Your Rank: #{userRank}
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="card">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 200px 150px',
                    gap: 16,
                    padding: '12px 16px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: 8,
                    marginBottom: 12,
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--text-main)'
                }}>
                    <div>Rank</div>
                    <div>Student Name</div>
                    <div>Roll Number</div>
                    <div>XP Points</div>
                </div>

                {leaderboard.map((student, idx) => (
                    <div
                        key={student._id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 200px 150px',
                            gap: 16,
                            padding: '16px',
                            background: student.email === auth.user?.email ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 8,
                            marginBottom: 8,
                            border: `1px solid ${student.email === auth.user?.email ? 'rgba(99, 102, 241, 0.3)' : 'var(--panel-border)'}`,
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                                color: idx < 3 ? 'white' : 'var(--text-muted)',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 'bold',
                                fontSize: 16
                            }}>
                                {idx + 1}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-main)' }}>
                                {student.shortName}
                                {student.email === auth.user?.email && (
                                    <span style={{
                                        marginLeft: 8,
                                        padding: '2px 8px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        color: '#818cf8',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 500
                                    }}>
                                        You
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {student.department || 'BAM'}
                            </div>
                        </div>

                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            {student.rollNo}
                        </div>

                        <div style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#818cf8'
                        }}>
                            {student.xp.toLocaleString()} XP
                        </div>
                    </div>
                ))}

                {leaderboard.length === 0 && (
                    <div className="muted">No students in leaderboard yet.</div>
                )}
            </div>
        </div>
    );
}
