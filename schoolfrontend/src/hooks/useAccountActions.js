import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export function useAccountActions(toast, { entityLabel = 'user' } = {}) {
    const [resetCredentials, setResetCredentials] = useState(null);

    const handleResetPassword = async (userId) => {
        if (!window.confirm(`Generate a new temporary password for this ${entityLabel}?`)) return;
        try {
            const { data } = await axiosClient.post(`/admin/users/${userId}/reset-password`);
            setResetCredentials(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not reset password');
        }
    };

    const handleUnlock = async (userId) => {
        try {
            await axiosClient.post(`/admin/users/${userId}/unlock`);
            toast.success('Account unlocked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not unlock account');
        }
    };

    return { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock };
}