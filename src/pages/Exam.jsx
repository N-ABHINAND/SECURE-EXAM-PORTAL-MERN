import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Button } from '../components/Form.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [exam, setExam] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('')
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(null);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(45);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [studentName, setStudentName] = useState(auth.user?.name || '');
  const submittedRef = useRef(false);



  // Shuffle questions and options when exam loads
  useEffect(() => {
    (async () => {
      try {
        console.log('Loading exam with ID:', id);
        const data = await apiFetch(`/api/exams/${id}`);
        console.log('Exam data received:', data);

        // Shuffle questions and also shuffle options within each question
        const shuffled = shuffleArray(
          data.exam.questions.map((q, questionIdx) => {
            // Create array of options with their original indices
            const optionsWithIndices = q.options.map((opt, optIdx) => ({
              text: opt,
              originalIndex: optIdx
            }));

            // Shuffle the options
            const shuffledOptions = shuffleArray(optionsWithIndices);

            return {
              ...q,
              originalIndex: questionIdx,
              options: shuffledOptions.map(o => o.text), // Just the text for display
              optionMapping: shuffledOptions.map(o => o.originalIndex) // Track original indices
            };
          })
        );

        console.log('Questions shuffled:', shuffled.length);
        setExam(data.exam);
        setShuffledQuestions(shuffled);
        setAnswers(new Array(data.exam.questions.length).fill(-1));
        setTotalSecondsLeft(Number(data.exam.durationMinutes) * 60);
      } catch (err) {
        console.error('Error loading exam:', err);
        setError(err.message);
      }
    })();
  }, [id]);

  // Start exam - enter fullscreen
  const startExam = async () => {
    console.log('Starting exam...', { studentName, hasExam: !!exam, questionCount: shuffledQuestions.length });

    try {
      // Request fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      console.log('Exam started successfully');
      setExamStarted(true);
    } catch (err) {
      console.error('Fullscreen error:', err);
      console.log('Starting exam without fullscreen');
      setExamStarted(true); // Start anyway
    }
  };

  // Prevent copy, cut, paste, right-click with warnings
  useEffect(() => {
    if (!examStarted || result) return;

    const preventCopy = (e) => {
      e.preventDefault();
      alert('⚠️ Warning: Copying text is not allowed during the exam!');
    };

    const preventCut = (e) => {
      e.preventDefault();
      alert('⚠️ Warning: Cutting text is not allowed during the exam!');
    };

    const preventPaste = (e) => {
      e.preventDefault();
      alert('⚠️ Warning: Pasting text is not allowed during the exam!');
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      alert('⚠️ Warning: Right-click is not allowed during the exam!');
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCut);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [examStarted, result]);

  // Detect tab switching and fullscreen exit
  useEffect(() => {
    if (!examStarted || result) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        alert('⚠️ Warning: Tab switching detected! Your exam may be auto-submitted if you continue.');
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen && examStarted && !result) {
        setTabSwitchCount(prev => prev + 1);
        alert('⚠️ Warning: You exited fullscreen! Attempting to re-enter fullscreen mode...');

        // Improved fullscreen re-entry with retry
        const attemptFullscreen = async () => {
          try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
              await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
              await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
              await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
              await elem.msRequestFullscreen();
            }
          } catch (err) {
            console.error('Fullscreen re-entry failed:', err);
            // Retry after a short delay
            setTimeout(() => {
              attemptFullscreen();
            }, 500);
          }
        };

        attemptFullscreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [examStarted, result]);

  // Inactivity detection - 30 seconds of no interaction = violation
  useEffect(() => {
    if (!examStarted || result) return;

    let inactivityTimer;
    const INACTIVITY_LIMIT = 30000; // 30 seconds

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (examStarted && !result) {
          setTabSwitchCount(prev => prev + 1);
          alert('⚠️ Warning: Inactivity detected! Please stay active during the exam.');
        }
      }, INACTIVITY_LIMIT);
    };

    // Track various user activities
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activities.forEach(activity => {
      document.addEventListener(activity, resetInactivityTimer);
    });

    // Start the timer initially
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activities.forEach(activity => {
        document.removeEventListener(activity, resetInactivityTimer);
      });
    };
  }, [examStarted, result]);

  // Track violations but don't auto-submit
  // Students must manually submit their exam
  useEffect(() => {
    if (tabSwitchCount >= 3 && examStarted && !result) {
      // Just show a warning, don't auto-submit
      alert('Warning: You have 3 violations. Your violation count will be reported to the administrator.');
    }
  }, [tabSwitchCount, examStarted, result]);

  // Total exam timer
  useEffect(() => {
    if (!examStarted || !exam || result || totalSecondsLeft == null) return undefined;

    const t = setInterval(() => {
      setTotalSecondsLeft((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [exam, examStarted, result, totalSecondsLeft]);

  // Per-question timer (45 seconds)
  useEffect(() => {
    if (!examStarted || result || questionSecondsLeft == null) return undefined;

    const t = setInterval(() => {
      setQuestionSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [examStarted, result, questionSecondsLeft]);

  // Auto-advance to next question when time runs out
  useEffect(() => {
    if (questionSecondsLeft === 0 && examStarted && !result) {
      // Move to next question
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionSecondsLeft(45);
      } else {
        // Last question, submit exam
        if (!submittedRef.current) {
          handleSubmit();
        }
      }
    }
  }, [questionSecondsLeft, currentQuestionIndex, shuffledQuestions.length, examStarted, result]);

  // Auto-submit when total time runs out
  useEffect(() => {
    if (totalSecondsLeft === 0 && examStarted && !result && !submittedRef.current) {
      handleSubmit();
    }
  }, [totalSecondsLeft, examStarted, result]);

  const handleSubmit = async (isViolationArg = false) => {
    // If it's a React event, reset to false
    const isViolation = isViolationArg === true;

    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      // Ensure student name is set (fallback to auth user name)
      const submissionName = studentName.trim() || auth.user?.name || 'Anonymous Student';

      // Map shuffled answers back to original question order AND original option indices
      const originalOrderAnswers = new Array(exam.questions.length).fill(-1);
      shuffledQuestions.forEach((q, shuffledIdx) => {
        const studentSelectedShuffledOption = answers[shuffledIdx];

        // If student answered this question, map the shuffled option index to original option index
        if (studentSelectedShuffledOption !== -1) {
          const originalOptionIndex = q.optionMapping[studentSelectedShuffledOption];
          originalOrderAnswers[q.originalIndex] = originalOptionIndex;
        } else {
          originalOrderAnswers[q.originalIndex] = -1;
        }
      });

      const data = await apiFetch(`/api/exams/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: originalOrderAnswers,
          studentName: submissionName,
          violationCount: tabSwitchCount,
          autoSubmitted: isViolation
        })
      });

      setResult({
        ...data,
        isViolation: isViolation,
        violationCount: tabSwitchCount
      });
      setError(''); // Clear any previous errors

      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (e) {
      console.error('Submission error:', e);


      // Clean error message - hide technical details
      let cleanMsg = 'Failed to submit exam. Please contact your administrator.';

      if (e.status === 409 || (e.message && e.message.includes('Already submitted'))) {
        cleanMsg = 'You have already submitted this exam.';
      } else if (e.status === 401 || (e.message && e.message.includes('401'))) {
        cleanMsg = 'Session expired. Please login again.';
      } else if (e.status === 400) {
        cleanMsg = 'Invalid submission data. Please try again.';
      } else if (e.message) {
        // Fallback for other errors with messages
        cleanMsg = e.message;
      }

      setResult({
        score: 0,
        total: exam.questions.length,
        error: true,
        errorMessage: cleanMsg
      });

      // Reset submittedRef so user can try again
      submittedRef.current = false;

      // Also try to exit fullscreen
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (fsErr) {
        console.error('Failed to exit fullscreen:', fsErr);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionSecondsLeft(45);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionSecondsLeft(45);
    }
  };

  const canSubmit = useMemo(() => answers.every((a) => a >= 0), [answers]);
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (error) return <div className="card error">{error}</div>;
  if (!exam || shuffledQuestions.length === 0) return <div className="card">Loading exam...</div>;

  // Pre-start screen
  if (!examStarted) {
    return (
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="h1">{exam.title}</div>
            <div className="h2">Exam Instructions</div>

            <div className="hr" />

            <div style={{ marginBottom: 16 }}>
              <div className="label">Your Name</div>
              <input
                className="input"
                type="text"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                style={{ marginBottom: 16 }}
              />

              <div className="kv-title" style={{ marginBottom: 8 }}>⚠️ Important Rules:</div>
              <ul style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                <li>This exam will open in <strong>fullscreen mode</strong></li>
                <li>You <strong>cannot copy or paste</strong> text</li>
                <li>Each question has a <strong>45-second time limit</strong></li>
                <li>Questions will <strong>auto-advance</strong> when time runs out</li>
                <li><strong>Do not switch tabs</strong> or exit fullscreen (violations will be tracked)</li>
                <li><strong>Stay active</strong> - 30 seconds of inactivity counts as a violation</li>
                <li>3 violations will result in <strong>auto-submission</strong></li>
                <li>Total exam duration: <strong>{exam.durationMinutes} minutes</strong></li>
                <li>Total questions: <strong>{exam.questions.length}</strong></li>
              </ul>
            </div>

            <Button
              variant="primary"
              onClick={startExam}
              disabled={!studentName || studentName.trim().length < 2}
            >
              I understand - Start Exam
            </Button>
            {!studentName || studentName.trim().length < 2 ? (
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Please enter your name to continue
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Exam in progress or completed
  return (
    <div className="grid" style={{ userSelect: 'none' }}>
      <div className="col-12">
        <div className="card">
          {/* Header */}
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="kv">
              <div className="h1">{exam.title}</div>
              <div className="h2">
                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                {tabSwitchCount > 0 && (
                  <span className="error" style={{ marginLeft: 10 }}>
                    ⚠️ Violations: {tabSwitchCount}/3
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="pill" style={{ background: 'rgba(255, 77, 109, 0.18)', borderColor: 'rgba(255, 77, 109, 0.5)' }}>
                Question Time: <b>{formatTime(questionSecondsLeft)}</b>
              </div>
              <div className="pill">
                Total Time: <b>{totalSecondsLeft == null ? '--:--' : formatTime(totalSecondsLeft)}</b>
              </div>
            </div>
          </div>

          {result ? (
            <div className="card" style={{
              marginTop: 12,
              background: result.error ? 'rgba(255, 77, 109, 0.10)' : (result.isViolation && result.violationCount > 0) ? 'rgba(255, 159, 10, 0.10)' : 'rgba(45, 212, 191, 0.10)'
            }}>
              <div className="h1" style={{ fontSize: 18 }}>
                {result.error ? 'Submission Error' : (result.isViolation && result.violationCount > 0) ? 'Exam Auto-Submitted (Violations Detected)' : 'Exam Submitted'}
              </div>

              {result.error ? (
                <>
                  {result.isViolation && result.violationCount > 0 && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255, 159, 10, 0.15)',
                      border: '1px solid rgba(255, 159, 10, 0.3)',
                      borderRadius: '8px',
                      marginTop: 12,
                      marginBottom: 12,
                      color: '#ff9f0a'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Violation Warning</div>
                      <div style={{ fontSize: 13 }}>
                        Your exam was auto-submitted due to {result.violationCount} violations (tab switching, exiting fullscreen, or inactivity).
                        This has been reported to the administrator.
                      </div>
                    </div>
                  )}

                  <div className="error" style={{ marginTop: 12, fontSize: 14 }}>
                    {result.errorMessage}
                  </div>
                  <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                    Your answers: {answers.filter(a => a !== -1).length} / {shuffledQuestions.length} answered
                  </div>
                </>
              ) : (
                <>
                  {result.isViolation && result.violationCount > 0 && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255, 159, 10, 0.15)',
                      border: '1px solid rgba(255, 159, 10, 0.3)',
                      borderRadius: '8px',
                      marginTop: 12,
                      marginBottom: 12,
                      color: '#ff9f0a'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Violation Warning</div>
                      <div style={{ fontSize: 13 }}>
                        Your exam was auto-submitted due to {result.violationCount} violations (tab switching, exiting fullscreen, or inactivity).
                        This has been reported to the administrator.
                      </div>
                    </div>
                  )}

                  <div className="muted">Your Score</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
                    {result.score} / {result.total}
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    Percentage: {Math.round((result.score / result.total) * 100)}%
                  </div>
                </>
              )}

              <Button variant="primary" onClick={() => navigate('/')} style={{ marginTop: 12 }}>
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="hr" />

              {/* Current Question */}
              {currentQuestion && (
                <div className="card" style={{ background: 'rgba(255,255,255,0.04)', marginTop: 12 }}>
                  <div className="kv">
                    <div className="kv-title" style={{ fontSize: 18 }}>{currentQuestion.prompt}</div>
                    <div className="kv-sub">Select one option</div>
                  </div>

                  <div className="hr" />

                  <div className="list">
                    {currentQuestion.options.map((opt, oi) => (
                      <label key={oi} className="item" style={{ cursor: 'pointer' }}>
                        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                          <input
                            type="radio"
                            name={`q-${currentQuestionIndex}`}
                            checked={answers[currentQuestionIndex] === oi}
                            onChange={() => {
                              const next = answers.slice();
                              next[currentQuestionIndex] = oi;
                              setAnswers(next);
                            }}
                          />
                          <div>{opt}</div>
                        </div>
                        {answers[currentQuestionIndex] === oi && <span className="pill">Selected</span>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </Button>

                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleNextQuestion}
                    disabled={answers[currentQuestionIndex] === -1}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    Submit Exam
                  </Button>
                )}

                {!canSubmit && (
                  <span className="muted">
                    Answer question {answers.findIndex(a => a === -1) + 1} to continue
                  </span>
                )}
              </div>

              {/* Progress indicator */}
              <div style={{ marginTop: 14 }}>
                <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
                  Progress: {answers.filter(a => a !== -1).length} / {shuffledQuestions.length} answered
                </div>
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(answers.filter(a => a !== -1).length / shuffledQuestions.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary), var(--ok))',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
