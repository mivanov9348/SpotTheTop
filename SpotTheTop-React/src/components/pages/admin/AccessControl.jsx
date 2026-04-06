import React from 'react';

const API_URL = "https://localhost:44306/api";

export default function AccessControl({ allUsers, pendingRoles, pendingPlayers, currentUserRoles, loadData, canManageUsers }) {
    const isSuperAdmin = currentUserRoles.includes('SuperAdmin');
    const isAdmin = currentUserRoles.includes('Admin') || isSuperAdmin; 

    const handleApproveRole = async (email) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Auth/approve-role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email })
            });
            if (res.ok) loadData();
            else alert(await res.text() || "Failed to approve role.");
        } catch (err) { alert("Network error while approving role."); }
    };

    const handlePromote = async (emailToPromote, targetRole) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Auth/promote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: emailToPromote, targetRole })
            });
            if (res.ok) loadData();
            else alert(await res.text() || "Failed to promote user.");
        } catch (err) { alert("Server error."); }
    };

    const handleDemote = async (emailToDemote, targetRole) => {
        if(!window.confirm(`Are you sure you want to remove ${targetRole} from ${emailToDemote}?`)) return;
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Auth/demote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: emailToDemote, targetRole })
            });
            if (res.ok) loadData();
            else alert(await res.text() || "Failed to demote user.");
        } catch (err) { alert("Server error."); }
    };

    const handleApprovePlayer = async (id) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Players/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadData();
            else alert("Failed to approve player.");
        } catch (err) { alert("Network error."); }
    };

    return (
        <div className="row">
            {/* ГЛАВНАТА ТАБЛИЦА ЗА УПРАВЛЕНИЕ НА АКАУНТИ */}
            {canManageUsers && (
                <div className="col-12 mb-4">
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center py-3">
                            <span><i className="bi bi-people-fill me-2"></i> Identity & Access Management</span>
                            <span className="badge bg-light text-dark fs-6">{allUsers?.length || 0} Accounts</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3">User Details</th>
                                            <th className="py-3">Roles & Access</th>
                                            <th className="py-3">Pending Requests</th>
                                            <th className="py-3 text-end px-4">Account Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!allUsers || allUsers.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-4 text-muted">No users found.</td></tr>
                                        ) : (
                                            allUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-bold text-primary">{user.firstName} {user.lastName}</div>
                                                        <div className="text-muted small">{user.email}</div>
                                                    </td>
                                                    <td>
                                                        {user.currentRoles.length === 0 && <span className="badge bg-secondary me-1">User</span>}
                                                        {user.currentRoles.map(r => (
                                                            <span key={r} className={`badge me-1 ${r === 'SuperAdmin' ? 'bg-dark' : r === 'Admin' ? 'bg-danger' : r === 'Moderator' ? 'bg-info text-dark' : 'bg-primary'}`}>
                                                                {r}
                                                                {((isSuperAdmin && r !== 'SuperAdmin') || (isAdmin && r === 'Moderator')) && (
                                                                    <span style={{cursor: 'pointer'}} className="ms-1 text-white opacity-75" onClick={() => handleDemote(user.email, r)}>✖</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        {user.requestedRole ? (
                                                            <div>
                                                                <span className="badge bg-warning text-dark shadow-sm">
                                                                    ⏳ Wants: {user.requestedRole} {user.requestedTeamId && `(Team #${user.requestedTeamId})`}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-success small fw-bold">✓ Verified</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end px-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            {user.requestedRole && (
                                                                <button onClick={() => handleApproveRole(user.email)} className="btn btn-sm btn-success fw-bold shadow-sm">✓ Approve</button>
                                                            )}
                                                            {isAdmin && !user.currentRoles.includes('Moderator') && !user.currentRoles.includes('Admin') && !user.currentRoles.includes('SuperAdmin') && (
                                                                <button onClick={() => handlePromote(user.email, 'Moderator')} className="btn btn-sm btn-outline-info fw-bold text-dark">🛡️ Mod</button>
                                                            )}
                                                            {isSuperAdmin && !user.currentRoles.includes('Admin') && !user.currentRoles.includes('SuperAdmin') && (
                                                                <button onClick={() => handlePromote(user.email, 'Admin')} className="btn btn-sm btn-outline-danger fw-bold">👑 Admin</button>
                                                            )}
                                                            <button className="btn btn-sm btn-outline-secondary fw-bold" onClick={() => alert('Ban function coming soon!')}>🚫 Ban</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ДОЛНА ЧАСТ: Одобрения */}
            <div className="col-lg-6 mb-4">
                <div className="card shadow border-0 rounded-4 h-100">
                    <div className="card-header bg-info text-white fw-bold py-3 d-flex justify-content-between align-items-center">
                        <span>🛡️ Pending Account Roles</span>
                        <span className="badge bg-light text-dark">{pendingRoles.length}</span>
                    </div>
                    <ul className="list-group list-group-flush">
                        {pendingRoles.length === 0 && <li className="list-group-item text-muted p-4 text-center border-0">No pending role requests.</li>}
                        {pendingRoles.map((pr, idx) => (
                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-3">
                                <div>
                                    <div className="fw-bold">{pr.email}</div>
                                    <span className="badge bg-primary text-uppercase">Wants to be: {pr.requestedRole}</span>
                                </div>
                                <button onClick={() => handleApproveRole(pr.email)} className="btn btn-sm btn-info fw-bold text-white shadow-sm">Approve</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="col-lg-6 mb-4">
                <div className="card shadow border-0 rounded-4 h-100">
                    <div className="card-header bg-warning fw-bold text-dark py-3 d-flex justify-content-between align-items-center">
                        <span>⚽ Pending Player Profiles</span>
                        <span className="badge bg-dark text-white">{pendingPlayers.length}</span>
                    </div>
                    <ul className="list-group list-group-flush">
                        {pendingPlayers.length === 0 && <li className="list-group-item text-muted p-4 text-center border-0">No unverified athletes on the market.</li>}
                        {pendingPlayers.map(p => (
                            <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                                <div>
                                    <div className="fw-bold text-dark fs-5">{p.fullName}</div>
                                    <div className="small text-muted">Position: {p.position} | Added by: <span className="text-primary">{p.addedBy}</span></div>
                                </div>
                                <button onClick={() => handleApprovePlayer(p.id)} className="btn btn-success fw-bold shadow-sm px-4">✓ Verify</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}