import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Field, TextInput } from '../components/Form.jsx';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="grid" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card">
          <div className="h1" style={{ textAlign: 'center' }}>Welcome Back</div>
          <div className="h2" style={{ textAlign: 'center', marginBottom: 24 }}>Sign in to your account</div>

          {error ? <div className="error" style={{ marginBottom: 16 }}>{error}</div> : null}
          <form
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              try {
                await auth.login(email, password);
                navigate('/');
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Field label="Email">
                <TextInput
                  autoComplete="new-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Field label="Password">
                <TextInput
                  autoComplete="new-password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </div>

            <Button variant="primary" type="submit" style={{ width: '100%' }}>Sign In</Button>

            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/register')}>Register</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
