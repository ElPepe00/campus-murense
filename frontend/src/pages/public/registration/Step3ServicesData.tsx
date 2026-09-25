// frontend/src/pages/public/registration/Step3ServicesData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Waves, UtensilsCrossed, Clock, Check } from 'lucide-react';
import type { ServeisForm } from '../../../types/inscripcio';

interface Step3ServicesDataProps {
  initialServeis: ServeisForm;
  onBack: () => void;
  onNext: (serveis: ServeisForm) => void;
}

const SETMANES_CAMPUS = [
  { num: 1, nom: 'Setmana 1', dates: '28 Juny - 2 Juliol', preu: 65 },
  { num: 2, nom: 'Setmana 2', dates: '5 Juliol - 9 Juliol', preu: 65 },
  { num: 3, nom: 'Setmana 3', dates: '12 Juliol - 16 Juliol', preu: 65 },
  { num: 4, nom: 'Setmana 4', dates: '19 Juliol - 23 Juliol', preu: 65 },
];

export const Step3ServicesData: React.FC<Step3ServicesDataProps> = ({
  initialServeis,
  onBack,
  onNext,
}) => {
  const [serveis, setServeis] = useState<ServeisForm>(initialServeis);
  const [errorSetmanes, setErrorSetmanes] = useState<string>('');

  const toggleSetmana = (num: number) => {
    setErrorSetmanes('');
    setServeis((prev) => {
      const exists = prev.setmanes.includes(num);
      const newSetmanes = exists
        ? prev.setmanes.filter((s) => s !== num)
        : [...prev.setmanes, num].sort();
      return { ...prev, setmanes: newSetmanes };
    });
  };

  const selectAllWeeks = () => {
    setErrorSetmanes('');
    setServeis((prev) => ({
      ...prev,
      setmanes: [1, 2, 3, 4],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serveis.setmanes.length === 0) {
      setErrorSetmanes('Has de seleccionar com a mínim 1 setmana del Campus.');
      return;
    }
    setErrorSetmanes('');
    onNext(serveis);
  };

  // Càlcul estimat de preu
  const countWeeks = serveis.setmanes.length;
  const baseCost = countWeeks * 65;
  const menjadorCost = serveis.menjador ? countWeeks * 35 : 0;
  const matineraCost = serveis.matinera ? countWeeks * 15 : 0;
  const totalCost = baseCost + menjadorCost + matineraCost;

  return (
    <form onSubmit={handleSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">Selecció de Setmanes i Serveis</h2>
        <p className="step-card-subtitle">
          Tria els períodes d'assistència i els serveis opcionals de menjador i matinera per al teu infant.
        </p>
      </div>

      {/* 1. Selecció de Setmanes */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label className="form-label" style={{ margin: 0 }}>
            Setmanes del Campus C.D. Murense *
          </label>
          <button
            type="button"
            onClick={selectAllWeeks}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Seleccionar el mes sencer (4 setmanes)
          </button>
        </div>

        <div className="service-cards-grid">
          {SETMANES_CAMPUS.map((setm) => {
            const isSelected = serveis.setmanes.includes(setm.num);
            return (
              <div
                key={setm.num}
                className={`service-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSetmana(setm.num)}
                role="button"
                tabIndex={0}
              >
                <div className="service-card-header">
                  <span className="service-card-title">{setm.nom}</span>
                  <span className="service-card-badge">{setm.preu} €</span>
                </div>
                <span className="service-card-desc" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>{setm.dates}</span>
                </span>
                {isSelected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 800 }}>
                    <Check size={14} strokeWidth={3} />
                    <span>Seleccionada</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errorSetmanes && <span className="error-text" style={{ marginTop: '4px', display: 'block' }}>{errorSetmanes}</span>}
      </div>

      {/* 2. Serveis Addicionals */}
      <div style={{ marginBottom: '28px' }}>
        <label className="form-label" style={{ marginBottom: '12px' }}>
          Serveis Opcionals per a la família
        </label>

        <div className="service-cards-grid">
          {/* Servei de Menjador */}
          <div
            className={`service-card-item ${serveis.menjador ? 'selected' : ''}`}
            onClick={() => setServeis({ ...serveis, menjador: !serveis.menjador })}
            role="button"
            tabIndex={0}
          >
            <div className="service-card-header">
              <span className="service-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UtensilsCrossed size={17} color="var(--primary)" />
                <span>Servei de Menjador</span>
              </span>
              <span className="service-card-badge">+35 €/setm.</span>
            </div>
            <span className="service-card-desc">
              Horari de 13:30h a 15:00h amb menús equilibrats i adaptats a al·lèrgies alimentàries.
            </span>
            {serveis.menjador && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 800 }}>
                <Check size={14} strokeWidth={3} />
                <span>Contractat</span>
              </div>
            )}
          </div>

          {/* Servei de Matinera */}
          <div
            className={`service-card-item ${serveis.matinera ? 'selected' : ''}`}
            onClick={() => setServeis({ ...serveis, matinera: !serveis.matinera })}
            role="button"
            tabIndex={0}
          >
            <div className="service-card-header">
              <span className="service-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={17} color="var(--primary)" />
                <span>Escola Matinera</span>
              </span>
              <span className="service-card-badge">+15 €/setm.</span>
            </div>
            <span className="service-card-desc">
              Horari ampliat de 07:45h a 09:00h amb monitors per conciliar la vida laboral.
            </span>
            {serveis.matinera && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 800 }}>
                <Check size={14} strokeWidth={3} />
                <span>Contractat</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Piscina Diària Municipal */}
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Waves size={17} color="var(--primary)" />
          <span>Participació a la Piscina Municipal de Muro (inclosos)</span>
        </label>
        <select
          className="form-select"
          value={serveis.piscina}
          onChange={(e) => setServeis({ ...serveis, piscina: e.target.value as any })}
        >
          <option value="SI">Sí, sap nedar de forma autònoma</option>
          <option value="SI_MANIGUETS">Sí, però necessita maniguets / bombolla d'ajuda</option>
          <option value="NO">No, no desitgem que participi a la piscina</option>
        </select>
      </div>

      {/* Caixa de resum del preu acumulat */}
      <div className="summary-total-banner">
        <div>
          <span className="summary-total-title">Total estimat ({countWeeks} setmanes)</span>
          <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>
            Campus ({baseCost} €){serveis.menjador ? ` + Menjador (${menjadorCost} €)` : ''}
            {serveis.matinera ? ` + Matinera (${matineraCost} €)` : ''}
          </div>
        </div>
        <span className="summary-total-amount">{totalCost} €</span>
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
          id="btn-step3-continuar"
        >
          <span>Continuar a Permisos i Autoritzacions</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step3ServicesData;
