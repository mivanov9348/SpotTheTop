import React, { useState, useRef } from 'react';

const API_URL = "https://localhost:44306/api";

export default function PostCard({ post, onActionTriggered, onQuote, currentUserEmail, currentUserRoles }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false); 
    const commentInputRef = useRef(null); // Референция към полето за коментар

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
            setShowComments(true); 
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

    // НОВО: Функция за бързо добавяне на таг при клик на Reply
    const handleQuickReply = (usernameToTag) => {
        const tag = `@${usernameToTag.split('@')[0]} `;
        // Ако тагът вече го няма, го добавяме
        if (!commentText.includes(tag)) {
            setCommentText(prev => prev ? `${prev} ${tag}` : tag);
        }
        setShowComments(true);
        // Фокусираме полето
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRoleBadge = (role) => {
        if (role === 'Player') return 'bg-warning text-dark';
        if (role === 'Scout') return 'bg-info text-dark';
        if (role === 'Team') return 'bg-success text-white';
        if (role === 'Admin' || role === 'SuperAdmin') return 'bg-danger text-white shadow-sm';
        return 'bg-secondary text-white';
    };

    // Оцветяване на таговете
    const renderContentWithTags = (htmlContent) => {
        // Заменяме @username със стилизиран span
        const parsedHtml = htmlContent.replace(/@([A-Za-z0-9_]+)/g, '<span class="tag-badge">@$1</span>');
        return { __html: parsedHtml };
    };

    const authorName = post.authorUserId.split('@')[0];

    return (
        <div className="card border-0 rounded-4 shadow-sm post-card" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="card-body p-4 pb-3">
                
                {/* ХЕДЪР НА ПОСТА */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center cursor-pointer">
                        <div className="rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold shadow-sm" style={{ width: '48px', height: '48px', background: 'linear-gradient(45deg, #0284c7, #3b82f6)', fontSize: '1.2rem' }}>
                            {post.authorUserId.charAt(0).toUpperCase()}
                        </div>
                        <div className="lh-sm">
                            <div className="fw-bold text-white fs-6 d-flex align-items-center gap-2 mb-1">
                                {authorName}
                                <span className={`badge ${getRoleBadge(post.authorRole)}`} style={{ fontSize: '0.65rem' }}>{post.authorRole}</span>
                            </div>
                            <div className="small text-muted fw-semibold">@{authorName} • {formatDate(post.createdAt)}</div>
                        </div>
                    </div>

                    <div className="dropdown">
                        <button className="btn btn-sm btn-link text-muted shadow-none p-0 px-2" type="button" data-bs-toggle="dropdown">
                            <i className="bi bi-three-dots fs-5"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow border-secondary bg-dark">
                            <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => onQuote(post.content)}><i className="bi bi-chat-quote text-info"></i> Quote Post</button></li>
                            {canDelete(post.authorUserId) && (
                                <>
                                    <li><hr className="dropdown-divider border-secondary" /></li>
                                    <li><button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleDeletePost}><i className="bi bi-trash"></i> Delete Post</button></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* СЪДЪРЖАНИЕ */}
                <div 
                    className="mb-4 fs-5 rich-text-content px-1" 
                    style={{ color: '#e2e8f0', lineHeight: '1.5' }} 
                    dangerouslySetInnerHTML={renderContentWithTags(post.content)} 
                />

                {/* ЛАЙКОВЕ И КОМЕНТАРИ БУТОНИ */}
                <div className="d-flex gap-4 border-top border-secondary pt-3">
                    <button 
                        className={`btn btn-sm fw-bold like-btn shadow-none ${post.hasLiked ? 'text-danger' : 'text-light opacity-75'}`}
                        onClick={handleLike}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <i className={`bi ${post.hasLiked ? 'bi-heart-fill pulse-anim' : 'bi-heart'} me-2 fs-5 align-middle`}></i>
                        {post.likesCount} <span className="d-none d-sm-inline">Likes</span>
                    </button>
                    
                    <button 
                        className="btn btn-sm fw-bold shadow-none text-light opacity-75 like-btn"
                        onClick={() => setShowComments(!showComments)}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <i className="bi bi-chat-left-text me-2 fs-5 align-middle"></i>
                        {post.comments.length} <span className="d-none d-sm-inline">Comments</span>
                    </button>
                </div>
            </div>

            {/* СЕКЦИЯ КОМЕНТАРИ (Показва се ако showComments е true ИЛИ имаме въведен текст) */}
            <div className={`bg-dark border-top border-secondary p-3 p-md-4 custom-scrollbar ${(showComments || commentText.length > 0) ? 'd-block' : 'd-none'}`} style={{ borderRadius: '0 0 1rem 1rem' }}>
                
                {post.comments.length > 0 ? (
                    <div className="mb-4 d-flex flex-column gap-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {post.comments.map(c => {
                            const commentAuthor = c.authorUserId.split('@')[0];
                            return (
                                <div key={c.id} className="d-flex gap-3 pe-2">
                                    <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold shadow-sm flex-shrink-0" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                        {c.authorUserId.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow-1 bg-secondary bg-opacity-10 p-3 rounded-4 position-relative">
                                        
                                        {/* Име, Време, Reply и Delete бутони */}
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <div>
                                                <span className="fw-bold text-info me-2">{commentAuthor}</span>
                                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(c.createdAt)}</span>
                                                
                                                {/* БУТОН ЗА БЪРЗО ТАГВАНЕ (REPLY) */}
                                                <span className="ms-3 text-muted fw-bold reply-btn" onClick={() => handleQuickReply(commentAuthor)}>
                                                    Reply
                                                </span>
                                            </div>
                                            
                                            {canDelete(c.authorUserId) && (
                                                <button className="btn btn-sm btn-link text-danger p-0 shadow-none hover-scale" onClick={() => handleDeleteComment(c.id)}>
                                                    <i className="bi bi-x fs-5"></i>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="text-light opacity-75 small" dangerouslySetInnerHTML={renderContentWithTags(c.content)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-muted small mb-3">No comments yet. Be the first to reply!</div>
                )}

                {/* ФОРМА ЗА КОМЕНТАР */}
                <form onSubmit={handleComment} className="d-flex gap-2 align-items-center position-relative mt-2">
                    <div className="rounded-circle d-none d-sm-flex justify-content-center align-items-center text-white fw-bold shadow-sm flex-shrink-0" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', fontSize: '0.8rem' }}>
                        {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="position-relative flex-grow-1">
                        <input
                            ref={commentInputRef}
                            type="text"
                            className="form-control border-0 rounded-pill ps-4 pe-5 shadow-none text-white placeholder-gray"
                            placeholder="Write a reply... (use @username to tag)"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            style={{ backgroundColor: '#0f172a', height: '42px' }}
                        />
                        <button type="submit" className="btn btn-info text-dark rounded-circle position-absolute end-0 top-50 translate-middle-y me-1 shadow-none d-flex justify-content-center align-items-center hover-scale" style={{ width: '34px', height: '34px' }} disabled={!commentText.trim()}>
                            <i className="bi bi-send-fill" style={{ fontSize: '0.85rem' }}></i>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}