// hooks/useActivityTimer.js
import { useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to track user activity time and sync with backend.
 */
const useActivityTimer = () => {
    const { user } = useAuth();
    const lastSyncTime = useRef(Date.now());
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!user || user.role !== 'student') return;

        // Function to sync time with backend
        const syncTime = async () => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastSyncTime.current) / 1000);

            if (elapsedSeconds >= 30) { // Sync every 30 seconds of activity
                try {
                    await apiClient.post('/users/time', { additionalSeconds: elapsedSeconds });
                    lastSyncTime.current = now;
                    console.log(`Synced ${elapsedSeconds}s to backend`);
                } catch (error) {
                    console.error('Error syncing time spent:', error);
                }
            }
        };

        // Set interval to check and sync
        intervalRef.current = setInterval(syncTime, 30000); // Check every 30s

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                // Try one final sync on unmount
                syncTime();
            }
        };
    }, [user]);

    return null;
};

export default useActivityTimer;
