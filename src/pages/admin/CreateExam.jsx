import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { Button, Field, TextArea, TextInput } from '../../components/Form.jsx';

function emptyQuestion() {
  return { prompt: '', optionsText: 'Option A\nOption B\nOption C\nOption D', correctIndex: 0 };
}

export default function CreateExam() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const payload = useMemo(() => {
    // ... logic remains same ...
    const qs = questions.map((q) => {
      const options = (q.optionsText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      return { prompt: q.prompt.trim(), options, correctIndex: Number(q.correctIndex) };
    });

    return {
      title: title.trim(),
      durationMinutes: Number(durationMinutes),
      questions: qs
    };
  }, [title, durationMinutes, questions]);

  const canSubmit = useMemo(() => {
    // ... logic remains same ...
    if (!payload.title) return false;
    if (!Number.isFinite(payload.durationMinutes) || payload.durationMinutes < 1) return false;
    if (!payload.questions.length) return false;
    for (const q of payload.questions) {
      if (!q.prompt) return false;
      if (!Array.isArray(q.options) || q.options.length < 2) return false;
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return false;
    }
    return true;
  }, [payload]);

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="h1" style={{ marginBottom: 0 }}>Create Exam</div>
            <Button variant="secondary" onClick={() => navigate('/')}>Back</Button>
          </div>
          <div className="h2" style={{ marginBottom: 20 }}>Configure assessment details.</div>


          {error ? <div className="error" style={{ marginBottom: 10 }}>{error}</div> : null}
          {ok ? <div className="ok" style={{ marginBottom: 10 }}>{ok}</div> : null}

          <div className="grid">
            <div className="col-6">
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Eg: JavaScript Basics" />
              </Field>
            </div>
            <div className="col-6">
              <Field label="Duration (minutes)">
                <TextInput
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="hr" />

          <div className="h1" style={{ fontSize: 18 }}>Questions</div>
          <div className="muted" style={{ marginBottom: 10 }}>
            Enter one option per line.
          </div>

          <div className="list">
            {questions.map((q, idx) => (
              <div key={idx} className="card" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="kv">
                    <div className="kv-title">Question {idx + 1}</div>
                    <div className="kv-sub">Prompt + options</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="danger"
                      type="button"
                      disabled={questions.length === 1}
                      onClick={() => {
                        setQuestions((prev) => prev.filter((_, i) => i !== idx));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="hr" />

                <Field label="Prompt">
                  <TextArea
                    rows={3}
                    value={q.prompt}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuestions((prev) => prev.map((x, i) => (i === idx ? { ...x, prompt: v } : x)));
                    }}
                    placeholder="Write the question here..."
                  />
                </Field>

                <div className="grid">
                  <div className="col-6">
                    <Field label="Options (one per line)">
                      <TextArea
                        rows={5}
                        value={q.optionsText}
                        onChange={(e) => {
                          const v = e.target.value;
                          setQuestions((prev) => prev.map((x, i) => (i === idx ? { ...x, optionsText: v } : x)));
                        }}
                      />
                    </Field>
                  </div>
                  <div className="col-6">
                    <Field label="Correct Answer Index (0 for Option A)">
                      <TextInput
                        type="number"
                        min={0}
                        value={q.correctIndex}
                        onChange={(e) => {
                          const v = e.target.value;
                          setQuestions((prev) => prev.map((x, i) => (i === idx ? { ...x, correctIndex: v } : x)));
                        }}
                      />
                    </Field>

                    <div className="muted" style={{ fontSize: 13 }}>
                      Example: if the correct option is the 2nd option, use 1.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <Button
              type="button"
              onClick={() => {
                setQuestions((prev) => [...prev, emptyQuestion()]);
              }}
            >
              Add Question
            </Button>

            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={async () => {
                setError('');
                setOk('');
                try {
                  const data = await apiFetch('/api/exams', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                  });
                  setOk(`Exam created: ${data.examId}`);
                  setTitle('');
                  setDurationMinutes(30);
                  setQuestions([emptyQuestion()]);
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Create Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
