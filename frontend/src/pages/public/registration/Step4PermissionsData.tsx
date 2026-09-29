// frontend/src/pages/public/registration/Step4PermissionsData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Camera, MapPin, UserCheck, Waves } from 'lucide-react';
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
        <h2 className="step-card-title">2 - Autoritzacions Oficials del Campus</h2>
        <p className="step-card-subtitle">
          Configura les autoritzacions legals requerides per a les activitats, difusió esportiva i piscina municipal.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
        {/* 1. Imatges i vídeos */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Camera size={18} color="var(--primary)" />
            <strong style={{ fontSize: '14.5px', color: 'var(--text-main)' }}>
              Difusió d'Imatges i Vídeos en l'Àmbit Esportiu
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            Autoritzo per a emprar imatges/vídeos del nin o nina per fer difusió únicament en l'àmbit esportiu. Sempre que no perjudiqui la integritat física o moral del o la participant ni a d'altres.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`btn-gender ${permisos.imatges ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, imatges: true })}
              style={{ flex: 1, height: '40px' }}
            >
              SÍ
            </button>
            <button
              type="button"
              className={`btn-gender ${!permisos.imatges ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, imatges: false })}
              style={{ flex: 1, height: '40px' }}
            >
              NO
            </button>
          </div>
        </div>

        {/* 2. Sortir sol per tornar a casa */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UserCheck size={18} color="#eab308" />
            <strong style={{ fontSize: '14.5px', color: 'var(--text-main)' }}>
              Retorn a Casa Autònom
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            Autoritzo al meu fill o filla a sortir del campus sol per tornar a casa en finalitzar la jornada. (Si es marca NO, només podrà marxar acompanyat dels representants legals o autoritzats).
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`btn-gender ${permisos.sortirSol ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, sortirSol: true })}
              style={{ flex: 1, height: '40px' }}
            >
              SÍ
            </button>
            <button
              type="button"
              className={`btn-gender ${!permisos.sortirSol ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, sortirSol: false })}
              style={{ flex: 1, height: '40px' }}
            >
              NO
            </button>
          </div>
        </div>

        {/* 3. Sortides programades pel Club */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={18} color="var(--primary)" />
            <strong style={{ fontSize: '14.5px', color: 'var(--text-main)' }}>
              Participació a les Sortides Programades
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            Autoritzo al meu fill/a a participar a les sortides programades pel Club, sempre amb la supervisió del monitoratge del Campus.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`btn-gender ${permisos.sortides ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, sortides: true })}
              style={{ flex: 1, height: '40px' }}
            >
              SÍ
            </button>
            <button
              type="button"
              className={`btn-gender ${!permisos.sortides ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, sortides: false })}
              style={{ flex: 1, height: '40px' }}
            >
              NO
            </button>
          </div>
        </div>

        {/* 4. Servei de Piscina Municipal: SI / NO / SI (AMB MANIGUETS) */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Waves size={18} color="#0066f5" />
            <strong style={{ fontSize: '14.5px', color: 'var(--text-main)' }}>
              Servei de Piscina Municipal
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            Tria la modalitat d'accés a l'activitat diària de piscina municipal supervisada per socorristes i monitors del C.D. Murense.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <button
              type="button"
              className={`btn-gender ${permisos.piscina === 'SI' ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, piscina: 'SI' })}
              style={{ height: '44px', fontSize: '13px', fontWeight: 700 }}
            >
              SÍ (Autònom)
            </button>

            <button
              type="button"
              className={`btn-gender ${permisos.piscina === 'SI_MANIGUETS' ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, piscina: 'SI_MANIGUETS' })}
              style={{ height: '44px', fontSize: '13px', fontWeight: 700 }}
            >
              SÍ (AMB MANIGUETS)
            </button>

            <button
              type="button"
              className={`btn-gender ${permisos.piscina === 'NO' ? 'active' : ''}`}
              onClick={() => setPermisos({ ...permisos, piscina: 'NO' })}
              style={{ height: '44px', fontSize: '13px', fontWeight: 700 }}
            >
              NO
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={20} color="var(--success)" />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Les dades seran tractades de forma confidencial d'acord amb la normativa oficial de protecció de dades del C.D. Murense.
        </span>
      </div>

      {/* Botons d'acció */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-step-prev"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Tornar a Serveis</span>
        </button>

        <button
          type="submit"
          className="btn-step-next"
          id="btn-step4-continuar"
        >
          <span>Continuar a Resum i Confirmació</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step4PermissionsData;
