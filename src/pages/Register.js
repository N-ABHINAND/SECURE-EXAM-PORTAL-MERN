import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, TextInput } from '../components/Form';

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="grid">
      <div className="col-6">
        <div className="card">
          <div className="h1">Create Account</div>
          <div className="h2">Register as a student (or admin if your email matches ADMIN_EMAIL).</div>

          {error ? <div className="error" style={{ marginBottom: 10 }}>{error}</div> : null}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            await auth.register(name, email, password);
            navigate('/');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
            <Field label="Name">
              <TextInput placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
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
            <Button variant="primary" type="submit">Create account</Button>
      </form>
        </div>
      </div>
      <div className="col-6">
        <div className="card">
          <div className="h1">Admin access</div>
          <div className="h2">
            To register as admin, set <span className="badge">ADMIN_EMAIL</span> in backend and register using that email.
          </div>
        </div>
      </div>
    </div>
  );
}
