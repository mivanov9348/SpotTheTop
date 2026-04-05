import React from 'react';

export default function AdminPanel({
    allUsers, pendingPlayers, handleApproveRole, handleApprovePlayer, handlePromote
}) {
    const promoteUserClick = (email) => {
        if (window.confirm(`Are you sure you want to promote ${email} to Admin?`)) {
            handlePromote(email);
        }
    }

    return (
        <div className="row">
            {/* ГОРНА ЧАСТ: Управление на Потребители (Таблицата) */}
            <div className="col-12 mb-4">
                <div className="card shadow border-0 rounded-4">
                    <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center py-3">
                        <span><i className="bi bi-people-fill me-2"></i> User Management</span>
                        <span className="badge bg-light text-dark fs-6">{allUsers.length} Registered</span>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">User Details</th>
                                        <th className="py-3">Current Role(s)</th>
                                        <th className="py-3">Status / Requests</th>
                                        <th className="py-3 text-end px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-4 text-muted">Loading network data...</td></tr>
                                    )}
                                    {allUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold text-primary">{user.firstName} {user.lastName}</div>
                                                <div className="text-muted small">{user.email}</div>
                                            </td>
                                            <td>
                                                {user.currentRoles.length === 0 && <span className="badge bg-secondary me-1">User</span>}
                                                {user.currentRoles.map(r => (
                                                    <span key={r} className={`badge me-1 ${r === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                        {r}
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                {user.requestedRole ? (
                                                    <span className="badge bg-warning text-dark border border-warning shadow-sm">
                                                        ⏳ Wants: {user.requestedRole}
                                                        {user.requestedTeamId && ` (Team #${user.requestedTeamId})`}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success bg-opacity-25 text-success border border-success">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                                {/* Място за KYC документи в бъдеще */}
                                                {user.requestedRole && (
                                                    <div className="mt-1">
                                                        <small className="text-primary" style={{cursor: 'pointer', textDecoration: 'underline'}}>
                                                            📄 View Documents
                                                        </small>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-end px-4">
                                                <div className="btn-group btn-group-sm shadow-sm">
                                                    {user.requestedRole && (
                                                        <button
                                                            onClick={() => handleApproveRole(user.email)}
                                                            className="btn btn-success fw-bold"
                                                            title="Approve Requested Role"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                    )}

                                                    {!user.currentRoles.includes('Admin') && (
                                                        <button
                                                            onClick={() => promoteUserClick(user.email)}
                                                            className="btn btn-outline-danger fw-bold"
                                                            title="Make System Admin"
                                                        >
                                                            👑 Promote
                                                        </button>
                                                    )}

                                                    <button className="btn btn-outline-secondary" title="Suspend User (Coming Soon)">
                                                        🚫 Ban
                                                    </button>
                                                    <button className="btn btn-outline-dark" title="Delete User (Coming Soon)">
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            
            
            {/* В бъдеще: Pending Teams карта тук */}
        </div>
    );
}