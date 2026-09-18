import { createContext, useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { getSubdomain } from '../utils/getSubdomain';
import { applyBrandColor, resetBrandColor } from '../utils/applyBrandColor';

// eslint-disable-next-line react-refresh/only-export-components
export const SchoolProfileContext = createContext(null);

export function SchoolProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(() => {
        const subdomain = getSubdomain();

        if (!subdomain) {
            setProfile(null);
            resetBrandColor();
            return;
        }

        axiosClient.get('/public/schools/branding', { params: { subdomain } })
            .then((res) => {
                setProfile(res.data);
                if (res.data.brandColor) applyBrandColor(res.data.brandColor);
                else resetBrandColor();
            })
            .catch(() => { setProfile(null); resetBrandColor(); });
    }, []);

    useEffect(() => {
        fetchProfile();
        setLoading(false);
    }, [fetchProfile]);

    useEffect(() => {
        const name = profile?.name?.trim();
        document.title = name ? `${name} | StanfordOS` : 'StanfordOS';

        const href = profile?.logoUrl || '/logo.png';
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.type = 'image/png';
        link.href = href;
    }, [profile]);
    return (
        <SchoolProfileContext.Provider value={{ profile, loading, refetch: fetchProfile }}>
            {children}
        </SchoolProfileContext.Provider>
    );
}