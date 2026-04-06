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

    // Помощна функция за активно меню
    const isActive = (path) => location.pathname === path ? "active fw-bold border-bottom border-3 border-primary pb-1" : "";

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3 sticky-top">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className="navbar-brand fw-bold text-primary fs-4 me-5">SpotTheTop</span>
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
                            <input type="text" className="form-control rounded-start-pill border-0 px-3" placeholder="Search the network..." />
                            <button className="btn btn-light rounded-end-pill px-3 text-primary" type="button">🔍</button>
                        </div>

                        <div className="d-flex align-items-center gap-3 border-start border-secondary ps-3">
                            <span className="text-light small d-none d-md-block">Role: <strong className="text-info">{userRoles.join(', ')}</strong></span>
                            <button onClick={handleLogout} className="btn btn-sm btn-danger rounded-pill px-3 fw-bold">Sign Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mt-4 mb-5">
                {/* Тук React Router ще "инжектира" страницата (Home, Feed, Admin и т.н.) */}
                <Outlet /> 
            </main>
        </div>
    );
}