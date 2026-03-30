import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
    const { user } = useAuth();
    const [completedVideos, setCompletedVideos] = useState([]);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [quizzesSolved, setQuizzesSolved] = useState(0);
    const [loadingStats, setLoadingStats] = useState(false);

    // Fetch stats from backend
    const fetchStats = useCallback(async () => {
        if (!user || user.role !== 'student') return;
        try {
            setLoadingStats(true);
            const response = await apiClient.get('/users/stats');
            setCompletedVideos(response.data.completedVideos || []);
            setTotalTimeSpent(response.data.timeSpent || 0);
            setQuizzesSolved(response.data.quizzesSolved || 0);
        } catch (error) {
            console.error('Error fetching learning stats:', error);
            // Fallback to local storage
            const saved = localStorage.getItem('completedVideos');
            if (saved) setCompletedVideos(JSON.parse(saved));
        } finally {
            setLoadingStats(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, fetchStats]);

    const markAsCompleted = async (videoId) => {
        if (!completedVideos.includes(videoId)) {
            const newCompleted = [...completedVideos, videoId];
            setCompletedVideos(newCompleted);
            localStorage.setItem('completedVideos', JSON.stringify(newCompleted));

            // Sync with backend if logged in
            if (user) {
                try {
                    await apiClient.post(`/users/video-complete/${videoId}`);
                } catch (error) {
                    console.error('Failed to sync video completion to backend:', error);
                }
            }
        }
    };

    const isUnlocked = (videoId) => {
        // First video of any course is always unlocked. 
        // For teacher-uploaded videos, we unlock it if it's the first one in the list or the previous one is completed.
        // For simplicity, we'll keep the logic that if you've completed X, the next one is unlocked.
        // However, we'll implement more robust logic in the component.
        return true; // The StudentDashboard handles the locking logic locally for now.
    };

    return (
        <ProgressContext.Provider value={{ 
            completedVideos, 
            markAsCompleted, 
            isUnlocked, 
            totalTimeSpent, 
            quizzesSolved, 
            fetchStats,
            loadingStats
        }}>
            {children}
        </ProgressContext.Provider>
    );
};
