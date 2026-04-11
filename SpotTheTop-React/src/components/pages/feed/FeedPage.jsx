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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                <div>
                    <h2 className="fw-bold text-white mb-1">📰 The Locker Room</h2>
                    <p className="text-info mb-0 opacity-75">Scouting reports, transfer news, and community updates.</p>
                </div>
            </div>

            {/* РЕДАКТОРЪТ */}
            <PostEditor
                onPostCreated={fetchPosts}
                quoteContent={quoteContent}
                clearQuote={() => setQuoteContent(null)}
            />

            {/* СПИСЪКЪТ С ПОСТОВЕ */}
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

            {/* ГЛОБАЛНИ СТИЛОВЕ ЗА ТАЗИ СТРАНИЦА */}
            <style dangerouslySetInnerHTML={{
                __html: `
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
                    border-left: 4px solid #38bdf8; padding-left: 1rem; margin-left: 0; color: #94a3b8; font-style: italic;
                    background-color: rgba(56, 189, 248, 0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 8px 8px 0;
                }

                .last-child-no-border:last-child { border-bottom: none !important; margin-bottom: 0 !important; padding-bottom: 0 !important; }
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