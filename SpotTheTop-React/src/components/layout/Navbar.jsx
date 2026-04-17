import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [username, setUsername] = useState("User");
    const [isScrolled, setIsScrolled] = useState(false);
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    
    // Ефект за промяна на сянката при скролиране (добавя дълбочина)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    const handleLogoutConfirm = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userRoles');
            navigate('/');
        }
    };

    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));
    
    // Помощна функция за класовете на активния линк
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
                    
                    {/* ЛЯВА ЧАСТ: Лого и Линкове */}
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

                    {/* ДЯСНА ЧАСТ: Търсачка, Нотификации, Профил */}
                    <div className="d-flex align-items-center gap-3">
                        
                        {/* Търсачка с анимация */}
                        <div className="input-group input-group-sm d-none d-xl-flex search-box-container">
                            <input type="text" className="form-control border-0 bg-dark text-white placeholder-gray shadow-none search-input" placeholder="Search players, clubs..." />
                            <button className="btn btn-dark text-info shadow-none" type="button"><i className="bi bi-search"></i></button>
                        </div>

                        {/* Нотификации */}
                        <div className="dropdown ms-1">
                            <button className="btn btn-link text-light position-relative p-0 border-0 shadow-none icon-hover" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi bi-bell-fill fs-5 opacity-75"></i>
                                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-2 border-dark rounded-circle pulse-animation" style={{ marginTop: '4px', marginLeft: '-6px' }}>
                                    <span className="visually-hidden">New alerts</span>
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary mt-3 rounded-4" style={{ width: '320px', backgroundColor: '#1e293b' }}>
                                <li><h6 className="dropdown-header text-info fw-bold text-uppercase tracking-wider">Notifications</h6></li>
                                <li>
                                    <a className="dropdown-item py-3 border-bottom border-secondary d-flex gap-3 align-items-start hover-bg-dark" href="#">
                                        <div className="bg-dark rounded-circle p-2 text-success shadow-sm d-flex justify-content-center align-items-center" style={{ width: '35px', height: '35px'}}>
                                            <i className="bi bi-check-lg fs-5"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="text-white small text-wrap lh-sm mb-1"><strong>System Admin</strong> approved your new player profile request.</div>
                                            <div className="text-info opacity-75" style={{ fontSize: '0.7rem' }}>10 mins ago</div>
                                        </div>
                                    </a>
                                </li>
                                <li><a className="dropdown-item text-center text-info small py-2 fw-bold" href="#">View all</a></li>
                            </ul>
                        </div>

                        {/* Потребителско Инфо и Изход */}
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

            {/* СПЕЦИФИЧНИ CSS СТИЛОВЕ ЗА NAVBAR-А */}
            <style dangerouslySetInnerHTML={{__html: `
                .transition-all { transition: all 0.3s ease; }
                .tracking-wider { letter-spacing: 0.05em; }
                
                /* Анимация за линковете в менюто (underline effect) */
                .custom-nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 50%;
                    background-color: #38bdf8;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                    border-radius: 2px;
                }
                .custom-nav-link:hover::after { width: 80%; }
                .hover-text-white:hover { opacity: 1 !important; color: white !important;}
                
                /* Активен линк (индикатор отдолу) */
                .active-link::after {
                    content: '';
                    position: absolute;
                    width: 80%;
                    height: 2px;
                    bottom: 0;
                    left: 50%;
                    background-color: #38bdf8;
                    transform: translateX(-50%);
                    border-radius: 2px;
                    box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
                }

                /* Лого неонов ефект */
                .logo-glow { text-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }

                /* Търсачка анимация */
                .search-box-container { border-radius: 50rem; overflow: hidden; background-color: #1e293b; border: 1px solid #334155; }
                .search-input { transition: width 0.3s ease; width: 140px !important; }
                .search-input:focus { width: 200px !important; outline: none; box-shadow: none; }
                
                /* Икони hover */
                .icon-hover:hover i { opacity: 1 !important; color: #38bdf8; transform: scale(1.1); transition: all 0.2s ease;}
                
                /* Пулсираща червена точка */
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .pulse-animation { animation: pulse 2s infinite; }

                /* Профил hover ефект */
                .profile-hover:hover { background-color: rgba(255, 255, 255, 0.05); }

                /* Бутон за изход */
                .logout-btn { color: #ef4444; background: transparent; transition: all 0.2s ease;}
                .logout-btn:hover { background-color: #ef4444; color: white; transform: rotate(90deg);}

                /* Мобилно меню тъмен фон */
                @media (max-width: 991.98px) {
                    .bg-dark-mobile { background-color: #0f172a; padding: 1rem !important; border: 1px solid #334155;}
                }
            `}} />
        </>
    );
}