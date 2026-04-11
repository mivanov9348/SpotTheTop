import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [username, setUsername] = useState("User");
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    
    // Вземаме и декодираме имейла/името от токена при зареждане на Layout-а
    useEffect(() => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] 
                           || payload.name 
                           || payload.unique_name 
                           || payload.email 
                           || "User";
                
                // Вземаме само частта преди @ за по-кратко изписване
                setUsername(email.split('@')[0]); 
            }
        } catch (e) {
            console.error("Error parsing user token in layout", e);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        navigate('/');
    };

    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    const isActive = (path) => location.pathname === path ? "active fw-bold border-bottom border-3 border-info pb-1 text-white" : "text-light opacity-75";

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3 sticky-top" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container d-flex justify-content-between align-items-center">
                    
                    {/* ЛЯВА ЧАСТ: Лого и Линкове */}
                    <div className="d-flex align-items-center">
                        <span className="navbar-brand fw-bold text-info fs-4 me-5">SpotTheTop</span>
                        <div className="navbar-nav flex-row gap-4 d-none d-lg-flex">
                            <Link to="/home" className={`nav-link text-decoration-none ${isActive('/home')}`}>Home</Link>
                            <Link to="/feed" className={`nav-link text-decoration-none ${isActive('/feed')}`}>Feed</Link>
                            <Link to="/leagues" className={`nav-link text-decoration-none ${isActive('/leagues')}`}>Leagues</Link>
                            <Link to="/players" className={`nav-link text-decoration-none ${isActive('/players')}`}>Players</Link>
                            
                            {hasAdminAccess && (
                                <Link to="/admin" className={`nav-link text-decoration-none text-warning ${isActive('/admin')}`}>Admin Panel</Link>
                            )}
                        </div>
                    </div>

                    {/* ДЯСНА ЧАСТ: Търсачка, Нотификации и Профил */}
                    <div className="d-flex align-items-center gap-3">
                        
                        {/* Търсачка (скрита на мобилни за пестене на място) */}
                        <div className="input-group input-group-sm d-none d-xl-flex" style={{ maxWidth: '220px' }}>
                            <input type="text" className="form-control rounded-start-pill border-0 px-3 bg-dark text-white placeholder-gray shadow-none" placeholder="Search..." />
                            <button className="btn btn-dark rounded-end-pill px-3 text-info shadow-none" type="button">🔍</button>
                        </div>

                        {/* Камбанка за Нотификации с Dropdown */}
                        <div className="dropdown ms-2">
                            <button className="btn btn-link text-light position-relative p-0 border-0 shadow-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi bi-bell-fill fs-5 opacity-75 hover-opacity-100 transition-all"></i>
                                {/* Червена точка за нови известия */}
                                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-2 border-dark rounded-circle" style={{ marginTop: '4px', marginLeft: '-8px' }}>
                                    <span className="visually-hidden">New alerts</span>
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary mt-3 rounded-4" style={{ width: '320px', backgroundColor: '#1e293b' }}>
                                <li><h6 className="dropdown-header text-info fw-bold text-uppercase">Notifications</h6></li>
                                <li>
                                    <a className="dropdown-item py-3 border-bottom border-secondary d-flex gap-3 align-items-start hover-bg-dark" href="#">
                                        <i className="bi bi-check-circle-fill text-success fs-5"></i>
                                        <div>
                                            <div className="text-white small text-wrap"><strong>System Admin</strong> approved your new player profile request.</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>10 mins ago</div>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item py-3 border-bottom border-secondary d-flex gap-3 align-items-start hover-bg-dark" href="#">
                                        <i className="bi bi-heart-fill text-danger fs-5"></i>
                                        <div>
                                            <div className="text-white small text-wrap">Someone liked your recent post in The Locker Room.</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>2 hours ago</div>
                                        </div>
                                    </a>
                                </li>
                                <li><a className="dropdown-item text-center text-info small py-2 fw-bold" href="#">View all notifications</a></li>
                            </ul>
                        </div>

                        {/* Потребителски профил и Изход */}
                        <div className="d-flex align-items-center gap-3 border-start border-secondary ps-3 ms-1">
                            <div className="d-none d-md-flex align-items-center gap-2">
                                <div className="text-end">
                                    <div className="fw-bold text-white lh-1">{username}</div>
                                    <div className="text-info mt-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {userRoles.join(', ')}
                                    </div>
                                </div>
                                <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white fw-bold shadow-sm ms-2" style={{ width: '40px', height: '40px', fontSize: '1.2rem', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            
                            <button onClick={handleLogout} className="btn btn-outline-danger border-0 rounded-circle p-2 ms-1 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} title="Sign Out">
                                <i className="bi bi-box-arrow-right fs-5"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            <main className="container mt-4 mb-5">
                <Outlet /> 
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .placeholder-gray::placeholder { color: #64748b !important; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-bg-dark:hover { background-color: #0f172a !important; }
                
                /* Кастом скролбар за dropdown-а, ако стане дълъг */
                .dropdown-menu::-webkit-scrollbar { width: 6px; }
                .dropdown-menu::-webkit-scrollbar-track { background: transparent; }
                .dropdown-menu::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .dropdown-menu::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}