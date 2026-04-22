import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ManageExams() {
    const [exams, setExams] = useState([]);
    const [error, setError] = useState('');
    const [editingQuestion, setEditingQuestion] = useState(null);
    const navigate = useNavigate();

    const fetchExams = async () => {
        try {
            const data = await apiFetch('/api/exams');
            setExams(data.exams || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handlePublishToggle = async (examId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} results?`)) return;

        try {
            await apiFetch(`/api/exams/${examId}/publish`, {
                method: 'PUT',
                body: JSON.stringify({ published: !currentStatus })
            });
            fetchExams();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDeleteQuestion = async (examId, questionIndex) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            const exam = exams.find(e => e._id === examId);
            const updatedQuestions = exam.questions.filter((_, idx) => idx !== questionIndex);

            await apiFetch(`/api/exams/${examId}`, {
                method: 'PUT',
                body: JSON.stringify({ questions: updatedQuestions })
            });

            fetchExams();
            alert('Question deleted successfully!');
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this entire exam? This action cannot be undone!')) return;

        try {
            await apiFetch(`/api/exams/${examId}`, {
                method: 'DELETE'
            });

            fetchExams();
            alert('Exam deleted successfully!');
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Manage Exams 📋</h1>
                    <p>View, edit, and manage all created exams with questions</p>
                </div>
                <button
                    onClick={() => navigate('/admin/create-exam')}
                    className="btn btn-primary"
                >
                    + Create New Exam
                </button>
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
                    {exams.map((exam) => (
                        <div key={exam._id} className="card" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                                        {exam.title}
                                    </h2>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                        <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                            {exam.questions?.length || 0} Questions
                                        </span>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏱ {exam.durationMinutes} Minutes</span>
                                        <span style={{ fontSize: 13, color: exam.resultsPublished ? '#10b981' : '#f59e0b' }}>
                                            {exam.resultsPublished ? '✅ Results Published' : '⏳ Results Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => handlePublishToggle(exam._id, exam.resultsPublished)}
                                        className={exam.resultsPublished ? "btn btn-danger" : "btn btn-primary"}
                                        style={{ fontSize: 12, padding: '8px 16px' }}
                                    >
                                        {exam.resultsPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteExam(exam._id)}
                                        className="btn btn-danger"
                                        style={{ fontSize: 12, padding: '8px 16px' }}
                                    >
                                        🗑️ Delete Exam
                                    </button>
                                </div>
                            </div>

                            {exam.questions && exam.questions.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>Questions:</div>
                                    {exam.questions.map((q, idx) => (
                                        <div key={idx} style={{
                                            padding: 12,
                                            marginBottom: 8,
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: 8,
                                            border: '1px solid var(--panel-border)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <div style={{ fontWeight: 500, color: 'var(--text-main)', flex: 1 }}>
                                                    {idx + 1}. {q.prompt}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteQuestion(exam._id, idx)}
                                                    className="btn btn-danger"
                                                    style={{ fontSize: 11, padding: '4px 8px', marginLeft: 12 }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                {q.options?.map((opt, optIdx) => (
                                                    <div
                                                        key={optIdx}
                                                        style={{
                                                            padding: '6px 10px',
                                                            background: optIdx === q.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                            border: `1px solid ${optIdx === q.correctIndex ? 'rgba(16, 185, 129, 0.3)' : 'var(--panel-border)'}`,
                                                            borderRadius: 6,
                                                            fontSize: 13,
                                                            color: 'var(--text-main)'
                                                        }}
                                                    >
                                                        {optIdx === q.correctIndex && '✓ '}{opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {exams.length === 0 && (
                        <div className="muted">No exams created yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
