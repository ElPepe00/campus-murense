// frontend/src/pages/public/registration/Step4PermissionsData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Camera, MapPin, UserCheck } from 'lucide-react';
import type { AutoritzacionsForm } from '../../../types/inscripcio';

interface Step4PermissionsDataProps {
  initialPermisos: AutoritzacionsForm;
  onBack: () => void;
  onNext: (permisos: AutoritzacionsForm) => void;
}

export const Step4PermissionsData: React.FC<Step4PermissionsDataProps> = ({
  initialPermisos,
  onBack,
  onNext,
}) => {
  const [permisos, setPermisos] = useState<AutoritzacionsForm>(initialPermisos);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(permisos);
  };

  return (
    <form onSubmit={handleSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">Autoritzacions i Protecció de Dades</h2>
        <p className="step-card-subtitle">
          Configura els permisos obligatoris i opcionals segons la normativa del C.D. Murense i la RGPD.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {/* Dret d'imatges */}
        <label className="permission-row" htmlFor="perm-imatges">
          <input
            id="perm-imatges"
            type="checkbox"
            className="permission-checkbox"
            checked={permisos.imatges}
            onChange={(e) => setPermisos({ ...permisos, imatges: e.target.checked })}
          />
          <div className="permission-text-col">
            <span className="permission-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} color="var(--primary)" />
              <span>Autorització de drets d'imatge i contingut multimèdia</span>
            </span>
            <span className="permission-desc">
              Permet la publicació de fotografies i vídeos de les activitats esportives del campus exclusivament a les xarxes socials i web oficials del C.D. Murense.
            </span>
          </div>
        </label>

        {/* Sortides fora del club */}
        <label className="permission-row" htmlFor="perm-sortides">
          <input
            id="perm-sortides"
            type="checkbox"
            className="permission-checkbox"
            checked={permisos.sortides}
            onChange={(e) => setPermisos({ ...permisos, sortides: e.target.checked })}
          />
          <div className="permission-text-col">
            <span className="permission-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>Autorització per a sortides i activitats esportives a Muro</span>
            </span>
            <span className="permission-desc">
              Autoritzo la participació de l'infant en desplaçaments a la piscina municipal, poliesportiu i zones verdes de Muro acompanyat pels monitors del campus.
            </span>
          </div>
        </label>

        {/* Marxar sol a casa */}
        <label className="permission-row" htmlFor="perm-sortir-sol">
          <input
            id="perm-sortir-sol"
            type="checkbox"
            className="permission-checkbox"
            checked={permisos.sortirSol}
            onChange={(e) => setPermisos({ ...permisos, sortirSol: e.target.checked })}
          />
          <div className="permission-text-col">
            <span className="permission-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} color="#eab308" />
              <span>Autorització per marxar sol/a a casa en finalitzar la jornada</span>
            </span>
            <span className="permission-desc">
              Només recomanat per a infants majors de 10 anys. Si no es marca, l'infant només podrà ser recollit pels tutors o persones autoritzades prèviament.
            </span>
          </div>
        </label>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={20} color="var(--success)" />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Les teves dades seran tractades de forma confidencial d'acord amb la Llei Orgànica de Protecció de Dades (LOPD).
        </span>
      </div>

      {/* Botons de navegació */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-step-prev"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Pas anterior</span>
        </button>

        <button
          type="submit"
          className="btn-step-next"
          id="btn-step4-continuar"
        >
          <span>Continuar al Resum Final</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step4PermissionsData;
