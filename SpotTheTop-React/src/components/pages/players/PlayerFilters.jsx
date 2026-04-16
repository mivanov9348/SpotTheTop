import React, { useState } from 'react';

export default function PlayerFilters({ 
    searchTerm, setSearchTerm, 
    selectedLeague, setSelectedLeague, 
    selectedTeam, setSelectedTeam, 
    selectedPosition, setSelectedPosition, 
    minAge, setMinAge, maxAge, setMaxAge,
    minHeight, setMinHeight, preferredFoot, setPreferredFoot,
    nationality, setNationality, minMarketValue, setMinMarketValue,
    minGoals, setMinGoals, minAssists, setMinAssists, 
    minMatches, setMinMatches, maxCards, setMaxCards,
    minPassAccuracy, setMinPassAccuracy, minTackles, setMinTackles,
    minCleanSheets, setMinCleanSheets, minSaves, setMinSaves,
    leagues, teams, positions 
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const clearAllFilters = () => {
        setSearchTerm(''); setSelectedLeague('all'); setSelectedTeam('all'); setSelectedPosition('all');
        setMinAge(''); setMaxAge(''); setMinHeight(''); setPreferredFoot('all'); 
        setNationality(''); setMinMarketValue('');
        setMinGoals(''); setMinAssists(''); setMinMatches(''); setMaxCards('');
        setMinPassAccuracy(''); setMinTackles(''); setMinCleanSheets(''); setMinSaves('');
    };

    return (
        <div className="card border-0 rounded-4 mb-4 shadow-lg" style={{ backgroundColor: '#1e293b' }}>
            <div className="card-body p-4">
                
                {/* --- BASIC FILTERS --- */}
                <div className="row g-3 mb-3">
                    <div className="col-md-3">
                        <label className="form-label small text-light opacity-75 fw-bold mb-1">Search Athlete</label>
                        <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary text-light">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 bg-dark text-white border-secondary placeholder-gray shadow-none" 
                                placeholder="Name..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-light opacity-75 fw-bold mb-1">League</label>
                        <select 
                            className="form-select bg-dark text-white border-secondary shadow-none" 
                            value={selectedLeague} 
                            onChange={(e) => {
                                setSelectedLeague(e.target.value);
                                setSelectedTeam('all');
                            }}
                        >
                            <option value="all">Global (All Leagues)</option>
                            {leagues && leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-light opacity-75 fw-bold mb-1">Club Affiliation</label>
                        <select 
                            className="form-select bg-dark text-white border-secondary shadow-none" 
                            value={selectedTeam} 
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="all">Any Team</option>
                            <option value="free_agents">Free Agents Only</option>
                            {teams && teams
                                .filter(t => selectedLeague === 'all' || t.leagueId === parseInt(selectedLeague, 10))
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-light opacity-75 fw-bold mb-1">Position</label>
                        <select className="form-select bg-dark text-white border-secondary shadow-none" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                            <option value="all">Any Position</option>
                            {positions && positions.map(p => <option key={p.id} value={p.name}>{p.name} ({p.abbreviation})</option>)}
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-2">
                    <button 
                        className="btn btn-sm btn-link text-decoration-none fw-bold text-info p-0 shadow-none" 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <i className={`bi bi-sliders me-1`}></i> 
                        {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
                    </button>
                    
                    <button className="btn btn-sm btn-outline-light rounded-pill px-3 opacity-75" onClick={clearAllFilters}>
                        Clear Filters
                    </button>
                </div>

                {/* --- ADVANCED FILTERS --- */}
                {showAdvanced && (
                    <div className="mt-4 pt-3 border-top border-secondary border-dashed">
                        
                        {/* 1. Demographics & Bio */}
                        <h6 className="text-info fw-bold mb-3 small text-uppercase">1. Demographics & Bio</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Age Range</label>
                                <div className="d-flex gap-2">
                                    <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="Min" value={minAge} onChange={e => setMinAge(e.target.value)} />
                                    <span className="text-light opacity-50 align-self-center">-</span>
                                    <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="Max" value={maxAge} onChange={e => setMaxAge(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Min Height (cm)</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="e.g. 185" value={minHeight} onChange={e => setMinHeight(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Preferred Foot</label>
                                <select className="form-select form-select-sm bg-dark text-white border-secondary shadow-none" value={preferredFoot} onChange={e => setPreferredFoot(e.target.value)}>
                                    <option value="all">Any</option><option value="Right">Right</option><option value="Left">Left</option><option value="Both">Both</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Nationality</label>
                                <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="e.g. Brazil" value={nationality} onChange={e => setNationality(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Min. Market Value (€)</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="e.g. 1000000" value={minMarketValue} onChange={e => setMinMarketValue(e.target.value)} />
                            </div>
                        </div>

                        {/* 2. Attacking & General Performance */}
                        <h6 className="text-success fw-bold mb-3 small text-uppercase">2. General & Attacking Metrics</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Min Matches</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="0" value={minMatches} onChange={e => setMinMatches(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Min Goals</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-success shadow-none" placeholder="0" value={minGoals} onChange={e => setMinGoals(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-light opacity-75 mb-1">Min Assists</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-primary shadow-none" placeholder="0" value={minAssists} onChange={e => setMinAssists(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Min Pass Accuracy (%)</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-info shadow-none" placeholder="0-100" value={minPassAccuracy} onChange={e => setMinPassAccuracy(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Max Total Cards (Y+R)</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-danger shadow-none" placeholder="Limit" value={maxCards} onChange={e => setMaxCards(e.target.value)} />
                            </div>
                        </div>

                        {/* 3. Defensive & Goalkeeping */}
                        <h6 className="text-warning fw-bold mb-3 small text-uppercase">3. Defensive & Goalkeeping</h6>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Min Tackles Won</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="0" value={minTackles} onChange={e => setMinTackles(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Min Clean Sheets</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="0" value={minCleanSheets} onChange={e => setMinCleanSheets(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-light opacity-75 mb-1">Min Saves (GK)</label>
                                <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" placeholder="0" value={minSaves} onChange={e => setMinSaves(e.target.value)} />
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}