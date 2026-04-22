import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ViewSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState({ totalStudents: 0 });
    const [error, setError] = useState('');
    const [expandedExams, setExpandedExams] = useState(new Set());
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [submissionsData, examsData, leaderboardData] = await Promise.all([
                apiFetch('/api/exams/submissions'),
                apiFetch('/api/exams'),
                apiFetch('/api/auth/leaderboard')
            ]);

            setSubmissions(submissionsData.submissions || []);
            setExams(examsData.exams || []);
            // Use leaderboard to count total students
            setStats({ totalStudents: leaderboardData.length || 0 });
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExam = (id) => {
        const next = new Set(expandedExams);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedExams(next);
    };

    const handlePublishToggle = async (e, examId, currentStatus) => {
        e.stopPropagation(); // Don't toggle accordion when clicking button
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} results?`)) return;

        try {
            await apiFetch(`/api/exams/${examId}/publish`, {
                method: 'PUT',
                body: JSON.stringify({ published: !currentStatus })
            });
            fetchData();
        } catch (e) {
            alert(e.message);
        }
    };

    // Group submissions by exam
    const submissionsByExam = submissions.reduce((acc, sub) => {
        const examId = sub.examId || sub.exam;
        if (!acc[examId]) {
            acc[examId] = [];
        }
        acc[examId].push(sub);
        return acc;
    }, {});

    return (
        <div>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Exam Results & Monitoring 📊</h1>
                    <p>Track student performance, monitor violations, and publish results.</p>
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
                    <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
                        <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{exams.length}</div>
                            <div className="muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Exams</div>
                        </div>
                        <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ok)' }}>{submissions.length}</div>
                            <div className="muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Submissions</div>
                        </div>
                        <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                                {submissions.filter(s => s.violationCount > 0).length}
                            </div>
                            <div className="muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Violations Detected</div>
                        </div>
                    </div>

                    {exams.map((exam) => {
                        const examSubmissions = submissionsByExam[exam._id] || [];
                        const isExpanded = expandedExams.has(exam._id);

                        return (
                            <div
                                key={exam._id}
                                className="card"
                                style={{
                                    marginBottom: 16,
                                    overflow: 'hidden',
                                    padding: 0,
                                    border: isExpanded ? '1px solid var(--primary-low)' : '1px solid var(--panel-border)',
                                    background: isExpanded ? 'rgba(99, 102, 241, 0.02)' : 'var(--panel-bg)'
                                }}
                            >
                                {/* Header / Toggle Bar */}
                                <div
                                    onClick={() => toggleExam(exam._id)}
                                    style={{
                                        padding: '16px 20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        background: isExpanded ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = isExpanded ? 'rgba(99, 102, 241, 0.05)' : 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            fontSize: '20px',
                                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            color: isExpanded ? 'var(--primary)' : 'var(--text-muted)'
                                        }}>
                                            ▶
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                                                {exam.title}
                                            </h2>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {examSubmissions.length} submissions • {exam.questions?.length || 0} questions
                                                </span>
                                                <span style={{
                                                    fontSize: 11,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: exam.resultsPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: exam.resultsPublished ? '#10b981' : '#f59e0b',
                                                    fontWeight: 600
                                                }}>
                                                    {exam.resultsPublished ? 'RESULTS PUBLISHED' : 'PENDING'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <button
                                            onClick={(e) => handlePublishToggle(e, exam._id, exam.resultsPublished)}
                                            className={exam.resultsPublished ? "btn btn-danger" : "btn btn-primary"}
                                            style={{ fontSize: 12, padding: '6px 12px', minWidth: '120px' }}
                                        >
                                            {exam.resultsPublished ? 'Unpublish Results' : 'Publish Results'}
                                        </button>
                                    </div>
                                </div>

                                {/* Results Section (Expanded) */}
                                {isExpanded && (
                                    <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--panel-border)' }}>
                                        {examSubmissions.length > 0 ? (
                                            <div style={{ marginTop: 20 }}>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '50px 1fr 140px 140px 100px 120px',
                                                    gap: 12,
                                                    padding: '12px',
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    borderRadius: 8,
                                                    marginBottom: 8,
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    color: 'var(--text-muted)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    <div>#</div>
                                                    <div>Student</div>
                                                    <div>Roll No</div>
                                                    <div>Date</div>
                                                    <div>Result</div>
                                                    <div>Violations</div>
                                                </div>

                                                {examSubmissions.map((sub, idx) => (
                                                    <div
                                                        key={sub._id}
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '50px 1fr 140px 140px 100px 120px',
                                                            gap: 12,
                                                            padding: '12px',
                                                            background: sub.violationCount > 0 ? 'rgba(239, 68, 68, 0.02)' : 'transparent',
                                                            borderRadius: 8,
                                                            borderBottom: idx === examSubmissions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                                            fontSize: 13,
                                                            color: 'var(--text-main)',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div style={{ color: 'var(--text-muted)' }}>{idx + 1}</div>
                                                        <div style={{ fontWeight: 500 }}>{sub.studentName}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sub.studentEmail?.split('@')[0]?.toUpperCase() || 'N/A'}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(sub.submittedAt).toLocaleDateString()}</div>
                                                        <div style={{
                                                            fontWeight: 600,
                                                            color: (sub.score / sub.total) >= 0.7 ? '#10b981' : (sub.score / sub.total) >= 0.4 ? '#f59e0b' : '#ef4444'
                                                        }}>
                                                            {sub.score}/{sub.total}
                                                        </div>
                                                        <div>
                                                            {sub.violationCount > 0 ? (
                                                                <span style={{
                                                                    padding: '4px 8px',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    color: '#ef4444',
                                                                    borderRadius: 4,
                                                                    fontSize: 11,
                                                                    fontWeight: 600
                                                                }}>
                                                                    ⚠️ {sub.violationCount} Violations
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#10b981', fontSize: 11, fontWeight: 500 }}>✓ Clean</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '30px', marginBottom: '10px' }}>📁</div>
                                                No submissions yet for this exam.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {exams.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="muted">No exams created yet. Go to Manage Exams to create one.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

