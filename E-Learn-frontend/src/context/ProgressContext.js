import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockVideos } from '../data/mockData';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
    // Initialize from localStorage or default to only the first video unlocked
    const [completedVideos, setCompletedVideos] = useState(() => {
        const saved = localStorage.getItem('completedVideos');
        return saved ? JSON.parse(saved) : [];
    });

    const [unlockedVideos, setUnlockedVideos] = useState(() => {
        // ID 101 is always unlocked.
        return [101, ...completedVideos.map(id => id + 1)]; // Simple logic: completing 101 unlocks 101+1 (if IDs are sequential)
        // A better logic would be to find the index in mockVideos and unlock index+1
    });

    useEffect(() => {
        localStorage.setItem('completedVideos', JSON.stringify(completedVideos));

        // Merge mock videos with teacher-uploaded videos
        const saved = localStorage.getItem('teacherVideos');
        const teacherVideos = saved ? JSON.parse(saved) : [];
        const combinedVideos = [...mockVideos];

        teacherVideos.forEach(tv => {
            if (!combinedVideos.find(v => v.id === tv.id)) {
                combinedVideos.push(tv);
            }
        });

        // Update unlocked videos based on completion
        const newUnlocked = [combinedVideos[0].id]; // First one always unlocked

        combinedVideos.forEach((video, index) => {
            if (completedVideos.includes(video.id)) {
                if (index + 1 < combinedVideos.length) {
                    newUnlocked.push(combinedVideos[index + 1].id);
                }
            }
        });

        setUnlockedVideos(newUnlocked);

    }, [completedVideos]);

    const markAsCompleted = (videoId) => {
        if (!completedVideos.includes(videoId)) {
            setCompletedVideos(prev => [...prev, videoId]);
        }
    };

    const isUnlocked = (videoId) => {
        return unlockedVideos.includes(videoId);
    };

    return (
        <ProgressContext.Provider value={{ completedVideos, markAsCompleted, isUnlocked }}>
            {children}
        </ProgressContext.Provider>
    );
};
