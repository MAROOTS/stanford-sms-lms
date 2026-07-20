import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
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
import FeeCollection from './pages/fees/FeeCollection';
import FeeItems from './pages/fees/FeeItems';
import NotFound from './pages/NotFound';
import Library from './pages/library/Library';
import Loans from './pages/library/Loans';
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import MyAttendance from './pages/students/MyAttendance';
import MyResults from './pages/students/MyResults';
import MyReportCards from './pages/students/MyReportCards';
import MyFees from './pages/students/MyFees';
import MyLibrary from './pages/students/MyLibrary';
import AnnouncementsRouter from './pages/announcements/AnnouncementsRouter';
export default function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
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
                <Route path="/dashboard" element={<DashboardRouter />} />
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
                <Route path="/fees" element={<FeeCollection />} />
                <Route path="/fee-items" element={<FeeItems />} />
                <Route path="/library" element={<Library />} />
                <Route path="/library/loans" element={<Loans />} />
                <Route path="/announcements" element={<AnnouncementsRouter />} />

                <Route path="/my-attendance" element={<MyAttendance />} />
                <Route path="/my-results" element={<MyResults />} />
                <Route path="/my-report-cards" element={<MyReportCards />} />
                <Route path="/my-fees" element={<MyFees />} />
                <Route path="/my-library" element={<MyLibrary />} />

              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}
