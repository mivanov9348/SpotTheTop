import React from 'react';

export default function PlayerProfileModal({ player, onClose }) {
    if (!player) return null;

    return (
        <>
            {/* Тъмен фон (Overlay) */}
            <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
            
            {/* Самият Модал */}
            <div className="modal fade show d-block" tabIndex="-1" onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        
                        {/* Хедър с градиент */}
                        <div className="modal-header border-0 bg-success bg-gradient text-white p-4">
                            <h4 className="modal-title fw-bold mb-0">Player Dossier</h4>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-0">
                            {/* Горна секция: Снимка и Основни данни */}
                            <div className="bg-light p-4 text-center border-bottom">
                                <div className="mb-3">
                                    {/* Placeholder за снимка (може да сложим реални по-късно) */}
                                    <div className="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center text-white fs-1 shadow-sm" style={{ width: '100px', height: '100px' }}>
                                        {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1">{player.firstName} {player.lastName}</h2>
                                <h5 className="text-muted mb-3">{player.positionName}</h5>
                                
                                <div className="d-flex justify-content-center gap-2">
                                    <span className="badge bg-dark fs-6 py-2 px-3">Age: {player.age}</span>
                                    <span className={`badge ${player.teamName === 'Free Agent' ? 'bg-secondary' : 'bg-primary'} fs-6 py-2 px-3`}>
                                        {player.teamName}
                                    </span>
                                </div>
                            </div>

                            {/* Долна секция: Детайли */}
                            <div className="p-4">
                                <h6 className="fw-bold text-uppercase text-muted mb-3">Athletic Information</h6>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div className="p-3 bg-light rounded-3 border">
                                            <small className="text-muted d-block">Date of Birth</small>
                                            <span className="fw-bold">{player.dateOfBirthFormatted}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="p-3 bg-light rounded-3 border">
                                            <small className="text-muted d-block">Position Category</small>
                                            <span className="fw-bold">{player.positionCategory}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block">Current Club Affiliation</small>
                                                <span className="fw-bold fs-5">{player.teamName}</span>
                                            </div>
                                            {player.leagueName && (
                                                <span className="badge bg-info text-dark">🏆 {player.leagueName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder за Скаутски доклади */}
                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold text-uppercase text-muted mb-0">Scouting Reports</h6>
                                        <button className="btn btn-sm btn-outline-success">➕ Add Report</button>
                                    </div>
                                    <div className="text-center p-4 bg-light rounded-3 border border-dashed">
                                        <span className="text-muted">No scouting reports available yet.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}