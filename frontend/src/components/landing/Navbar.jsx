import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const links = [
  { label: 'ACCUEIL', to: '#accueil' },
  { label: 'INSPECTIONS', to: '#services' },
  { label: 'VÉHICULES', to: '#vehicules' },
  { label: 'EN ACTION', to: '#galerie' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dash = user ? (user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/employe' : '/portail') : '/login';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-[#08080a]/95 backdrop-blur border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Torque Inspection Mobile" className="h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l, i) => (
            <a key={i} href={l.to} className="font-heading text-[13px] tracking-wide text-white/80 hover:text-gold transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <a href="tel:5148201136" className="flex items-center gap-2 text-white">
            <Phone size={16} className="text-gold" />
            <span className="font-heading text-sm">514 820 1136</span>
          </a>
          <button onClick={() => navigate(dash)} className="flex items-center gap-1.5 text-white/70 hover:text-gold text-sm font-heading">
            <LogIn size={16} /> {user ? 'Espace' : 'Connexion'}
          </button>
          <button onClick={() => navigate('/reserver')} className="gold-gradient text-white font-heading font-600 text-sm tracking-wide px-6 py-3 rounded-sm hover:brightness-110 transition">
            RÉSERVER
          </button>
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>

      {open && (
        <div className="lg:hidden bg-[#08080a] border-t border-white/10 px-5 py-4 space-y-3">
          {links.map((l, i) => (
            <a key={i} href={l.to} onClick={() => setOpen(false)} className="block font-heading text-white/80 py-1">{l.label}</a>
          ))}
          <a href="tel:5148201136" className="block text-gold font-heading py-1">514 820 1136</a>
          <button onClick={() => navigate(dash)} className="block w-full text-left text-white/80 font-heading py-1">{user ? 'Mon espace' : 'Connexion'}</button>
          <button onClick={() => navigate('/reserver')} className="w-full gold-gradient text-white font-heading font-600 px-6 py-3 rounded-sm">RÉSERVER</button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
