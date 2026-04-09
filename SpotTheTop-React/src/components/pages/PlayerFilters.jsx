import React, { useState } from 'react';

export default function PlayerFilters({ 
    searchTerm, setSearchTerm, 
    selectedLeague, setSelectedLeague, // Вземаме лигата от пропсовете
    selectedTeam, setSelectedTeam, 
    selectedPosition, setSelectedPosition, 
    minAge, setMinAge, maxAge, setMaxAge,
    minHeight, setMinHeight, preferredFoot, setPreferredFoot,
    minGoals, setMinGoals, 
    minAssists, setMinAssists, 
    minMatches, setMinMatches, 
    maxCards, setMaxCards,     
    leagues, // Вземаме масива с лигите
    teams, positions 
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
            <div className="card-body p-4">
                
                {/* === ОСНОВНИ ФИЛТРИ === */}
                <div className="row g-3 mb-3">
                    
                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-bold mb-1">Search Athlete</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 bg-light" 
                                placeholder="Name..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* НОВО: ФИЛТЪР ЗА ЛИГА */}
                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-bold mb-1">League</label>
                        <select 
                            className="form-select bg-light" 
                            value={selectedLeague} 
                            onChange={(e) => {
                                setSelectedLeague(e.target.value);
                                setSelectedTeam('all'); // Изчистваме отбора, когато сменим лигата
                            }}
                        >
                            <option value="all">Global (All Leagues)</option>
                            {leagues && leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-bold mb-1">Club Affiliation</label>
                        <select className="form-select bg-light" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                            <option value="all">Any Team</option>
                            <option value="free_agents">Free Agents Only</option>
                            {/* ПОПРАВЕНО: Показва отборите само от избраната лига */}
                            {teams && teams
                                .filter(t => selectedLeague === 'all' || t.leagueId === parseInt(selectedLeague, 10))
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-bold mb-1">Position</label>
                        <select className="form-select bg-light" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                            <option value="all">Any Position</option>
                            {positions && positions.map(p => <option key={p.id} value={p.name}>{p.name} ({p.abbreviation})</option>)}
                        </select>
                    </div>

                </div>

                {/* === БУТОН ЗА РАЗШИРЕНИ ФИЛТРИ === */}
                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2">
                    <button className="btn btn-sm btn-link text-decoration-none fw-bold text-primary p-0" onClick={() => setShowAdvanced(!showAdvanced)}>
                        <i className={`bi bi-sliders me-1`}></i> {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => {
                        setSearchTerm(''); 
                        setSelectedLeague('all'); // Изчистваме и лигата
                        setSelectedTeam('all'); 
                        setSelectedPosition('all');
                        setMinAge(''); setMaxAge(''); setMinHeight(''); setPreferredFoot('all'); 
                        setMinGoals(''); setMinAssists(''); setMinMatches(''); setMaxCards('');
                    }}>
                        Clear Filters
                    </button>
                </div>

                {/* === РАЗШИРЕНИ ФИЛТРИ === */}
                {showAdvanced && (
                    <div className="row g-3 pt-3 mt-3 border-top border-dashed border-light">
                        <div className="col-md-3">
                            <label className="form-label small text-muted fw-bold mb-1">Age Range</label>
                            <div className="d-flex gap-2">
                                <input type="number" className="form-control form-control-sm bg-light" placeholder="Min" value={minAge} onChange={e => setMinAge(e.target.value)} />
                                <span className="text-muted align-self-center">-</span>
                                <input type="number" className="form-control form-control-sm bg-light" placeholder="Max" value={maxAge} onChange={e => setMaxAge(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small text-muted fw-bold mb-1">Min Height (cm)</label>
                            <input type="number" className="form-control form-control-sm bg-light" placeholder="e.g. 185" value={minHeight} onChange={e => setMinHeight(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small text-muted fw-bold mb-1">Preferred Foot</label>
                            <select className="form-select form-select-sm bg-light" value={preferredFoot} onChange={e => setPreferredFoot(e.target.value)}>
                                <option value="all">Any</option><option value="Right">Right</option><option value="Left">Left</option><option value="Both">Both</option>
                            </select>
                        </div>
                        
                        <div className="col-md-5">
                            <label className="form-label small text-primary fw-bold mb-1">Performance (Min. Required)</label>
                            <div className="d-flex gap-2">
                                <input type="number" className="form-control form-control-sm border-primary" placeholder="Matches" title="Matches Played" value={minMatches} onChange={e => setMinMatches(e.target.value)} />
                                <input type="number" className="form-control form-control-sm border-success" placeholder="Goals" title="Goals" value={minGoals} onChange={e => setMinGoals(e.target.value)} />
                                <input type="number" className="form-control form-control-sm border-info" placeholder="Assists" title="Assists" value={minAssists} onChange={e => setMinAssists(e.target.value)} />
                                <input type="number" className="form-control form-control-sm border-danger" placeholder="Max Cards" title="Max Yellow/Red Cards allowed" value={maxCards} onChange={e => setMaxCards(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}