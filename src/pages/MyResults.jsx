import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function MyResults() {
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchSubmissions = async () => {
        try {
            const data = await apiFetch('/api/exams/my-submissions');
            setSubmissions(data.submissions || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    return (
        <div>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>My Results 📊</h1>
                    <p>View your exam results after admin publishes them</p>
                </div>
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

            <div className="grid">
                <div className="col-12">
                    {submissions.map((sub) => (
                        <div key={sub._id} className="card" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                                        {sub.examTitle}
                                    </h3>

                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            📅 Submitted: {new Date(sub.submittedAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {sub.resultsPublished ? (
                                        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Your Score</div>
                                                <div style={{
                                                    fontSize: 24,
                                                    fontWeight: 700,
                                                    color: (sub.score / sub.total) >= 0.7 ? '#10b981' : (sub.score / sub.total) >= 0.4 ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {sub.score} / {sub.total}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Percentage</div>
                                                <div style={{
                                                    fontSize: 24,
                                                    fontWeight: 700,
                                                    color: (sub.score / sub.total) >= 0.7 ? '#10b981' : (sub.score / sub.total) >= 0.4 ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {Math.round((sub.score / sub.total) * 100)}%
                                                </div>
                                            </div>

                                            <div style={{ marginLeft: 'auto' }}>
                                                <button
                                                    onClick={() => navigate(`/results/${sub._id}`)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '10px 20px' }}
                                                >
                                                    View Detailed Results →
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: 8,
                                            color: '#f59e0b',
                                            fontSize: 14,
                                            fontWeight: 500
                                        }}>
                                            ⏳ Results are pending. Admin has not published the results yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {submissions.length === 0 && (
                        <div className="muted">You haven't attempted any exams yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
