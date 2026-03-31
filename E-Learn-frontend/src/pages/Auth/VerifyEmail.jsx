import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './Auth.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Token is missing.');
                return;
            }

            try {
                const response = await apiClient.get(`/auth/verify-email?token=${token}`);
                
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                toast.success('Your email has been verified!');
            } catch (error) {
                setStatus('error');
                const errorMsg = error?.error || error?.message || 'Verification failed. The link may be expired or invalid.';
                setMessage(errorMsg);
                toast.error('Email verification failed.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="auth-container">
            <div className="auth-box" style={{ textAlign: 'center' }}>
                <h1 className="auth-title">Account Verification</h1>
                
                <div style={{ margin: '40px 0', fontSize: '1.1rem' }}>
                    {status === 'verifying' && (
                        <div className="verification-status verifying">
                            <FaSpinner className="spinner-icon" style={{ fontSize: '3rem', color: '#10b981', animation: 'spin 2s linear infinite' }} />
                            <p style={{ marginTop: '20px' }}>{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verification-status success">
                            <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981' }} />
                            <p style={{ marginTop: '20px', color: '#059669', fontWeight: '600' }}>{message}</p>
                            <Link to="/login" className="auth-button" style={{ marginTop: '30px', display: 'inline-flex', textDecoration: 'none' }}>
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="verification-status error">
                            <FaExclamationTriangle style={{ fontSize: '4rem', color: '#ef4444' }} />
                            <p style={{ marginTop: '20px', color: '#b91c1c', fontWeight: '600' }}>{message}</p>
                            <Link to="/signup" className="auth-link" style={{ marginTop: '20px', display: 'block' }}>
                                Try registering again
                            </Link>
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                ` }} />
            </div>
        </div>
    );
};

export default VerifyEmail;
