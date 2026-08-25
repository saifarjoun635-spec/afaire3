import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, ImageOff } from 'lucide-react';
import api from '../lib/api';
import logo from '../assets/logo.png';

const Album = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/album').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a]">
      <header className="bg-[#0e0e10] border-b border-white/10 px-5 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center"><img src={logo} alt="Torque Inspection Mobile" className="h-12 w-auto" /></Link>
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-gold text-sm font-heading"><ArrowLeft size={16} /> ACCUEIL</Link>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold font-heading text-sm tracking-[0.25em]">GALERIE</span>
          <h1 className="font-display text-4xl md:text-6xl text-white mt-3">NOTRE ALBUM</h1>
          <p className="text-white/60 mt-4">Photos de nos inspections et de notre équipe sur le terrain.</p>
        </div>

        {loading ? (
          <p className="text-white/40 text-center py-16 font-heading">Chargement...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <ImageOff size={44} className="mx-auto mb-3 opacity-50" />
            <p>Aucune photo pour le moment.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {items.map((it) => (
              <button key={it.id} onClick={() => setActive(it)} className="block w-full break-inside-avoid rounded-lg overflow-hidden border border-white/8 group">
                <img src={it.data} alt={it.caption} className="w-full group-hover:scale-105 transition-transform duration-500" />
                {it.caption && <div className="bg-[#141416] px-3 py-2 text-white/70 text-sm text-left">{it.caption}</div>}
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 py-10 px-5 text-center">
        <a href="tel:5148201136" className="inline-flex items-center gap-2 text-white/70 hover:text-gold"><Phone size={16} className="text-gold" /> 514 820 1136</a>
      </footer>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <img src={active.data} alt={active.caption} className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default Album;
