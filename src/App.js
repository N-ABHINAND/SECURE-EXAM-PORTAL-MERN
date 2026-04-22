import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import Layout from './components/Layout';
import { AdminRoute, PrivateRoute } from './components/Routes';
import CreateExam from './pages/admin/CreateExam';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/exams/:id"
            element={
              <PrivateRoute>
                <Exam />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/create-exam"
            element={
              <AdminRoute>
                <CreateExam />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
