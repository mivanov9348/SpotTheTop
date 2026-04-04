import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = "https://localhost:44306/api"; 

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }) 
            });

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                setEmail('');
                setPassword('');
                setTimeout(() => navigate('/'), 2000);
            } else {
                const textError = await response.text(); 
                setError(textError || 'An error occurred during registration.');
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
                                <h2 className="text-center mb-4 fw-bold text-success">Create Account</h2>
                                
                                {error && <div className="alert alert-danger rounded-3">{error}</div>}
                                {success && <div className="alert alert-success rounded-3">{success}</div>}
                                
                                <form onSubmit={handleRegister}>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="regEmail" placeholder="name@example.com" required
                                               value={email} onChange={e => setEmail(e.target.value)} />
                                        <label htmlFor="regEmail">Email address</label>
                                    </div>
                                    
                                    <div className="form-floating mb-3">
                                        <input type="password" className="form-control" id="regPassword" placeholder="Password" required
                                               value={password} onChange={e => setPassword(e.target.value)} />
                                        <label htmlFor="regPassword">Password (Min. 2 chars)</label>
                                    </div>

                                    <div className="form-floating mb-4">
                                        <select className="form-select" id="regRole" value={role} onChange={e => setRole(e.target.value)}>
                                            <option value="User">Standard User (Fan)</option>
                                            <option value="Scout">Scout</option>
                                            <option value="Player">Player</option>
                                            <option value="Team">Team Manager</option>
                                        </select>
                                        <label htmlFor="regRole">Select Account Type</label>
                                    </div>

                                    <button type="submit" className="btn btn-success w-100 py-2 mb-3 rounded-3 fw-bold">Sign Up</button>
                                    
                                    <div className="text-center mt-3">
                                        <span className="text-muted">Already have an account? </span>
                                        <Link to="/" className="text-decoration-none fw-bold text-success">Sign In</Link>
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