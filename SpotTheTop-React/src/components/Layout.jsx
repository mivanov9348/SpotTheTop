import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        navigate('/');
    };

    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    const isActive = (path) => location.pathname === path ? "active fw-bold border-bottom border-3 border-info pb-1 text-white" : "text-light opacity-75";

    return (
        // ГЛОБАЛЕН ТЪМЕН ФОН ЗА ЦЯЛОТО ПРИЛОЖЕНИЕ
        <div className="min-vh-100" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3 sticky-top" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className="navbar-brand fw-bold text-info fs-4 me-5">SpotTheTop</span>
                        <div className="navbar-nav flex-row gap-4">
                            <Link to="/home" className={`nav-link text-decoration-none ${isActive('/home')}`}>Home</Link>
                            <Link to="/feed" className={`nav-link text-decoration-none ${isActive('/feed')}`}>Feed</Link>
                            <Link to="/leagues" className={`nav-link text-decoration-none ${isActive('/leagues')}`}>Leagues</Link>
                            <Link to="/players" className={`nav-link text-decoration-none ${isActive('/players')}`}>Players</Link>
                            
                            {hasAdminAccess && (
                                <Link to="/admin" className={`nav-link text-decoration-none text-warning ${isActive('/admin')}`}>Admin Panel</Link>
                            )}
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
                            <input type="text" className="form-control rounded-start-pill border-0 px-3 bg-dark text-white placeholder-gray" placeholder="Search the network..." />
                            <button className="btn btn-dark rounded-end-pill px-3 text-info" type="button">🔍</button>
                        </div>

                        <div className="d-flex align-items-center gap-3 border-start border-secondary ps-3">
                            <span className="text-light small d-none d-md-block opacity-75">Role: <strong className="text-info">{userRoles.join(', ')}</strong></span>
                            <button onClick={handleLogout} className="btn btn-sm btn-danger rounded-pill px-3 fw-bold shadow-sm">Sign Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mt-4 mb-5">
                <Outlet /> 
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .placeholder-gray::placeholder { color: #64748b !important; }
            `}} />
        </div>
    );
}