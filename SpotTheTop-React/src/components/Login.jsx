import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css'; // Увери се, че пътят до CSS-а ти е правилен!

const API_URL = "https://localhost:44306/api"; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setError('');

        try {
            const response = await fetch(`${API_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));
                navigate('/home');
            } else {
                setError('Invalid email or password!');
            }
        } catch (err) {
            setError('Cannot connect to the server.');
        }
    };

    return (
        <div className="auth-bg">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card glass-card p-4 p-md-5">
                            <h2 className="text-center auth-title mb-2">SpotTheTop</h2>
                            <p className="text-center text-muted mb-4">Welcome back to the pitch</p>
                            
                            {error && <div className="alert alert-danger py-2 rounded-3">{error}</div>}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Email Address</label>
                                    <input type="email" className="form-control" placeholder="scout@club.com"
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Password</label>
                                    <input type="password" className="form-control" placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                
                                <button type="submit" className="btn btn-success w-100 py-2 mb-4 fw-bold shadow-sm">Secure Login</button>
                                
                                <div className="text-center">
                                    <span className="text-muted small">New to the network? </span>
                                    <Link to="/register" className="text-success fw-bold text-decoration-none small">Create an account</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}