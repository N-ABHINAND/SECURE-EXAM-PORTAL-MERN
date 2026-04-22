import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Button } from '../components/Form';

export default function Results() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch(`/api/exams/sol/${submissionId}`);
                setSubmission(data.submission);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [submissionId]);

    // Celebration effect
    useEffect(() => {
        if (submission) {
            const pct = Math.round((submission.score / submission.total) * 100);
            if (pct >= 40 && window.confetti) {
                window.confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#d946ef', '#10b981']
                });
            }
        }
    }, [submission]);

    if (loading) return <div className="card">Loading results...</div>;
    if (error) return <div className="card error">{error}</div>;
    if (!submission) return <div className="card">Result not found</div>;

    const percentage = Math.round((submission.score / submission.total) * 100);
    const passed = percentage >= 40;

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div className="h1">{submission.examTitle}</div>
                            <div className="h2" style={{ marginBottom: 0 }}>
                                Student: <span className="text-primary">{submission.studentName}</span>
                            </div>
                        </div>
                        <div className="text-right" style={{ textAlign: 'right' }}>
                            <div className="pil pill-lg" style={{
                                fontSize: '1.2em',
                                padding: '8px 16px',
                                background: passed ? 'rgba(45, 212, 191, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                                border: `1px solid ${passed ? 'var(--ok)' : 'var(--danger)'}`,
                                color: passed ? 'var(--ok)' : 'var(--danger)'
                            }}>
                                Score: <b>{submission.score} / {submission.total}</b> ({percentage}%)
                            </div>
                            <div style={{ marginTop: 8, fontSize: '1.5em', fontWeight: 'bold', color: passed ? 'var(--ok)' : 'var(--danger)' }}>
                                {passed ? 'PASSED 🎉' : 'FAILED ❌'}
                            </div>
                        </div>
                    </div>

                    <div className="hr" style={{ margin: '20px 0' }} />

                    <div className="list">
                        {submission.questions.map((q, idx) => {
                            const isCorrect = q.userAnswer === q.correctIndex;
                            const isSkipped = q.userAnswer === -1;

                            return (
                                <div key={idx} className="item" style={{
                                    borderLeft: `4px solid ${isCorrect ? 'var(--ok)' : 'var(--danger)'}`,
                                    background: isCorrect ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255, 77, 109, 0.05)',
                                    marginBottom: 16
                                }}>
                                    <div className="kv">
                                        <div className="kv-title" style={{ fontSize: '1.1em', marginBottom: 12 }}>
                                            <span className="muted" style={{ marginRight: 8 }}>{idx + 1}.</span>
                                            {q.prompt}
                                        </div>

                                        <div className="options-list" style={{ marginLeft: 24 }}>
                                            {q.options.map((opt, optIdx) => {
                                                let style = { padding: '8px 12px', borderRadius: 8, marginBottom: 4, border: '1px solid transparent' };
                                                let icon = null;

                                                // Correct answer styling
                                                if (optIdx === q.correctIndex) {
                                                    style.background = 'rgba(45, 212, 191, 0.15)';
                                                    style.borderColor = 'var(--ok)';
                                                    style.fontWeight = 'bold';
                                                    icon = '✅';
                                                }

                                                // User's wrong answer styling
                                                if (optIdx === q.userAnswer && !isCorrect) {
                                                    style.background = 'rgba(255, 77, 109, 0.15)';
                                                    style.borderColor = 'var(--danger)';
                                                    icon = '❌';
                                                }

                                                return (
                                                    <div key={optIdx} style={style} className="row">
                                                        <div style={{ width: 28, flexShrink: 0 }}>{icon}</div>
                                                        <div style={{ marginRight: 8, fontWeight: 500, opacity: 0.7 }}>
                                                            {String.fromCharCode(65 + optIdx)}.
                                                        </div>
                                                        <div style={{ flex: 1 }}>{opt}</div>
                                                        {optIdx === q.userAnswer && <div className="pill" style={{ marginLeft: 'auto', fontSize: 10, whiteSpace: 'nowrap' }}>Your Answer</div>}
                                                        {optIdx === q.correctIndex && optIdx !== q.userAnswer && <div className="pill" style={{ marginLeft: 8, fontSize: 10, whiteSpace: 'nowrap' }}>Correct Answer</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {isSkipped && (
                                            <div className="error" style={{ marginLeft: 24, marginTop: 8, fontSize: 13 }}>
                                                ⚠️ You skipped this question
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hr" />
                    <Button variant="secondary" onClick={() => navigate('/')}>Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );
}
