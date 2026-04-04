import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://localhost:44306/api"; // СМЕНИ С ТВОЯ ПОРТ!

export default function Login() {
    const [email, setEmail] = useState('admin@spotthetop.com');
    const [password, setPassword] = useState('Ad!2');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Спира презареждането на страницата
        setError('');

        try {
            const response = await fetch(`${API_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                // Пазим токена и ролите в LocalStorage
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));
                // Отиваме в таблото
                navigate('/dashboard');
            } else {
                setError('Грешен имейл или парола!');
            }
        } catch (err) {
            setError('Няма връзка със сървъра. Пусна ли C# проекта?');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="text-center mb-4">Вход в SpotTheTop</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label>Email</label>
                                    <input type="email" className="form-control" 
                                           value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label>Парола</label>
                                    <input type="password" className="form-control" 
                                           value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Влез</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}