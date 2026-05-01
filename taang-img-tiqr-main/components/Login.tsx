
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, User } from 'lucide-react';
import { SuccessModal } from './SuccessModal';

const DEFAULT_LOGO_URL = "/iLovePDF2-bg-removed.png";

export function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    React.useEffect(() => {
        if (!localStorage.getItem('device_id')) {
            const newId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('device_id', newId);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    device_id: localStorage.getItem('device_id')
                }),
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Store token with a timestamp to manage 4-day persistence
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('auth_login_time', Date.now().toString());
                localStorage.setItem('auth_role', data.role || 'admin');

                // Show success animation
                setShowSuccess(true);

                // Wait for 2 seconds then navigate
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(data.message || 'Invalid credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check your connection or try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-block bg-slate-900 p-4 rounded-[2rem] border-2 border-emerald-500 shadow-xl mb-6 float-animation">
                        <img src={DEFAULT_LOGO_URL} className="w-24 h-26 md:w-24 md:h-24" alt="Logo" />
                    </div>
                    <h1 className="text-xl font-padauk font-medium text-slate-900 tracking-tight mb-4">
                        ရံပ်ရို; အီနံင်ဒါ (TIQR)

                    </h1>



                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={30} className="text-emerald-500" />  Authorization Required from ta'ang immigration technical solution team
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-[1.5rem] outline-none text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                placeholder="ENTER USERNAME"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-[1.5rem] outline-none text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold text-center uppercase tracking-wide animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-emerald-400 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-slate-900/20 mt-4"
                    >
                        Sign In System
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Ta'ang Land Img QR Code Creator BY TITS TEAM
                    </p>
                    <p className="text-emerald-500/50 text-[9px] font-black uppercase tracking-[0.2em]">
                        VERSION V 1.0.0
                    </p>
                </div>
            </div>

            {/* Success Animation Modal */}
            <SuccessModal isVisible={showSuccess} />
        </div>
    );
}
