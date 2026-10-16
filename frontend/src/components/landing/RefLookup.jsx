import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, KeyRound } from 'lucide-react';

export const RefLookup = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    if (code.trim()) navigate(`/rapport/${code.trim().toUpperCase()}`);
  };
  return (
    <section id="rapport" className="bg-[#0e0e10] py-16 px-5 lg:px-8 border-y border-white/5">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="flex items-center gap-2 text-gold font-heading text-sm tracking-widest"><KeyRound size={16} /> DÉJÀ CLIENT ?</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white mt-2">Consultez votre rapport</h2>
          <p className="text-white/55 mt-3 text-base">Entrez le code de référence reçu après votre achat pour voir l'avancement, les photos et le rapport de votre inspection.</p>
        </div>
        <form onSubmit={submit} className="flex gap-3" data-testid="ref-lookup-form">
          <input
            data-testid="ref-lookup-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            placeholder="Ex : K7Q2X"
            className="flex-1 bg-[#0a0a0b] border border-white/15 rounded-md px-5 py-4 text-white font-mono text-xl tracking-[0.3em] uppercase focus:border-gold outline-none"
          />
          <button data-testid="ref-lookup-submit" type="submit" className="gold-gradient text-white font-heading px-6 rounded-md flex items-center gap-2 hover:brightness-110 transition-[filter]">
            <Search size={18} /> Voir
          </button>
        </form>
      </div>
    </section>
  );
};

export default RefLookup;
