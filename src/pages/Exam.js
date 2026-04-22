import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Button } from '../components/Form';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Exam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/exams/${id}`);
        setExam(data.exam);
        setAnswers(new Array(data.exam.questions.length).fill(-1));
        setSecondsLeft(Number(data.exam.durationMinutes) * 60);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!exam) return undefined;
    if (result) return undefined;
    if (secondsLeft == null) return undefined;

    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [exam, result, secondsLeft]);

  useEffect(() => {
    if (!exam) return;
    if (result) return;
    if (secondsLeft !== 0) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    (async () => {
      try {
        const data = await apiFetch(`/api/exams/${id}/submit`, {
          method: 'POST',
          body: JSON.stringify({ answers })
        });
        setResult(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [exam, result, secondsLeft, id, answers]);

  const canSubmit = useMemo(() => answers.length > 0 && answers.every((a) => a >= 0), [answers]);

  if (error) return <div className="card error">{error}</div>;
  if (!exam) return <div className="card">Loading...</div>;

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kv">
              <div className="h1">{exam.title}</div>
              <div className="h2">Answer all questions and submit before time runs out.</div>
            </div>
            <div className="pill">
              Time left: <b>{secondsLeft == null ? '--:--' : formatTime(secondsLeft)}</b>
            </div>
          </div>

          {result ? (
            <div className="card" style={{ marginTop: 12, background: 'rgba(45, 212, 191, 0.10)' }}>
              <div className="h1" style={{ fontSize: 18 }}>Submitted</div>
              <div className="muted">Score</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{result.score} / {result.total}</div>
            </div>
          ) : null}

          <div className="hr" />

          <div className="list">
            {exam.questions.map((q, idx) => (
              <div key={idx} className="card" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="kv">
                  <div className="kv-title">{idx + 1}. {q.prompt}</div>
                  <div className="kv-sub">Choose one option</div>
                </div>

                <div className="hr" />

                <div className="list">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="item" style={{ cursor: result ? 'default' : 'pointer' }}>
                      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          disabled={!!result}
                          checked={answers[idx] === oi}
                          onChange={() => {
                            const next = answers.slice();
                            next[idx] = oi;
                            setAnswers(next);
                          }}
                        />
                        <div>{opt}</div>
                      </div>
                      {answers[idx] === oi ? <span className="pill">Selected</span> : <span className="pill"> </span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              disabled={!canSubmit || !!result || secondsLeft === 0}
              onClick={async () => {
                try {
                  const data = await apiFetch(`/api/exams/${id}/submit`, {
                    method: 'POST',
                    body: JSON.stringify({ answers })
                  });
                  setResult(data);
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              Submit
            </Button>

            {!canSubmit && !result ? <span className="muted">Answer all questions to enable submit.</span> : null}
            {secondsLeft === 0 && !result ? <span className="error">Time is up. Submitting…</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
