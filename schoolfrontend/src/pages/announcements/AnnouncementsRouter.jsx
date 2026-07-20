import { useAuth } from '../../context/useAuth';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import AnnouncementsView from './AnnouncementsView';

export default function AnnouncementsRouter() {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return <AnnouncementsAdmin />;
    return <AnnouncementsView />;
}