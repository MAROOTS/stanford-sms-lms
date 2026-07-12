import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import Classes from "./pages/classes/Classes";
import Students from "./pages/students/Students";
import Teachers from "./pages/teachers/Teachers";
import Subjects from "./pages/subjects/Subjects";
import Terms from "./pages/terms/Terms";
import Exams from "./pages/exams/Exams";
import MarksEntry from "./pages/marks/MarksEntry";
import Results from "./pages/results/Results";
import ReportCards from "./pages/reportcards/ReportCards";
import Attendance from './pages/attendance/Attendance';
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard"
                element={<Dashboard/>}
              />
              <Route path="/classes" element={<Classes />} />
              <Route path="/students" element={<Students />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/marks-entry" element={<MarksEntry />} />
              <Route path="/results" element={<Results />} />
              <Route path="/report-cards" element={<ReportCards />} />
              <Route path="/attendance" element={<Attendance />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
