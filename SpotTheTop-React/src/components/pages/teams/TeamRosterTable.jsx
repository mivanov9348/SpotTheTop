import React from 'react';

export default function TeamRosterTable({ players, onViewProfile }) {
    // Функция за групиране на играчите по позиция
    const groupPlayersByCategory = () => {
        const groups = {
            "Goalkeepers": [],
            "Defenders": [],
            "Midfielders": [],
            "Forwards": []
        };
        
        players.forEach(p => {
            // Ако бекендът връща Category, ползваме го, иначе ги слагаме в "Others"
            const category = p.positionCategory || (
                p.position.includes('GK') ? 'Goalkeepers' :
                p.position.includes('CB') || p.position.includes('LB') || p.position.includes('RB') ? 'Defenders' :
                p.position.includes('CM') || p.position.includes('LM') || p.position.includes('RM') || p.position.includes('DM') || p.position.includes('AM') ? 'Midfielders' :
                'Forwards'
            );
            
            if (groups[category]) groups[category].push(p);
            else {
                if (!groups["Others"]) groups["Others"] = [];
                groups["Others"].push(p);
            }
        });
        return groups;
    };

    const groupedPlayers = groupPlayersByCategory();
    const categories = Object.keys(groupedPlayers).filter(cat => groupedPlayers[cat].length > 0);

    return (
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden h-100" style={{ backgroundColor: '#1e293b' }}>
            <div className="card-header bg-transparent border-bottom border-secondary py-3 d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold text-white"><i className="bi bi-people-fill me-2 text-success"></i>Active Roster</span>
                <span className="badge bg-dark border border-success text-success fs-6 rounded-pill px-3 shadow-sm">
                    {players.length} Players
                </span>
            </div>
            
            <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0 bg-transparent text-center">
                    <thead className="small fw-bold text-light opacity-75 border-secondary">
                        <tr>
                            <th className="px-4 py-3 text-start bg-transparent" style={{ width: '40%' }}>Player</th>
                            <th className="py-3 bg-transparent">Position</th>
                            <th className="py-3 bg-transparent">Age</th>
                            <th className="py-3 bg-transparent">Matches</th>
                            <th className="py-3 text-end px-4 bg-transparent">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-light opacity-50 bg-transparent">
                                    No players registered for this team yet.
                                </td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                <React.Fragment key={category}>
                                    {/* Разделител за всяка група */}
                                    <tr className="bg-dark">
                                        <td colSpan="5" className="text-start px-4 py-2 text-info fw-bold small text-uppercase bg-dark border-secondary">
                                            {category}
                                        </td>
                                    </tr>
                                    {/* Играчите в тази група */}
                                    {groupedPlayers[category].map(p => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 text-start bg-transparent border-secondary">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <span className="fw-bold text-white">{p.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="bg-transparent border-secondary">
                                                <span className="badge bg-dark border border-secondary text-light">{p.position}</span>
                                            </td>
                                            <td className="bg-transparent border-secondary text-white fw-bold">{p.age}</td>
                                            <td className="bg-transparent border-secondary text-light opacity-75">{p.matchesPlayed || 0}</td>
                                            <td className="text-end px-4 bg-transparent border-secondary">
                                                <button onClick={() => onViewProfile(p.id)} className="btn btn-sm btn-outline-info fw-bold rounded-pill px-3 shadow-none hover-text-dark">
                                                    Profile <i className="bi bi-arrow-right ms-1"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .hover-text-dark:hover { color: #0f172a !important; }
            `}} />
        </div>
    );
}