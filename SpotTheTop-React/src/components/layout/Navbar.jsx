import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const API_URL = "https://localhost:44306/api";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [username, setUsername] = useState("User");
    const [isScrolled, setIsScrolled] = useState(false);
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");

    // Стейтове за нотификации
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Стейт и референция за контрол на падащото меню
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) setIsScrolled(true);
            else setIsScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Ефект, който затваря менюто, ако кликнеш някъде другаде по екрана
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                const nameClaim = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] 
                               || payload.name 
                               || payload.unique_name 
                               || "User";
                
                setUsername(nameClaim); 
            }
        } catch (e) {
            console.error("Error parsing user token in Navbar", e);
        }
    }, []);

    // Зареждане на нотификациите
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/Notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.isRead).length);
                }
            } catch (err) {
                console.error("Failed to load notifications", err);
            }
        };

        fetchNotifications();
    }, []);

    // Клик върху нотификация
    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            const token = localStorage.getItem('jwtToken');
            await fetch(`${API_URL}/Notifications/${notif.id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => prev - 1);
        }

        if (notif.linkUrl) {
            navigate(notif.linkUrl);
            setIsDropdownOpen(false);
        }
    };

    const handleLogoutConfirm = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userRoles');
            navigate('/');
        }
    };

    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));
    
    const navLinkClass = (path) => {
        const baseClass = "nav-link position-relative px-2 mx-2 text-decoration-none fw-bold transition-all ";
        return location.pathname.startsWith(path) 
            ? baseClass + "text-white active-link" 
            : baseClass + "text-light opacity-75 hover-text-white custom-nav-link";
    };

    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-dark py-3 sticky-top transition-all ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`} 
                 style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container d-flex justify-content-between align-items-center">
                    
                    <div className="d-flex align-items-center">
                        <span className="navbar-brand fw-bolder fs-3 me-4 pe-2 position-relative logo-glow" style={{ color: '#38bdf8', letterSpacing: '1px' }}>
                            <i className="bi bi-heptagon-fill me-2 align-middle"></i>
                            SpotTheTop
                        </span>
                        
                        <button className="navbar-toggler shadow-none border-0 px-2" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="mainNavbar">
                            <div className="navbar-nav flex-column flex-lg-row align-items-lg-center mt-3 mt-lg-0 p-3 p-lg-0 bg-dark-mobile rounded-4">
                                <Link to="/home" className={navLinkClass('/home')}>Home</Link>
                                <Link to="/feed" className={navLinkClass('/feed')}>Feed</Link>
                                <Link to="/matches" className={navLinkClass('/matches')}>Matches</Link>
                                <Link to="/leagues" className={navLinkClass('/leagues')}>Leagues</Link>
                                <Link to="/players" className={navLinkClass('/players')}>Players</Link>
                                
                                {hasAdminAccess && (
                                    <div className="ms-lg-3 mt-2 mt-lg-0 border-start border-secondary ps-lg-3">
                                        <Link to="/admin" className={`btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold shadow-none ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                                            <i className="bi bi-shield-lock me-1"></i> Admin
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        
                        <div className="input-group input-group-sm d-none d-xl-flex search-box-container">
                            <input type="text" className="form-control border-0 bg-dark text-white placeholder-gray shadow-none search-input" placeholder="Search players, clubs..." />
                            <button className="btn btn-dark text-info shadow-none" type="button"><i className="bi bi-search"></i></button>
                        </div>

                        {/* НОТИФИКАЦИИ (ПОПРАВЕН КОНТЕЙНЕР) */}
                        <div className="dropdown ms-1 position-relative" ref={dropdownRef}>
                            <button 
                                className="btn btn-link text-light position-relative p-0 border-0 shadow-none icon-hover" 
                                type="button" 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <i className="bi bi-bell-fill fs-5 opacity-75"></i>
                                {unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger pulse-animation" style={{ fontSize: '0.6rem', marginTop: '4px', marginLeft: '-6px' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* ПОПРАВКА: d-block / d-none + absolute positioning */}
                            <ul 
                                className={`dropdown-menu dropdown-menu-dark shadow-lg border-secondary mt-3 rounded-4 custom-scrollbar ${isDropdownOpen ? 'd-block' : 'd-none'}`} 
                                style={{ 
                                    width: '350px', 
                                    backgroundColor: '#1e293b', 
                                    maxHeight: '400px', 
                                    overflowY: 'auto',
                                    position: 'absolute', 
                                    right: 0,        // Закрепяме вдясно
                                    left: 'auto',    // Не разпъва наляво
                                    top: '100%',     // Точно под бутона
                                    zIndex: 1050 
                                }}
                            >
                                <li><h6 className="dropdown-header text-info fw-bold text-uppercase tracking-wider">Notifications</h6></li>
                                
                                {notifications.length === 0 ? (
                                    <li><div className="dropdown-item py-3 text-center text-muted">No new notifications.</div></li>
                                ) : (
                                    notifications.map(notif => (
                                        <li key={notif.id}>
                                            <button 
                                                className={`dropdown-item py-3 border-bottom border-secondary d-flex gap-3 align-items-start hover-bg-dark ${notif.isRead ? 'opacity-50' : 'fw-bold'}`} 
                                                onClick={() => handleNotificationClick(notif)}
                                                style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                                            >
                                                <div className={`rounded-circle p-2 shadow-sm d-flex justify-content-center align-items-center ${notif.isRead ? 'bg-secondary text-dark' : 'bg-dark text-info border border-info'}`} style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                                                    <i className="bi bi-bell fs-6"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className={`small text-wrap lh-sm mb-1 ${notif.isRead ? 'text-light' : 'text-white'}`}>
                                                        {notif.content}
                                                    </div>
                                                    <div className="text-info opacity-75" style={{ fontSize: '0.7rem' }}>
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="d-flex align-items-center gap-3 border-start border-secondary ps-3 ms-1">
                            <div className="d-none d-md-flex align-items-center gap-2 cursor-pointer profile-hover rounded-pill p-1 pe-3 transition-all">
                                <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white fw-bold shadow-sm" style={{ width: '36px', height: '36px', fontSize: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-start">
                                    <div className="fw-bold text-white lh-1 small">{username}</div>
                                    <div className="text-info" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {userRoles.join(', ')}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleLogoutConfirm} 
                                className="btn btn-outline-danger border-0 rounded-circle p-2 d-flex align-items-center justify-content-center logout-btn shadow-none" 
                                title="Sign Out"
                            >
                                <i className="bi bi-power fs-5"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            <style dangerouslySetInnerHTML={{__html: `
                .transition-all { transition: all 0.3s ease; }
                .tracking-wider { letter-spacing: 0.05em; }
                
                .custom-nav-link::after {
                    content: ''; position: absolute; width: 0; height: 2px;
                    bottom: 0; left: 50%; background-color: #38bdf8;
                    transition: all 0.3s ease; transform: translateX(-50%); border-radius: 2px;
                }
                .custom-nav-link:hover::after { width: 80%; }
                .hover-text-white:hover { opacity: 1 !important; color: white !important;}
                
                .active-link::after {
                    content: ''; position: absolute; width: 80%; height: 2px;
                    bottom: 0; left: 50%; background-color: #38bdf8;
                    transform: translateX(-50%); border-radius: 2px;
                    box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
                }

                .logo-glow { text-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }

                .search-box-container { border-radius: 50rem; overflow: hidden; background-color: #1e293b; border: 1px solid #334155; }
                .search-input { transition: width 0.3s ease; width: 140px !important; }
                .search-input:focus { width: 200px !important; outline: none; box-shadow: none; }
                
                .icon-hover:hover i { opacity: 1 !important; color: #38bdf8; transform: scale(1.1); transition: all 0.2s ease;}
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .pulse-animation { animation: pulse 2s infinite; }

                .profile-hover:hover { background-color: rgba(255, 255, 255, 0.05); }

                .logout-btn { color: #ef4444; background: transparent; transition: all 0.2s ease;}
                .logout-btn:hover { background-color: #ef4444; color: white; transform: rotate(90deg);}

                @media (max-width: 991.98px) {
                    .bg-dark-mobile { background-color: #0f172a; padding: 1rem !important; border: 1px solid #334155;}
                }
            `}} />
        </>
    );
}