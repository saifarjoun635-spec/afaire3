import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import logo from '../assets/logo.png';
import InspectionDetails from '../components/InspectionDetails';

export default function ReportLookup() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null); setError('');
    api.get(`/lookup/${encodeURIComponent(code)}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.detail || 'Code introuvable'));
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-10 px-5">
      <div className="max-w-2xl mx-auto">
        <Link to="/#rapport" className="flex items-center gap-2 text-white/50 hover:text-gold text-sm mb-6" data-testid="lookup-back-link"><ArrowLeft size={16} /> Retour</Link>
        <img src={logo} alt="Torque Inspection Mobile" className="h-14 mb-1" />
        <p className="text-white/50 mb-8 font-heading tracking-wide text-sm">RAPPORT D'INSPECTION • CODE {code}</p>
        {!data && !error && <p className="text-white/40">Chargement...</p>}
        {error && (
          <div data-testid="lookup-error" className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-300">
            {error}. Vérifiez votre code ou appelez-nous au 514 820 1136.
          </div>
        )}
        {data && (
          <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
            {data.client?.name && <p className="text-white/50 text-sm mb-3">Client : {data.client.name}</p>}
            <InspectionDetails inspection={data} showPrivate={false} />
          </div>
        )}
      </div>
    </div>
  );
}
