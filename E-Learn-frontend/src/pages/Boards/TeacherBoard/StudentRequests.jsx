import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const StudentRequests = ({ requests, onApprove, onReject }) => {
    return (
        <div id="request-section" className="upload-card" style={{ marginBottom: '30px', background: '#f0fdf4', border: '1px solid #c6f6d5' }}>
            <h2 className="card-title" style={{ color: '#006D5B' }}>Pending Student Approvals</h2>
            {requests.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No pending requests at the moment.</p>
            ) : (
                <div className="request-table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #006D5B', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Email</th>
                                <th style={{ padding: '12px' }}>Course</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request._id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px' }}>{request.userInfo?.name || 'Unknown'}</td>
                                    <td style={{ padding: '12px' }}>{request.userInfo?.email || 'Unknown'}</td>
                                    <td style={{ padding: '12px' }}>{request.course_id || 'Unknown'}</td>
                                    <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => onApprove(request._id)}
                                            style={{ background: '#006D5B', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            onClick={() => onReject(request._id)}
                                            style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentRequests;
