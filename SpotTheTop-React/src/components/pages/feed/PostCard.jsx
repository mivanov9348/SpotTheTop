import React, { useState } from 'react';

const API_URL = "https://localhost:44306/api";

export default function PostCard({ post, onActionTriggered, onQuote, currentUserEmail, currentUserRoles }) {
    const [commentText, setCommentText] = useState('');

    const canDelete = (authorEmail) => {
        const isAdmin = currentUserRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));
        const isAuthor = currentUserEmail && currentUserEmail.toLowerCase() === authorEmail.toLowerCase();
        return isAdmin || isAuthor || post.canDelete; 
    };

    const handleLike = async () => {
        const token = localStorage.getItem('jwtToken');
        await fetch(`${API_URL}/Feed/${post.id}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        onActionTriggered();
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Feed/${post.id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content: commentText })
        });
        if (res.ok) {
            setCommentText('');
            onActionTriggered();
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Feed/${post.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) onActionTriggered();
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Feed/comment/${commentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) onActionTriggered();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRoleBadge = (role) => {
        if (role === 'Player') return 'bg-warning text-dark';
        if (role === 'Scout') return 'bg-info text-dark';
        if (role === 'Team') return 'bg-success text-white';
        if (role === 'Admin' || role === 'SuperAdmin') return 'bg-danger text-white shadow-sm';
        return 'bg-secondary text-white';
    };

    return (
        <div className="card border-0 rounded-4 shadow-lg post-card mb-4" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="card-body p-4">
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold shadow-sm" style={{ width: '45px', height: '45px', background: 'linear-gradient(45deg, #3b82f6, #06b6d4)' }}>
                            {post.authorUserId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="fw-bold text-white d-flex align-items-center gap-2">
                                {post.authorUserId.split('@')[0]}
                                <span className={`badge ${getRoleBadge(post.authorRole)}`} style={{ fontSize: '0.65rem' }}>{post.authorRole}</span>
                            </div>
                            <div className="small" style={{ color: '#64748b' }}>{formatDate(post.createdAt)}</div>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-info border-0" onClick={() => onQuote(post.content)} title="Quote">
                            <i className="bi bi-chat-quote"></i>
                        </button>
                        {canDelete(post.authorUserId) && (
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={handleDeletePost} title="Delete Post">
                                <i className="bi bi-trash"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div 
                    className="mb-4 fs-5 rich-text-content" 
                    style={{ color: '#e2e8f0', lineHeight: '1.6' }} 
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                <div className="d-flex gap-4 border-top border-secondary pt-3 mb-3">
                    <button 
                        className={`btn btn-sm fw-bold like-btn ${post.hasLiked ? 'text-danger' : 'text-light opacity-75'}`}
                        onClick={handleLike}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <i className={`bi ${post.hasLiked ? 'bi-heart-fill pulse-anim' : 'bi-heart'} me-2 fs-5 align-middle`}></i>
                        {post.likesCount} <span className="d-none d-sm-inline">Likes</span>
                    </button>
                    <span className="text-light opacity-75 fw-bold">
                        <i className="bi bi-chat-left-text me-2 fs-5 align-middle"></i>
                        {post.comments.length} <span className="d-none d-sm-inline">Comments</span>
                    </span>
                </div>

                {post.comments.length > 0 && (
                    <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: '#0f172a' }}>
                        {post.comments.map(c => (
                            <div key={c.id} className="mb-3 pb-3 border-bottom border-secondary last-child-no-border">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div>
                                        <span className="fw-bold text-info small me-2">{c.authorUserId.split('@')[0]}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatDate(c.createdAt)}</span>
                                    </div>
                                    {canDelete(c.authorUserId) && (
                                        <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteComment(c.id)}>
                                            <i className="bi bi-x-circle"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="small text-light opacity-75">{c.content}</div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleComment} className="d-flex gap-2 mt-2">
                    <input
                        type="text"
                        className="form-control form-control-sm border-0 rounded-pill px-3 shadow-none text-white placeholder-gray"
                        placeholder="Write a reply..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        style={{ backgroundColor: '#334155' }}
                    />
                    <button type="submit" className="btn btn-sm btn-info text-dark rounded-pill px-4 fw-bold" disabled={!commentText.trim()}>
                        Reply
                    </button>
                </form>

            </div>
        </div>
    );
}