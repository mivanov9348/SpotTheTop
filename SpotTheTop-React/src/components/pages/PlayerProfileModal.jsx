import React, { useState } from 'react';

export default function PlayerProfileModal({ player, onClose }) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    if (!player) return null;

    // Помощна функция за изобразяване на N/A, ако стойността е null
    const renderStat = (value, suffix = '') => {
        if (value === null || value === undefined) return <span className="text-muted fst-italic">N/A</span>;
        return <span className="fw-bold">{value}{suffix}</span>;
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}></div>
            
            <div className="modal fade show d-block" tabIndex="-1" onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                        
                        {/* ХЕДЪР */}
                        <div className="modal-header border-0 text-white p-4" style={{ background: 'linear-gradient(45deg, #1e293b, #3b82f6)' }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white fs-2 shadow border border-2 border-primary me-4" style={{ width: '80px', height: '80px' }}>
                                    {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="modal-title fw-bold mb-0">{player.firstName} {player.lastName}</h2>
                                    <div className="text-light opacity-75 fs-5">
                                        {player.positionName} {player.positionCategory ? `(${player.positionCategory})` : ''}
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="btn-close btn-close-white align-self-start" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-4 text-light">
                            
                            {/* СЕКЦИЯ 1: ИНФОРМАЦИЯ ЗА ИГРАЧА */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="small text-info fw-bold text-uppercase mb-1">Club Affiliation</div>
                                        <div className="fs-5 fw-bold text-white">{player.teamName}</div>
                                        {player.leagueName && <div className="small opacity-75">🏆 {player.leagueName}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="p-2 rounded-3 border border-secondary text-center">
                                                <div className="small opacity-50">Age</div>
                                                <div className="fw-bold fs-5">{player.age}</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2 rounded-3 border border-secondary text-center">
                                                <div className="small opacity-50">Foot</div>
                                                <div className="fw-bold fs-5">{renderStat(player.preferredFoot)}</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2 rounded-3 border border-secondary text-center">
                                                <div className="small opacity-50">Height</div>
                                                <div className="fw-bold fs-5">{renderStat(player.heightCm, ' cm')}</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2 rounded-3 border border-secondary text-center">
                                                <div className="small opacity-50">Value</div>
                                                <div className="fw-bold fs-5">{player.marketValueEuro ? `€${(player.marketValueEuro / 1000000).toFixed(1)}M` : renderStat(null)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* СЕКЦИЯ 2: ОСНОВНИ СТАТИСТИКИ (All Time) */}
                            <h6 className="fw-bold text-uppercase text-info mb-3 border-bottom border-secondary pb-2">Core Statistics (All Time)</h6>
                            <div className="row g-2 mb-4 text-center">
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold">{player.totalMatchesPlayed}</div>
                                        <div className="small opacity-50">Matches</div>
                                    </div>
                                </div>
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold">{player.totalMinutesPlayed}'</div>
                                        <div className="small opacity-50">Minutes</div>
                                    </div>
                                </div>
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold text-success">{player.totalGoals}</div>
                                        <div className="small opacity-50">Goals</div>
                                    </div>
                                </div>
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold text-info">{player.totalAssists}</div>
                                        <div className="small opacity-50">Assists</div>
                                    </div>
                                </div>
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold text-warning">{player.totalYellowCards}</div>
                                        <div className="small opacity-50">Yellows</div>
                                    </div>
                                </div>
                                <div className="col-4 col-md-2">
                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
                                        <div className="fs-3 fw-bold text-danger">{player.totalRedCards}</div>
                                        <div className="small opacity-50">Reds</div>
                                    </div>
                                </div>
                            </div>

                            {/* БУТОН ЗА РАЗШИРЕНИ СТАТИСТИКИ */}
                            <div className="text-center mb-3">
                                <button 
                                    className="btn btn-sm btn-outline-info rounded-pill px-4 fw-bold"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <i className={`bi bi-graph-up me-2`}></i>
                                    {showAdvanced ? "Hide Advanced Metrics" : "Show Advanced Metrics"}
                                </button>
                            </div>

                            {/* СЕКЦИЯ 3: РАЗШИРЕНИ СТАТИСТИКИ */}
                            {showAdvanced && (
                                <div className="p-4 rounded-4 border border-secondary bg-dark">
                                    <div className="row g-4">
                                        
                                        {/* Офанзивни */}
                                        <div className="col-md-4 border-end border-secondary">
                                            <h6 className="text-warning fw-bold mb-3"><i className="bi bi-crosshair me-2"></i>Attacking</h6>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Shots</span>
                                                {renderStat(player.totalShots)}
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">On Target</span>
                                                {renderStat(player.totalShotsOnTarget)}
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Chances Created</span>
                                                {renderStat(player.totalChancesCreated)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="opacity-75">Dribbles</span>
                                                {renderStat(player.totalDribblesCompleted)}
                                            </div>
                                        </div>

                                        {/* Пасове */}
                                        <div className="col-md-4 border-end border-secondary">
                                            <h6 className="text-info fw-bold mb-3"><i className="bi bi-diagram-3 me-2"></i>Distribution</h6>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Passes Comp.</span>
                                                {renderStat(player.totalPassesCompleted)}
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Pass Accuracy</span>
                                                {renderStat(player.averagePassAccuracy, '%')}
                                            </div>
                                        </div>

                                        {/* Дефанзивни / Вратарски */}
                                        <div className="col-md-4">
                                            <h6 className="text-success fw-bold mb-3"><i className="bi bi-shield-check me-2"></i>Defensive</h6>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Tackles Won</span>
                                                {renderStat(player.totalTacklesWon)}
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Interceptions</span>
                                                {renderStat(player.totalInterceptions)}
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="opacity-75">Clearances</span>
                                                {renderStat(player.totalClearances)}
                                            </div>
                                            
                                            {(player.positionCategory === "Goalkeeper" || player.positionCategory === "Defender") && (
                                                <div className="mt-3 pt-3 border-top border-secondary">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="opacity-75">Clean Sheets</span>
                                                        {renderStat(player.totalCleanSheets)}
                                                    </div>
                                                    {player.positionCategory === "Goalkeeper" && (
                                                        <div className="d-flex justify-content-between">
                                                            <span className="opacity-75">Saves</span>
                                                            {renderStat(player.totalSaves)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}