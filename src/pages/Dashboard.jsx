import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Form';

export default function Dashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const examsData = await apiFetch('/api/exams');
      setExams(examsData.exams || []);

      const lbData = await apiFetch('/api/auth/leaderboard');
      setLeaderboard(lbData.leaderboard || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth.isAuthed]);

  const handlePublishToggle = async (examId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} results for this exam?`)) return;

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

  // Admin Dashboard
  if (auth.isAdmin) {
    return (
      <div>
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Admin Dashboard</h1>
            <p>Manage exams, publish results, and monitor student performance</p>
          </div>
          <Link to="/admin/create-exam" className="btn btn-primary">
            + Create New Exam
          </Link>
        </div>

        {/* Syllabus Section */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>Frontend Development Syllabus</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>Topics covered in the exams</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            {['HTML5 & Semantic Markup', 'CSS3 & Responsive Design', 'JavaScript ES6+', 'React.js Fundamentals', 'State Management', 'Component Lifecycle', 'Hooks & Custom Hooks', 'Routing & Navigation', 'API Integration', 'Performance Optimization'].map((topic, idx) => (
              <div key={idx} style={{
                padding: '10px 14px',
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: 8,
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: 13,
                color: '#a5b4fc',
                fontWeight: 500
              }}>
                {topic}
              </div>
            ))}
          </div>
        </div>

        <div className="grid">
          <div className="col-12">
            <div className="h1" style={{ fontSize: 20 }}>Exam Management</div>

            {error && (
              <div style={{
                padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
              }}>
                Warning: {error}
              </div>
            )}

            {exams.map((e, idx) => (
              <div key={e._id} className="learning-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="title" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                      {e.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        {e.questions?.length || 0} Questions
                      </span>
                      <span className="text-muted" style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {e.durationMinutes} Minutes</span>
                      <span className="text-muted" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {e.resultsPublished ? '✅ Published' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePublishToggle(e._id, e.resultsPublished)}
                    className={e.resultsPublished ? "btn btn-danger" : "btn"}
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    {e.resultsPublished ? 'Unpublish' : 'Publish Results'}
                  </button>
                </div>
              </div>
            ))}
            {exams.length === 0 && <div className="muted">No exams created yet. Create your first exam!</div>}
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  return (
    <div>
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, {auth.user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p>View available exams and track your performance</p>
        </div>
        <div style={{
          padding: '12px 24px',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '8px',
          color: '#a5b4fc',
          fontWeight: 600,
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          Your Rank: #{leaderboard.findIndex(u => u.email === auth.user?.email) + 1 || 'N/A'}
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>Frontend Development Syllabus</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>Topics you'll be tested on</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {['HTML5 & Semantic Markup', 'CSS3 & Responsive Design', 'JavaScript ES6+', 'React.js Fundamentals', 'State Management', 'Component Lifecycle', 'Hooks & Custom Hooks', 'Routing & Navigation', 'API Integration', 'Performance Optimization'].map((topic, idx) => (
            <div key={idx} style={{
              padding: '10px 14px',
              background: 'rgba(99, 102, 241, 0.15)',
              borderRadius: 8,
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: 13,
              color: '#a5b4fc',
              fontWeight: 500
            }}>
              {topic}
            </div>
          ))}
        </div>
      </div>

      <div className="grid">
        <div className="col-8">
          <div className="h1" style={{ fontSize: 20 }}>Available Exams</div>

          {error && (
            <div style={{
              padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
            }}>
              Warning: {error}
            </div>
          )}

          {exams.map((e, idx) => (
            <div key={e._id} className={`learning-card ${idx === 0 ? 'active' : ''}`} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="title" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                    {e.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="tag tag-learning">EXAM</span>
                    <span className="text-muted" style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {e.durationMinutes} Minutes</span>
                    <span className="text-muted" style={{ fontSize: 12, color: 'var(--text-muted)' }}>📝 {e.questions?.length || 0} Questions</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('Button clicked! Navigating to:', e._id);
                    navigate(`/exams/${e._id}`);
                  }}
                  style={{ padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}
                >
                  Start Exam →
                </button>
              </div>
            </div>
          ))}
          {exams.length === 0 && <div className="muted">No exams available at the moment.</div>}
        </div>

        <div className="col-4">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>Leaderboard</div>
              <Link to="/leaderboard" style={{ color: '#818cf8', fontSize: 12, textDecoration: 'none' }}>View All →</Link>
            </div>

            <div className="list" style={{ padding: 0 }}>
              {leaderboard.slice(0, 5).map((student, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                    color: idx < 3 ? 'white' : '#9ca3af',
                    display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 12
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{student.shortName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{student.rollNo}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                    {student.xp.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Your Performance</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Track your progress</div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">⚡ {(auth.user?.xp || 0).toLocaleString()}</div>
                <div className="stat-label">Total XP</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">🏆 #{leaderboard.findIndex(u => u.email === auth.user?.email) + 1 || '-'}</div>
                <div className="stat-label">Your Rank</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

