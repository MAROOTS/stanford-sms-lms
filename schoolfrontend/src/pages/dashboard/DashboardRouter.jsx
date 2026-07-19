import { useAuth } from '../../context/useAuth';
import Dashboard from './Dashboard';
import StudentHome from '../students/StudentHome';

export default function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'STUDENT') return <StudentHome />;
    return <Dashboard />;
}