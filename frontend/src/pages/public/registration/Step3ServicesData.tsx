// frontend/src/pages/public/registration/Step3ServicesData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, UtensilsCrossed, Clock, Check, Percent, Compass } from 'lucide-react';
import type { ServeisForm } from '../../../types/inscripcio';

interface Step3ServicesDataProps {
  initialServeis: ServeisForm;
  onBack: () => void;
  onNext: (serveis: ServeisForm) => void;
}

const SETMANES_CAMPUS = [
  { num: 1, nom: 'Setmana 1', dates: '28 Juny - 2 Juliol' },
  { num: 2, nom: 'Setmana 2', dates: '5 Juliol - 9 Juliol' },
  { num: 3, nom: 'Setmana 3', dates: '12 Juliol - 16 Juliol' },
  { num: 4, nom: 'Setmana 4', dates: '19 Juliol - 23 Juliol' },
];

// Preus oficials segons document "ESTRUCTURA APP CAMPUS.pdf":
// 1 Setmana: 110€ | 2 Setmanes: 200€ | 3 Setmanes: 280€ | 4 Setmanes: 360€
export const PREUS_CAMPUS_SETMANA: { [key: number]: number } = {
  1: 110,
  2: 200,
  3: 280,
  4: 360,
};

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

  // Càlcul de cost oficial
  const countWeeks = serveis.setmanes.length;
  const baseCost = PREUS_CAMPUS_SETMANA[countWeeks] || (countWeeks > 0 ? countWeeks * 90 : 0);

  // Descompte 10% (no acumulable)
  const discountRate = serveis.descompte === 'cap' ? 0 : 0.10;
  const discountAmount = Math.round(baseCost * discountRate);
  const baseAfterDiscount = baseCost - discountAmount;

  // Serveis extra
  const menjadorCost = serveis.menjador ? countWeeks * 35 : 0;
  const matineraCost = serveis.matinera ? countWeeks * 15 : 0;
  const totalCost = baseAfterDiscount + menjadorCost + matineraCost;

  return (
    <form onSubmit={handleSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">4, 5 i 6 - Serveis, Cost del Campus i Sortides</h2>
        <p className="step-card-subtitle">
          Tria les setmanes d'assistència, descomptes aplicables, serveis opcionals i excursions programades.
        </p>
      </div>

      {/* 5 - COST CAMPUS & SETMANES */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <label className="form-label" style={{ margin: 0, fontSize: '15px' }}>
              5 - Cost del Campus (preus per setmana) *
            </label>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              1 setmana: 110€ • 2 setmanes: 200€ • 3 setmanes: 280€ • 4 setmanes: 360€
            </span>
          </div>
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
            Seleccionar mes sencer (4 setmanes)
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
        {errorSetmanes && <span className="error-text" style={{ marginTop: '6px', display: 'block' }}>{errorSetmanes}</span>}
      </div>

      {/* DESCOMPTES % (Elegir un: Cap / Jugador C.D. Murense / Família Nombrosa) */}
      <div style={{ marginBottom: '28px', background: '#f8fafc', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Percent size={18} color="var(--primary)" />
          <label className="form-label" style={{ margin: 0, fontSize: '14.5px' }}>
            Descomptes % (Elegir una opció - Descomptes no acumulables) *
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: serveis.descompte === 'cap' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: serveis.descompte === 'cap' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <input
              type="radio"
              name="descompte"
              checked={serveis.descompte === 'cap'}
              onChange={() => setServeis({ ...serveis, descompte: 'cap' })}
            />
            <span>Sense descompte (Cap)</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: serveis.descompte === 'murense' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: serveis.descompte === 'murense' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <input
              type="radio"
              name="descompte"
              checked={serveis.descompte === 'murense'}
              onChange={() => setServeis({ ...serveis, descompte: 'murense' })}
            />
            <span>Jugador del C.D. MURENSE (10%)</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: serveis.descompte === 'nombrosa' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: serveis.descompte === 'nombrosa' ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <input
              type="radio"
              name="descompte"
              checked={serveis.descompte === 'nombrosa'}
              onChange={() => setServeis({ ...serveis, descompte: 'nombrosa' })}
            />
            <span>Família Nombrosa (10%)</span>
          </label>
        </div>
      </div>

      {/* 4 - SERVEIS EXTRA */}
      <div style={{ marginBottom: '28px' }}>
        <label className="form-label" style={{ marginBottom: '12px', fontSize: '15px' }}>
          4 - Serveis Extra
        </label>

        <div className="service-cards-grid" style={{ marginBottom: '16px' }}>
          {/* Servei Extra Menjador: 14:00h - 15:00h */}
          <div
            className={`service-card-item ${serveis.menjador ? 'selected' : ''}`}
            onClick={() => setServeis({ ...serveis, menjador: !serveis.menjador })}
            role="button"
            tabIndex={0}
          >
            <div className="service-card-header">
              <span className="service-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UtensilsCrossed size={17} color="var(--primary)" />
                <span>Servei Extra Menjador</span>
              </span>
              <span className="service-card-badge">{serveis.menjador ? 'SI' : 'NO'}</span>
            </div>
            <span className="service-card-desc">
              Horari de 14:00h a 15:00h. Dinar supervisat i menús equilibrats per a la conciliació.
            </span>
            {serveis.menjador && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 800 }}>
                <Check size={14} strokeWidth={3} />
                <span>Contractat (SI)</span>
              </div>
            )}
          </div>

          {/* Servei Matinera */}
          <div
            className={`service-card-item ${serveis.matinera ? 'selected' : ''}`}
            onClick={() => setServeis({ ...serveis, matinera: !serveis.matinera })}
            role="button"
            tabIndex={0}
          >
            <div className="service-card-header">
              <span className="service-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={17} color="var(--primary)" />
                <span>Servei Matinera</span>
              </span>
              <span className="service-card-badge">{serveis.matinera ? 'SI' : 'NO'}</span>
            </div>
            <span className="service-card-desc">
              Acollida matinal supervisada a partir de les 08:00h per a famílies matineres.
            </span>
            {serveis.matinera && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 800 }}>
                <Check size={14} strokeWidth={3} />
                <span>Contractat (SI)</span>
              </div>
            )}
          </div>
        </div>

        {/* Intoleràncies alimentàries (texte) */}
        {serveis.menjador && (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="menjador-intolerancies">
              Intoleràncies alimentàries (texte)
            </label>
            <input
              id="menjador-intolerancies"
              type="text"
              className="form-input"
              placeholder="Indica al·lèrgies, celiaquia, intolerància a la lactosa, fruita, etc."
              value={serveis.intoleranciesMenjador || ''}
              onChange={(e) => setServeis({ ...serveis, intoleranciesMenjador: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* 6 - SORTIDES / EXCURSIONS */}
      <div style={{ marginBottom: '28px', background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Compass size={18} color="var(--primary)" />
          <label className="form-label" style={{ margin: 0, fontSize: '15px' }}>
            6 - Sortides i Excursions del Campus (Elegir SI / NO)
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Excursió 30/06/2027 */}
          <div
            onClick={() => setServeis({ ...serveis, excursio1: !serveis.excursio1 })}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: serveis.excursio1 ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: serveis.excursio1 ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '14px' }}>Excursió 30/06/2027</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: serveis.excursio1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                {serveis.excursio1 ? 'SI' : 'NO'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Sortida programada pel club amb la supervisió de l'equip de monitors.
            </p>
          </div>

          {/* Excursió 07/07/2027 */}
          <div
            onClick={() => setServeis({ ...serveis, excursio2: !serveis.excursio2 })}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: serveis.excursio2 ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: serveis.excursio2 ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '14px' }}>Excursió 07/07/2027</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: serveis.excursio2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                {serveis.excursio2 ? 'SI' : 'NO'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Sortida programada pel club amb la supervisió de l'equip de monitors.
            </p>
          </div>
        </div>
      </div>

      {/* Previsualització ràpida de cost */}
      <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Cost estimat per a {countWeeks} {countWeeks === 1 ? 'setmana' : 'setmanes'}
            {discountRate > 0 && ` (Descompte 10%: -${discountAmount}€)`}
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            Total estimat: {totalCost} €
          </div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          *Preus oficials C.D. Murense
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
          <span>Tornar a Tutors</span>
        </button>

        <button
          type="submit"
          className="btn-step-next"
          id="btn-step3-continuar"
        >
          <span>Continuar a Autoritzacions</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step3ServicesData;
