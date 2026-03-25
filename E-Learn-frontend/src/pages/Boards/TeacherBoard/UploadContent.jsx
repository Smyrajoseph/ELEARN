import React, { useState } from 'react';
import { toast } from 'react-toastify';

const UploadContent = ({ onUploadSuccess }) => {
    const [uploadType, setUploadType] = useState('youtube'); // 'youtube' or 'local'

    const handleUpload = (e) => {
        e.preventDefault();
        const title = e.target.elements.videoTitle.value;
        const description = e.target.elements.videoDescription.value;
        let url = '';
        let isLocal = false;

        if (uploadType === 'youtube') {
            url = e.target.elements.videoUrl.value;
        } else {
            const file = e.target.elements.videoFile.files[0];
            if (file) {
                // Validate that it's actually a video file
                if (!file.type.startsWith('video/')) {
                    toast.error('Please upload a video file only (MP4, MKV, AVI, etc.). Text/Document files are not allowed.');
                    return;
                }
                url = URL.createObjectURL(file);
                isLocal = true;
            }
        }

        if (url) {
            const newVideo = {
                id: Date.now(),
                title,
                url,
                description,
                isLocked: false,
                isLocal
            };

            onUploadSuccess(newVideo);
            e.target.reset();
        }
    };

    return (
        <div id="upload-section" className="upload-card" style={{ marginBottom: '30px' }}>
            <h2 className="card-title">Upload Content</h2>
            <form onSubmit={handleUpload}>
                <label className="form-label">Video Title</label>
                <input name="videoTitle" type="text" placeholder="e.g. Chapter 4: Database Design" className="form-input" required />

                <div style={{ marginTop: '15px' }}>
                    <label className="form-label">Upload Method</label>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="uploadType"
                                value="youtube"
                                checked={uploadType === 'youtube'}
                                onChange={() => setUploadType('youtube')}
                            /> YouTube Link
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="uploadType"
                                value="local"
                                checked={uploadType === 'local'}
                                onChange={() => setUploadType('local')}
                            /> Local File
                        </label>
                    </div>
                </div>

                {uploadType === 'youtube' ? (
                    <>
                        <label className="form-label">Video URL (YouTube)</label>
                        <input name="videoUrl" type="url" placeholder="https://youtube.com/..." className="form-input" required />
                    </>
                ) : (
                    <>
                        <label className="form-label">Select Video File</label>
                        <input name="videoFile" type="file" accept="video/*" className="form-input" required />
                    </>
                )}

                <label className="form-label">Description</label>
                <textarea name="videoDescription" rows="3" className="form-input" required></textarea>

                <button type="submit" className="upload-btn">Upload Video</button>
            </form>
        </div>
    );
};

export default UploadContent;
