import React from 'react';

export default function TeamInfoCard({ team }) {
    return (
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
            <div className="card-body p-4 text-center border-bottom border-secondary">
                <div 
                    className="rounded-circle d-flex justify-content-center align-items-center text-white mx-auto mb-3 shadow" 
                    style={{ width: '90px', height: '90px', fontSize: '2.5rem', background: 'linear-gradient(45deg, #10b981, #047857)' }}
                >
                    {team.name.charAt(0)}
                </div>
                <h4 className="fw-bold text-white mb-1">{team.name}</h4>
                <span className="badge bg-dark border border-secondary text-info mt-2 px-3 py-2 rounded-pill shadow-sm">
                    🏆 {team.leagueName}
                </span>
            </div>
            
            <div className="card-body p-4">
                <h6 className="fw-bold text-light opacity-50 text-uppercase small mb-4 tracking-wide">Club Details</h6>
                
                <div className="d-flex align-items-center mb-4">
                    <div className="bg-dark rounded p-2 me-3 text-info shadow-sm">
                        <i className="bi bi-geo-alt-fill fs-5"></i>
                    </div>
                    <div>
                        <div className="small text-light opacity-50 lh-1 mb-1">City</div>
                        <div className="fw-bold text-white fs-5">{team.city || 'Unknown'}</div>
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    <div className="bg-dark rounded p-2 me-3 text-warning shadow-sm">
                        <i className="bi bi-house-door-fill fs-5"></i>
                    </div>
                    <div>
                        <div className="small text-light opacity-50 lh-1 mb-1">Stadium</div>
                        <div className="fw-bold text-white fs-5">{team.stadium || 'Unknown'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}