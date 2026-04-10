import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

const API_URL = "https://localhost:44306/api";

// ==========================================
// КОМПОНЕНТ 1: Формата за създаване на пост
// ==========================================
const PostEditor = ({ onPostCreated, quoteContent, clearQuote }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const quillRef = useRef(null);

    useEffect(() => {
        if (quoteContent) {
            setContent(`<blockquote>${quoteContent}</blockquote><p><br></p>`);
            setTimeout(() => {
                if (quillRef.current) quillRef.current.focus();
            }, 100);
        }
    }, [quoteContent]);

    const editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean'] 
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content || content === '<p><br></p>') return; 
        
        setIsSubmitting(true);
        const token = localStorage.getItem('jwtToken');
        
        const res = await fetch(`${API_URL}/Feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        
        if (res.ok) {
            setContent('');
            clearQuote(); 
            onPostCreated(); 
        }
        setIsSubmitting(false);
    };

    return (
        <div className="card border-0 rounded-4 mb-4 shadow-lg editor-card">
            <div className="card-body p-0">
                <form onSubmit={handleSubmit}>
                    <ReactQuill 
                        ref={quillRef}
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        modules={editorModules}
                        placeholder="What's happening in the football world?"
                    />
                    <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary" style={{ backgroundColor: '#1e293b' }}>
                        <div>
                            {quoteContent && (
                                <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => { clearQuote(); setContent(''); }}>
                                    Cancel Quote ✖
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary fw-bold rounded-pill px-5 shadow" disabled={!content || content === '<p><br></p>' || isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post Update'} <i className="bi bi-send-fill ms-1"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// КОМПОНЕНТ 2: Единичен Пост
// ==========================================
const PostCard = ({ post, onActionTriggered, onQuote, currentUserEmail, currentUserRoles }) => {
    const [commentText, setCommentText] = useState('');

    // ПРОВЕРКА ЗА ПРАВА ЗА ТРИЕНЕ
    const canDelete = (authorEmail) => {
        const isAdmin = currentUserRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));
        const isAuthor = currentUserEmail && currentUserEmail.toLowerCase() === authorEmail.toLowerCase();
        return isAdmin || isAuthor;
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
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
                
                {/* Header на поста */}
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
                    
                    {/* Контроли за триене и цитиране */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-info border-0" onClick={() => onQuote(post.content)} title="Quote">
                            <i className="bi bi-chat-quote"></i>
                        </button>
                        
                        {/* Тук извикваме функцията, за да видим дали да покажем кошчето */}
                        {canDelete(post.authorUserId) && (
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={handleDeletePost} title="Delete Post">
                                <i className="bi bi-trash"></i> {/* Сменено от trash3 на trash за по-добра съвместимост */}
                            </button>
                        )}
                    </div>
                </div>

                {/* Съдържание */}
                <div 
                    className="mb-4 fs-5 rich-text-content" 
                    style={{ color: '#e2e8f0', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                {/* Бутони (Лайк / Коментар) */}
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

                {/* Коментари */}
                {post.comments.length > 0 && (
                    <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: '#0f172a' }}>
                        {post.comments.map(c => (
                            <div key={c.id} className="mb-3 pb-3 border-bottom border-secondary last-child-no-border">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div>
                                        <span className="fw-bold text-info small me-2">{c.authorUserId.split('@')[0]}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatDate(c.createdAt)}</span>
                                    </div>
                                    {/* Триене на коментар */}
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

                {/* Форма за коментар */}
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
};

// ==========================================
// ГЛАВЕН КОМПОНЕНТ: FeedPage
// ==========================================
export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quoteContent, setQuoteContent] = useState(null); 

    // БЕЗОПАСНО ЗАРЕЖДАНЕ НА ДАННИТЕ ЗА ТЕКУЩИЯ ПОТРЕБИТЕЛ
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [currentUserRoles, setCurrentUserRoles] = useState([]);

    useEffect(() => {
        try {
            // 1. Четем ролите
            const rolesStr = localStorage.getItem('userRoles');
            if (rolesStr) {
                const parsedRoles = JSON.parse(rolesStr);
                // Подсигуряваме се, че винаги е масив (дори ако backend-ът е върнал само 1 string)
                setCurrentUserRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
            }

            // 2. Четем токена и го разкодираме безопасно (без да гърми с кирилица или спец. символи)
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                
                // Търсим имейла във всички възможни Claim ключове на .NET
                const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] 
                           || payload.name 
                           || payload.unique_name 
                           || payload.email 
                           || "";
                setCurrentUserEmail(email);
            }
        } catch (e) {
            console.error("Error parsing user token data", e);
        }
    }, []);

    const fetchPosts = async () => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Feed`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setPosts(await res.json());
        } catch (err) {
            console.error("Error loading feed", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="feed-override-bg">
            <div className="container px-3 px-md-0 feed-content">
                
                <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                    <div>
                        <h2 className="fw-bold text-white mb-1">📰 The Locker Room</h2>
                        <p className="text-info mb-0 opacity-75">Scouting reports, transfer news, and community updates.</p>
                    </div>
                </div>

                <PostEditor 
                    onPostCreated={fetchPosts} 
                    quoteContent={quoteContent} 
                    clearQuote={() => setQuoteContent(null)} 
                />

                {isLoading ? (
                    <div className="text-center p-5 text-light opacity-50">
                        <div className="spinner-border mb-2" role="status"></div>
                        <div>Loading updates...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center p-5 rounded-4 shadow-sm" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                        <i className="bi bi-chat-square-text fs-1 d-block mb-3 opacity-50"></i>
                        No updates yet. Break the silence!
                    </div>
                ) : (
                    <div>
                        {posts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                onActionTriggered={fetchPosts} 
                                onQuote={(htmlContent) => setQuoteContent(htmlContent)}
                                currentUserEmail={currentUserEmail}
                                currentUserRoles={currentUserRoles}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .feed-override-bg {
                    position: absolute; top: 76px; left: 0; width: 100vw; min-height: calc(100vh - 76px);
                    background-color: #0f172a; padding-top: 2rem; padding-bottom: 5rem; z-index: 10;
                }
                .feed-content { max-width: 800px; margin: 0 auto; }

                .editor-card { background-color: #1e293b; overflow: hidden; }
                .ql-toolbar.ql-snow { background-color: #334155; border: none; border-bottom: 1px solid #475569; padding: 12px; }
                .ql-container.ql-snow { border: none; background-color: #1e293b; color: #f8fafc; font-size: 1.1rem; min-height: 120px; }
                .ql-editor.ql-blank::before { color: #64748b; font-style: normal; }
                .ql-snow .ql-stroke { stroke: #cbd5e1; }
                .ql-snow .ql-fill { fill: #cbd5e1; }
                .ql-snow .ql-picker { color: #cbd5e1; }
                .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke { stroke: #38bdf8; }
                
                .rich-text-content a { color: #38bdf8; text-decoration: none; }
                .rich-text-content a:hover { text-decoration: underline; }
                .rich-text-content ul, .rich-text-content ol { margin-bottom: 0; padding-left: 1.5rem; }
                .rich-text-content p { margin-bottom: 0; }
                
                .rich-text-content blockquote, .ql-editor blockquote {
                    border-left: 4px solid #38bdf8;
                    padding-left: 1rem;
                    margin-left: 0;
                    color: #94a3b8;
                    font-style: italic;
                    background-color: rgba(56, 189, 248, 0.05);
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-radius: 0 8px 8px 0;
                }

                .last-child-no-border:last-child { border-bottom: none !important; margin-bottom: 0 !important; padding-bottom: 0 !important; }
                .placeholder-gray::placeholder { color: #64748b !important; }
                .form-control:focus { background-color: #1e293b; color: white; }
                .post-card { transition: transform 0.2s ease; }
                .post-card:hover { transform: translateY(-2px); }
                .like-btn { transition: transform 0.1s ease; }
                .like-btn:active { transform: scale(0.9); }
                
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
                .pulse-anim { animation: pulse 0.3s ease-in-out; }
            `}} />
        </div>
    );
}import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

const API_URL = "https://localhost:44306/api";

// ==========================================
// КОМПОНЕНТ 1: Формата за създаване на пост
// ==========================================
const PostEditor = ({ onPostCreated, quoteContent, clearQuote }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const quillRef = useRef(null);

    useEffect(() => {
        if (quoteContent) {
            setContent(`<blockquote>${quoteContent}</blockquote><p><br></p>`);
            setTimeout(() => {
                if (quillRef.current) quillRef.current.focus();
            }, 100);
        }
    }, [quoteContent]);

    const editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean'] 
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content || content === '<p><br></p>') return; 
        
        setIsSubmitting(true);
        const token = localStorage.getItem('jwtToken');
        
        const res = await fetch(`${API_URL}/Feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        
        if (res.ok) {
            setContent('');
            clearQuote(); 
            onPostCreated(); 
        }
        setIsSubmitting(false);
    };

    return (
        <div className="card border-0 rounded-4 mb-4 shadow-lg editor-card">
            <div className="card-body p-0">
                <form onSubmit={handleSubmit}>
                    <ReactQuill 
                        ref={quillRef}
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        modules={editorModules}
                        placeholder="What's happening in the football world?"
                    />
                    <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary" style={{ backgroundColor: '#1e293b' }}>
                        <div>
                            {quoteContent && (
                                <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => { clearQuote(); setContent(''); }}>
                                    Cancel Quote ✖
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary fw-bold rounded-pill px-5 shadow" disabled={!content || content === '<p><br></p>' || isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post Update'} <i className="bi bi-send-fill ms-1"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// КОМПОНЕНТ 2: Единичен Пост
// ==========================================
const PostCard = ({ post, onActionTriggered, onQuote, currentUserEmail, currentUserRoles }) => {
    const [commentText, setCommentText] = useState('');

    // ПРОВЕРКА ЗА ПРАВА ЗА ТРИЕНЕ
    const canDelete = (authorEmail) => {
        const isAdmin = currentUserRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));
        const isAuthor = currentUserEmail && currentUserEmail.toLowerCase() === authorEmail.toLowerCase();
        return isAdmin || isAuthor;
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
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
                
                {/* Header на поста */}
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
                    
                    {/* Контроли за триене и цитиране */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-info border-0" onClick={() => onQuote(post.content)} title="Quote">
                            <i className="bi bi-chat-quote"></i>
                        </button>
                        
                        {/* Тук извикваме функцията, за да видим дали да покажем кошчето */}
                        {canDelete(post.authorUserId) && (
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={handleDeletePost} title="Delete Post">
                                <i className="bi bi-trash"></i> {/* Сменено от trash3 на trash за по-добра съвместимост */}
                            </button>
                        )}
                    </div>
                </div>

                {/* Съдържание */}
                <div 
                    className="mb-4 fs-5 rich-text-content" 
                    style={{ color: '#e2e8f0', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                {/* Бутони (Лайк / Коментар) */}
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

                {/* Коментари */}
                {post.comments.length > 0 && (
                    <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: '#0f172a' }}>
                        {post.comments.map(c => (
                            <div key={c.id} className="mb-3 pb-3 border-bottom border-secondary last-child-no-border">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div>
                                        <span className="fw-bold text-info small me-2">{c.authorUserId.split('@')[0]}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatDate(c.createdAt)}</span>
                                    </div>
                                    {/* Триене на коментар */}
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

                {/* Форма за коментар */}
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
};

// ==========================================
// ГЛАВЕН КОМПОНЕНТ: FeedPage
// ==========================================
export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quoteContent, setQuoteContent] = useState(null); 

    // БЕЗОПАСНО ЗАРЕЖДАНЕ НА ДАННИТЕ ЗА ТЕКУЩИЯ ПОТРЕБИТЕЛ
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [currentUserRoles, setCurrentUserRoles] = useState([]);

    useEffect(() => {
        try {
            // 1. Четем ролите
            const rolesStr = localStorage.getItem('userRoles');
            if (rolesStr) {
                const parsedRoles = JSON.parse(rolesStr);
                // Подсигуряваме се, че винаги е масив (дори ако backend-ът е върнал само 1 string)
                setCurrentUserRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
            }

            // 2. Четем токена и го разкодираме безопасно (без да гърми с кирилица или спец. символи)
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                
                // Търсим имейла във всички възможни Claim ключове на .NET
                const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] 
                           || payload.name 
                           || payload.unique_name 
                           || payload.email 
                           || "";
                setCurrentUserEmail(email);
            }
        } catch (e) {
            console.error("Error parsing user token data", e);
        }
    }, []);

    const fetchPosts = async () => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Feed`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setPosts(await res.json());
        } catch (err) {
            console.error("Error loading feed", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="feed-override-bg">
            <div className="container px-3 px-md-0 feed-content">
                
                <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                    <div>
                        <h2 className="fw-bold text-white mb-1">📰 The Locker Room</h2>
                        <p className="text-info mb-0 opacity-75">Scouting reports, transfer news, and community updates.</p>
                    </div>
                </div>

                <PostEditor 
                    onPostCreated={fetchPosts} 
                    quoteContent={quoteContent} 
                    clearQuote={() => setQuoteContent(null)} 
                />

                {isLoading ? (
                    <div className="text-center p-5 text-light opacity-50">
                        <div className="spinner-border mb-2" role="status"></div>
                        <div>Loading updates...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center p-5 rounded-4 shadow-sm" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                        <i className="bi bi-chat-square-text fs-1 d-block mb-3 opacity-50"></i>
                        No updates yet. Break the silence!
                    </div>
                ) : (
                    <div>
                        {posts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                onActionTriggered={fetchPosts} 
                                onQuote={(htmlContent) => setQuoteContent(htmlContent)}
                                currentUserEmail={currentUserEmail}
                                currentUserRoles={currentUserRoles}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .feed-override-bg {
                    position: absolute; top: 76px; left: 0; width: 100vw; min-height: calc(100vh - 76px);
                    background-color: #0f172a; padding-top: 2rem; padding-bottom: 5rem; z-index: 10;
                }
                .feed-content { max-width: 800px; margin: 0 auto; }

                .editor-card { background-color: #1e293b; overflow: hidden; }
                .ql-toolbar.ql-snow { background-color: #334155; border: none; border-bottom: 1px solid #475569; padding: 12px; }
                .ql-container.ql-snow { border: none; background-color: #1e293b; color: #f8fafc; font-size: 1.1rem; min-height: 120px; }
                .ql-editor.ql-blank::before { color: #64748b; font-style: normal; }
                .ql-snow .ql-stroke { stroke: #cbd5e1; }
                .ql-snow .ql-fill { fill: #cbd5e1; }
                .ql-snow .ql-picker { color: #cbd5e1; }
                .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke { stroke: #38bdf8; }
                
                .rich-text-content a { color: #38bdf8; text-decoration: none; }
                .rich-text-content a:hover { text-decoration: underline; }
                .rich-text-content ul, .rich-text-content ol { margin-bottom: 0; padding-left: 1.5rem; }
                .rich-text-content p { margin-bottom: 0; }
                
                .rich-text-content blockquote, .ql-editor blockquote {
                    border-left: 4px solid #38bdf8;
                    padding-left: 1rem;
                    margin-left: 0;
                    color: #94a3b8;
                    font-style: italic;
                    background-color: rgba(56, 189, 248, 0.05);
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-radius: 0 8px 8px 0;
                }

                .last-child-no-border:last-child { border-bottom: none !important; margin-bottom: 0 !important; padding-bottom: 0 !important; }
                .placeholder-gray::placeholder { color: #64748b !important; }
                .form-control:focus { background-color: #1e293b; color: white; }
                .post-card { transition: transform 0.2s ease; }
                .post-card:hover { transform: translateY(-2px); }
                .like-btn { transition: transform 0.1s ease; }
                .like-btn:active { transform: scale(0.9); }
                
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
                .pulse-anim { animation: pulse 0.3s ease-in-out; }
            `}} />
        </div>
    );
}