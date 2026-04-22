import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import InchargeLayout from './layouts/InchargeLayout';
import EmployeeLayout from './layouts/EmployeeLayout'; // Keeping for potential partial reuse

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ExamManagement from './pages/admin/ExamManagement';
import ExamEditor from './pages/admin/ExamEditor';
import AdminResults from './pages/admin/Results';
import ExamResultsDetail from './pages/admin/ExamResultsDetail';

// Incharge Pages
import InchargeDashboard from './pages/incharge/Dashboard';
import EmployeeList from './pages/common/EmployeeList';
import EmployeeDetails from './pages/common/EmployeeDetails';
import CommonResults from './pages/common/Results';

// Legacy/Employee Pages (if needed for partial reuse)
import ExamAttempt from './pages/employee/ExamAttempt';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="exams/new" element={<ExamEditor />} />
          <Route path="exams/edit/:id" element={<ExamEditor />} />
          <Route path="results" element={<CommonResults />} />
          <Route path="results/:examId" element={<ExamResultsDetail />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
        </Route>

        {/* Incharge Routes */}
        <Route path="/incharge" element={<InchargeLayout />}>
          <Route index element={<InchargeDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="results" element={<CommonResults />} />
          <Route path="results/:examId" element={<ExamResultsDetail />} />
          {/* Exam attempt flow will be child routes or sub-pages of Dashboard */}
          <Route path="exam/:examId" element={<ExamAttempt />} />
        </Route>

        {/* Legacy Employee Routes - Disabled / Redirect to Login */}
        <Route path="/employee/*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
