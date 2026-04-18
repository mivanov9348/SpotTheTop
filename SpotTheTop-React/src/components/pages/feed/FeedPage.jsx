import React, { useEffect, useState } from 'react';
import PostEditor from './PostEditor';
import PostCard from './PostCard';

const API_URL = "https://localhost:44306/api";

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quoteContent, setQuoteContent] = useState(null);

    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [currentUserRoles, setCurrentUserRoles] = useState([]);

    useEffect(() => {
        try {
            const rolesStr = localStorage.getItem('userRoles');
            if (rolesStr) {
                const parsedRoles = JSON.parse(rolesStr);
                setCurrentUserRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
            }

            const token = localStorage.getItem('jwtToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.name || payload.unique_name || payload.email || "";
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
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            
            {/* МОДЕРЕН HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center shadow text-info" style={{ width: '55px', height: '55px', fontSize: '1.5rem', border: '1px solid #334155' }}>
                        📰
                    </div>
                    <div>
                        <h2 className="fw-bolder text-white mb-0" style={{ letterSpacing: '-0.5px' }}>The Locker Room</h2>
                        <p className="text-info mb-0 opacity-75 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Global Football Feed</p>
                    </div>
                </div>
            </div>

            {/* РЕДАКТОРЪТ (Подаваме му email-а, за да си генерира аватарчето) */}
            <PostEditor
                onPostCreated={fetchPosts}
                quoteContent={quoteContent}
                clearQuote={() => setQuoteContent(null)}
                currentUserEmail={currentUserEmail}
            />

            {/* СПИСЪКЪТ С ПОСТОВЕ */}
            {isLoading ? (
                <div className="text-center p-5 text-light opacity-50 my-5">
                    <div className="spinner-grow text-info mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <div className="fw-bold tracking-wider text-uppercase small">Fetching latest updates...</div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center p-5 rounded-4 shadow-sm border border-secondary" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                    <i className="bi bi-megaphone fs-1 d-block mb-3 text-info opacity-50"></i>
                    <h5 className="fw-bold text-white mb-1">It's quiet in here...</h5>
                    <p className="mb-0 opacity-75">Be the first to break the silence and share some news!</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-4">
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

            {/* ГЛОБАЛНИ СТИЛОВЕ ЗА ТАЗИ СТРАНИЦА */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .editor-card { background-color: #1e293b; overflow: visible; border: 1px solid #334155; }
                .ql-toolbar.ql-snow { background-color: #0f172a; border: none; border-bottom: 1px solid #334155; padding: 12px; border-radius: 1rem 1rem 0 0; }
                .ql-container.ql-snow { border: none; background-color: transparent; color: #f8fafc; font-size: 1.1rem; min-height: 100px; }
                .ql-editor.ql-blank::before { color: #64748b; font-style: normal; }
                .ql-snow .ql-stroke { stroke: #94a3b8; }
                .ql-snow .ql-fill { fill: #94a3b8; }
                .ql-snow .ql-picker { color: #94a3b8; }
                .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke { stroke: #38bdf8; }
                
                .rich-text-content a { color: #38bdf8; text-decoration: none; font-weight: 500; }
                .rich-text-content a:hover { text-decoration: underline; }
                .rich-text-content ul, .rich-text-content ol { margin-bottom: 0; padding-left: 1.5rem; }
                .rich-text-content p { margin-bottom: 0; }
                
                .rich-text-content blockquote, .ql-editor blockquote {
                    border-left: 4px solid #38bdf8; padding-left: 1rem; margin-left: 0; color: #cbd5e1; font-style: italic;
                    background-color: rgba(56, 189, 248, 0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 8px 8px 0;
                }

                .post-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .post-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important; }
                
                .like-btn { transition: transform 0.1s ease; cursor: pointer; }
                .like-btn:active { transform: scale(0.85); }
                
                .reply-btn { font-size: 0.7rem; text-transform: uppercase; cursor: pointer; transition: color 0.2s; }
                .reply-btn:hover { color: #38bdf8 !important; }
                
                .tag-badge { background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
                
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
                .pulse-anim { animation: pulse 0.3s ease-in-out; }
            `}} />
        </div>
    );
}