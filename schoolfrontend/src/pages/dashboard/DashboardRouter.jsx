import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Dashboard from './Dashboard';
import StudentHome from '../students/StudentHome';

export default function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'STUDENT') return <StudentHome />;
    if (user?.role === 'LIBRARIAN') return <Navigate to="/library" replace />;
    if (user?.role === 'PARENT') return <Navigate to="/parent-dashboard" replace />;
    if (user?.role === 'ACCOUNTANT') return <Navigate to="/fees" replace />;
    return <Dashboard />;
}