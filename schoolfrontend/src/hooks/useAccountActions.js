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
        if (!window.confirm(`Unlock this ${entityLabel}? They will be able to sign in again.`)) return false;
        try {
            await axiosClient.post(`/admin/users/${userId}/unlock`);
            toast.success('Account unlocked. They can sign in again.');
            window.dispatchEvent(new Event('account-unlocked'));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not unlock account');
            return false;
        }
    };

    return { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock };
}