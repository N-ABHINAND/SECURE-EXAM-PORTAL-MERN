import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function MyExams() {
    const [exams, setExams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchExams = async () => {
        try {
            const data = await apiFetch('/api/exams');
            setExams(data.exams || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const data = await apiFetch('/api/exams/my-submissions');
            setSubmissions(data.submissions || []);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchSubmissions();
    }, []);

    const hasSubmitted = (examId) => {
        return submissions.some(sub => sub.examId === examId);
    };

    return (
        <div>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>My Exams</h1>
                    <p>All available exams for you to attempt</p>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
                }}>
                    Warning: {error}
                </div>
            )}

            <div className="grid">
                <div className="col-12">
                    {exams.map((exam, idx) => {
                        const submitted = hasSubmitted(exam._id);

                        return (
                            <div key={exam._id} className={`learning-card ${idx === 0 ? 'active' : ''}`} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                                            {exam.title}
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                                            <span className="tag tag-learning">EXAM</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exam.durationMinutes} Minutes</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exam.questions?.length || 0} Questions</span>
                                            {submitted && (
                                                <span style={{
                                                    fontSize: 12,
                                                    padding: '2px 8px',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: '#22c55e',
                                                    borderRadius: 4,
                                                    fontWeight: 600
                                                }}>
                                                    COMPLETED
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                            Created: {new Date(exam.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/exams/${exam._id}`)}
                                        style={{ padding: '10px 20px', fontSize: 14 }}
                                        disabled={submitted}
                                        title={submitted ? 'You have already submitted this exam' : 'Start this exam'}
                                    >
                                        {submitted ? 'Already Submitted' : 'Start Exam →'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {exams.length === 0 && (
                        <div className="muted">No exams available at the moment.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
