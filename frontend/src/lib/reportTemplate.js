// Digital version of the Torque Inspection Mobile PDF reports
export const GRADES = [
  { code: 'A', title: 'SHOWROOM', desc: 'Excellent état — aucune réparation majeure requise', color: 'bg-green-500/15 text-green-300 border-green-500/40' },
  { code: 'B', title: 'SÉCURITAIRE', desc: 'Bon état — réparations mineures ou majeures possibles', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
  { code: 'C', title: 'DANGEREUX', desc: 'Mauvais état — réparations majeures requises', color: 'bg-red-500/15 text-red-300 border-red-500/40' },
];

export const STATES = ['OK', 'À SURVEILLER', 'À RÉPARER', 'N/A'];
export const STATE_COLORS = {
  'OK': 'bg-green-600 text-white',
  'À SURVEILLER': 'bg-yellow-500 text-black',
  'À RÉPARER': 'bg-red-600 text-white',
  'N/A': 'bg-gray-400 text-white',
};

export const REPORT_TYPES = ['Préachat', 'Garantie prolongée', 'Flotte', 'Concessionnaire', 'Premium', 'Autre'];

export const SECTIONS = [
  { key: 'structure', title: 'Structure & Carrosserie', items: ['Châssis', 'Sous-châssis', 'Plancher', 'Alignement des panneaux de carrosserie', 'Joints et étanchéité', 'Portes', 'Coffre / hayon', 'Toit', 'Toit ouvrant', 'Peinture', 'Prise de charge (EV/PHEV)', 'Bouchon de réservoir'] },
  { key: 'vitres', title: 'Vitres & Visibilité', items: ['Pare-brise avant', 'Pare-brise arrière', 'Fenêtres', 'Rétroviseurs', 'Essuie-glaces', 'Lave-glace'] },
  { key: 'eclairage', title: 'Éclairage', items: ['Feux de position', 'Feux de croisement', 'Feux de route', 'Clignotants', 'Feux de recul', 'Feux de freinage'] },
  { key: 'mecanique', title: 'Mécanique & Diagnostic', items: ['Système de diagnostic / scan électronique', "Niveau d'huile moteur", 'Fuites moteur', 'Fuites de transmission', 'Freins avant', 'Freins arrière', 'Liquide de frein', 'Fuites de liquide de frein', 'Fuites de boîte de transfert', 'Fuites de différentiel', 'Liquide de refroidissement', 'Fuites de liquide de refroidissement', 'Filtre à air', 'Radiateur', 'Bouchon de radiateur', 'Batterie - tension', 'Batterie - bornes / câbles / fixation', 'Alternateur', 'Ventilateur de refroidissement', 'Direction assistée', 'Courroies', 'Durites et tuyaux', 'Amortisseurs et silentblocs', 'Rotules et biellettes de direction', 'Frein de stationnement', 'Joints homocinétiques et essieux', "Système d'échappement", 'Silencieux', 'Catalyseur', "Tuyaux d'échappement"] },
  { key: 'habitacle', title: 'Habitacle & Fonctionnalités', items: ['Climatisation - performance', 'Moteur de soufflerie', 'Condenseur', 'Voyants du tableau de bord', 'Jauges', 'Odeurs inhabituelles', 'Régulateur de vitesse', 'Radio / navigation', 'Haut-parleurs', 'Bluetooth', 'État du volant', 'Volant chauffant', 'Verrouillage centralisé', 'Vitres électriques', 'Rétroviseurs électriques', 'Toit ouvrant', 'État des sièges', 'Ceintures de sécurité', 'Sièges chauffants', 'Sièges ventilés', 'Sièges électriques', 'Caméra de recul', 'Capteurs de stationnement arrière', "Moniteurs d'angle mort", 'Tableau de bord - état / propreté', 'Panneaux intérieurs de porte', 'Tapis / moquettes', 'Pare-soleil', 'Klaxon'] },
  { key: 'essai', title: 'Essai Routier', items: ['Fonctionnement du moteur', 'Fonctionnement de la transmission', 'Fonctionnement de la boîte de vitesses', 'Fonctionnement du différentiel', 'Fonctionnement de la boîte de transfert', 'Compteur kilométrique', 'Système de freinage', 'Direction', 'Suspension', 'Roulements de roue', 'Embrayage (si applicable)'] },
  { key: 'admin', title: 'Points Administratifs', items: ['Vignette / immatriculation', 'Clés incluses', 'Manuel du constructeur', "Factures / historique d'entretien", 'Système de navigation'] },
];

export const TIRE_POSITIONS = ['Avant conducteur', 'Avant passager', 'Arrière conducteur', 'Arrière passager', 'Pneu de secours', 'Roues / jantes'];

export function emptyReport(inspection) {
  const checklist = {};
  SECTIONS.forEach((s) => {
    checklist[s.key] = {};
    s.items.forEach((it) => { checklist[s.key][it] = { state: '', comment: '' }; });
  });
  return {
    report_type: 'Préachat',
    grade: '',
    vehicle: {
      vin: inspection?.vehicle?.vin || '', make: inspection?.vehicle?.make || '', model: inspection?.vehicle?.model || '',
      year: inspection?.vehicle?.year || '', version: '', mileage: '', plate: '', color: '', engine: '',
    },
    checklist,
    tires: TIRE_POSITIONS.map((p) => ({ position: p, brand: '', year: '', size: '', season: '', depth: '', comment: '' })),
    obd: { codes: '', modules: '', warnings: '', observations: '' },
    estimates: [{ repair: '', priority: '', parts: '', labor: '', total: '' }],
    summary: { strengths: '', defects: '', recommendation: '' },
  };
}
