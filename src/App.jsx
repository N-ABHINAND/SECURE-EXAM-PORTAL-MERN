import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Exam from './pages/Exam.jsx';
import Layout from './components/Layout.jsx';
import { AdminRoute, PrivateRoute } from './components/Routes.jsx';
import CreateExam from './pages/admin/CreateExam.jsx';
import ManageExams from './pages/admin/ManageExams.jsx';
import ViewSubmissions from './pages/admin/ViewSubmissions.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import MyExams from './pages/MyExams.jsx';
import MyResults from './pages/MyResults.jsx';
import NotFound from './pages/NotFound.jsx';
import Results from './pages/Results.jsx';

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

          {/* Student Routes */}
          <Route
            path="/my-exams"
            element={
              <PrivateRoute>
                <MyExams />
              </PrivateRoute>
            }
          />

          <Route
            path="/results"
            element={
              <PrivateRoute>
                <MyResults />
              </PrivateRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/create-exam"
            element={
              <AdminRoute>
                <CreateExam />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/manage-exams"
            element={
              <AdminRoute>
                <ManageExams />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/submissions"
            element={
              <AdminRoute>
                <ViewSubmissions />
              </AdminRoute>
            }
          />

          <Route
            path="/results/:submissionId"
            element={
              <PrivateRoute>
                <Results />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
