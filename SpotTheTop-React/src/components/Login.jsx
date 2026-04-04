import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
                navigate('/dashboard');
            } else {
                setError('Invalid email or password!');
            }
        } catch (err) {
            setError('Cannot connect to the server.');
        }
    };

    return (
        <div className="d-flex align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-5">
                                <h2 className="text-center mb-4 fw-bold text-primary">SpotTheTop</h2>
                                <h5 className="text-center mb-4 text-muted">Welcome back</h5>
                                
                                {error && <div className="alert alert-danger rounded-3">{error}</div>}

                                <form onSubmit={handleLogin}>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required />
                                        <label htmlFor="floatingInput">Email address</label>
                                    </div>
                                    <div className="form-floating mb-4">
                                        <input type="password" className="form-control" id="floatingPassword" placeholder="Password"
                                            value={password} onChange={e => setPassword(e.target.value)} required />
                                        <label htmlFor="floatingPassword">Password</label>
                                    </div>
                                    
                                    <button type="submit" className="btn btn-primary w-100 py-2 mb-3 rounded-3 fw-bold">Sign In</button>
                                    
                                    <div className="text-center mt-3">
                                        <span className="text-muted">Don't have an account? </span>
                                        <Link to="/register" className="text-decoration-none fw-bold">Sign Up</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}