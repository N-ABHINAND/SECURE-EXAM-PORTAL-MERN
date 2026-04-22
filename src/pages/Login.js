import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, TextInput } from '../components/Form';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="grid">
      <div className="col-6">
        <div className="card">
          <div className="h1">Login</div>
          <div className="h2">Use your admin/student credentials to continue.</div>

          {error ? <div className="error" style={{ marginBottom: 10 }}>{error}</div> : null}
      <form
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
            <Field label="Email">
              <TextInput placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <TextInput
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button variant="primary" type="submit">Login</Button>
      </form>
        </div>
      </div>
      <div className="col-6">
        <div className="card">
          <div className="h1">Tip</div>
          <div className="h2">
            If you used the seed, try:
            <div className="hr" />
            <div className="muted">Admin: admin@example.com / Admin@12345</div>
            <div className="muted">Student: student@example.com / Student@12345</div>
          </div>
        </div>
      </div>
    </div>
  );
}
