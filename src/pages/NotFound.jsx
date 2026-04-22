import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card">
      <div className="h1">Page not found</div>
      <div className="h2">The page you are looking for doesn’t exist.</div>
      <Link className="btn btn-primary" to="/">Go to Dashboard</Link>
    </div>
  );
}
