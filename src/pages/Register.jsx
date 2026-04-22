import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Field, TextInput } from '../components/Form.jsx';

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="h1">Create Account</div>
          <div className="h2">Enter your details to create a new account.</div>

          {error ? <div className="error" style={{ marginBottom: 10 }}>{error}</div> : null}
          <form
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              try {
                await auth.register(name, email, password, department, college);
                navigate('/');
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            <div className="grid">
              <div className="col-6">
                <Field label="Full Name">
                  <TextInput
                    autoComplete="off"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Email">
                  <TextInput
                    autoComplete="new-email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Password">
                  <TextInput
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Department">
                  <TextInput
                    placeholder="e.g., Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-12">
                <Field label="College Name">
                  <TextInput
                    placeholder="e.g., XYZ Institute of Technology"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="hr" />

            <Button variant="primary" type="submit">Create account</Button>

            <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              💡 Department and College are optional but recommended for better profile management.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
