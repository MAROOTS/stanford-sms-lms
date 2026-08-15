import { createContext, useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

// eslint-disable-next-line react-refresh/only-export-components
export const SchoolProfileContext = createContext(null);

export function SchoolProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(() => {
        axiosClient.get('/school-profile')
            .then((res) => setProfile(res.data))
            .catch(() => setProfile(null));
    }, []);

    useEffect(() => {
        fetchProfile();
        setLoading(false);
    }, [fetchProfile]);

    return (
        <SchoolProfileContext.Provider value={{ profile, loading, refetch: fetchProfile }}>
            {children}
        </SchoolProfileContext.Provider>
    );
}