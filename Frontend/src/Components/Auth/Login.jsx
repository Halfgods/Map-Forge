import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowRight, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import API_BASE_URL from '../../utils/api';
// import '../../CSS/Home.css';
import '../../CSS/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '69420'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success("Logged in successfully!");
                navigate('/');
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="auth-section">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div className="auth-logo" onClick={() => navigate('/')}>
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>layers</span>
                                <span className="logo-text">ARNavic</span>
                            </div>
                            <h1>Welcome Back</h1>
                            <p>Login to continue your journey</p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label><Mail size={18} /> Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label><Lock size={18} /> Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="auth-options">
                                <label className="remember-me">
                                    <input type="checkbox" /> Remember me
                                </label>
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>

                            <button type="submit" className="auth-button" disabled={loading}>
                                <span>{loading ? 'Logging in...' : 'Login'}</span>
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
                <div className="auth-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>
        </>

    );
};

export default Login;
