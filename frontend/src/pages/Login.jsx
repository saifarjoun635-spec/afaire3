import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/employe' : '/portail');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Connexion échouée');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-gold text-sm mb-8"><ArrowLeft size={16} /> Retour au site</Link>
        <div className="text-center mb-8">
          <img src={logo} alt="Torque Inspection Mobile" className="h-16 mx-auto" />
          <p className="text-white/50 mt-2 font-heading tracking-wide text-sm">ESPACE SÉCURISÉ</p>
        </div>
        <form onSubmit={submit} className="bg-[#141416] border border-white/10 rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-white/70 text-sm mb-1.5 font-heading">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition" required />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1.5 font-heading">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={loading} className="w-full flex items-center justify-center gap-2 gold-gradient text-white font-heading font-600 px-6 py-3.5 rounded-sm hover:brightness-105 transition disabled:opacity-60">
            <LogIn size={17} /> {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-6 bg-[#0e0e10] border border-white/8 rounded-lg p-4 text-xs text-white/50">
          <p className="flex items-center gap-2 text-white/70 mb-2 font-heading"><ShieldCheck size={14} className="text-gold" /> Comptes de démonstration</p>
          <p>Patron : <span className="text-gold">admin@torqueelite.com</span> / admin123</p>
          <p className="mt-1">Client : créez-en un via <Link to="/reserver" className="text-gold underline">Réserver</Link>. Employés : créés par le patron.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
