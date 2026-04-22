import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const auth = useAuth();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/exams');
        setExams(data.exams || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="h1">Dashboard</div>
          <div className="h2">
            Welcome, <span className="badge">{auth.user?.email}</span>
            {auth.isAdmin ? <span className="badge">Admin</span> : <span className="badge">Student</span>}
          </div>

          {auth.isAdmin ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <Link className="btn btn-primary" to="/admin/create-exam">Create Exam</Link>
            </div>
          ) : null}

          <div className="hr" />

          <div className="h1" style={{ fontSize: 18 }}>Available Exams</div>
          {error ? <div className="error" style={{ marginTop: 10 }}>{error}</div> : null}

          <div className="list" style={{ marginTop: 10 }}>
            {exams.map((e) => (
              <div key={e._id || e.id} className="item">
                <div className="kv">
                  <div className="kv-title">{e.title}</div>
                  <div className="kv-sub">Duration: {e.durationMinutes} minutes</div>
                </div>
                <Link className="btn btn-primary" to={`/exams/${e._id || e.id}`}>
                  Start
                </Link>
              </div>
            ))}

            {exams.length === 0 ? <div className="muted">No exams yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
