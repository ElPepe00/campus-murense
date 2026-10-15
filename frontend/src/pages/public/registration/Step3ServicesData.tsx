// frontend/src/pages/public/registration/Step3ServicesData.tsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  UtensilsCrossed, 
  Percent, 
  Compass, 
  AlertCircle 
} from 'lucide-react';
import type { ServeisForm } from '../../../types/inscripcio';
import { 
  CAMPUS_SETMANES_DEF, 
  calculateRegistrationPrice 
} from '../../../utils/campusConfig';

interface Step3ServicesDataProps {
  initialServeis: ServeisForm;
  onBack: () => void;
  onNext: (serveis: ServeisForm) => void;
}

export const Step3ServicesData: React.FC<Step3ServicesDataProps> = ({
  initialServeis,
  onBack,
  onNext,
}) => {
  const [serveis, setServeis] = useState<ServeisForm>(() => ({
    ...initialServeis,
    setmana: initialServeis.setmana || (initialServeis.setmanes && initialServeis.setmanes[0]) || 1,
    diesDinar: initialServeis.diesDinar || [],
  }));

  const currentWeekConfig = CAMPUS_SETMANES_DEF.find((s) => s.num === serveis.setmana) || CAMPUS_SETMANES_DEF[0];

  // Canviar la setmana única triada
  const handleSelectWeek = (weekNum: number) => {
    // En canviar de setmana, ajustam els dies de dinar per defecte a la nova setmana si l'usuari tenia dies marcats
    const newWeekConfig = CAMPUS_SETMANES_DEF.find((s) => s.num === weekNum);
    const newDiesDinar = serveis.diesDinar.length > 0 && newWeekConfig
      ? newWeekConfig.dies.map((d) => d.data)
      : [];

    setServeis((prev) => ({
      ...prev,
      setmana: weekNum,
      diesDinar: newDiesDinar,
    }));
  };

  // Toggle dia solt de dinar
  const handleToggleDay = (dayIso: string) => {
    setServeis((prev) => {
      const isAlready = prev.diesDinar.includes(dayIso);
      const updated = isAlready
        ? prev.diesDinar.filter((d) => d !== dayIso)
        : [...prev.diesDinar, dayIso];
      return { ...prev, diesDinar: updated };
    });
  };

  // Botons ràpids per al servei de dinar
  const handleSelectAllDays = () => {
    setServeis((prev) => ({
      ...prev,
      diesDinar: currentWeekConfig.dies.map((d) => d.data),
    }));
  };

  const handleClearAllDays = () => {
    setServeis((prev) => ({
      ...prev,
      diesDinar: [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(serveis);
  };

  // Càlcul de preu oficial dinàmic
  const pricing = calculateRegistrationPrice(
    serveis.setmana,
    serveis.diesDinar,
    serveis.excursio1,
    serveis.excursio2,
    serveis.descompte
  );

  return (
    <form onSubmit={handleSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">4, 5 i 6 - Setmana, Servei de Dinar i Sortides</h2>
        <p className="step-card-subtitle">
          Tria la setmana d'assistència (1 setmana per inscripció), descomptes aplicables, dies de dinar i excursions.
        </p>
      </div>

      {/* 1. SELECCIÓ ÚNICA DE SETMANA (110 € / setmana) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ margin: 0, fontSize: '15px' }}>
            5 - Setmana del Campus (Selecció Única: exactament 1 setmana per jugador) *
          </label>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Preu base oficial per setmana: <strong>110 €</strong> (Horari esportiu: 09:00h a 14:00h)
          </span>
        </div>

        <div className="service-cards-grid">
          {CAMPUS_SETMANES_DEF.map((setm) => {
            const isSelected = serveis.setmana === setm.num;
            return (
              <div
                key={setm.num}
                className={`service-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectWeek(setm.num)}
                role="button"
                tabIndex={0}
                style={{
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div className="service-card-header">
                  <span className="service-card-title" style={{ fontSize: '15px', fontWeight: 800 }}>
                    {setm.nom}
                  </span>
                  <span
                    className="service-card-badge"
                    style={{
                      background: isSelected ? 'var(--primary)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontWeight: 800,
                    }}
                  >
                    110 €
                  </span>
                </div>
                <span className="service-card-desc" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0 10px 0' }}>
                  <Calendar size={14} color="var(--primary)" />
                  <span>{setm.dates}</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <input
                    type="radio"
                    name="setmana_unica"
                    checked={isSelected}
                    onChange={() => handleSelectWeek(setm.num)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{isSelected ? 'Setmana triada' : 'Elegir aquesta setmana'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DESCOMPTES % (Elegir un: Cap / Jugador C.D. Murense / Família Nombrosa) */}
      <div style={{ marginBottom: '28px', background: '#f8fafc', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Percent size={18} color="var(--primary)" />
          <label className="form-label" style={{ margin: 0, fontSize: '14.5px' }}>
            Descomptes (10% - Descomptes NO acumulables) *
          </label>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Aplicable sobre el preu base de la setmana (estalvi d'11 €).
        </p>

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
            <span>Jugador C.D. MURENSE (-10%)</span>
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
            <span>Família Nombrosa (-10%)</span>
          </label>
        </div>
      </div>

      {/* 3. SERVEI DE DINAR (SELECCIÓ DE DIES SUELTOS: 8 € / dia) */}
      <div style={{ marginBottom: '28px', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={19} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800 }}>
              Servei de Dinar (8 € per dia seleccionat)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSelectAllDays}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Marcar tots (5 dies - 40€)
            </button>
            <button
              type="button"
              onClick={handleClearAllDays}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Cap dia (0€)
            </button>
          </div>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Horari de dinar: <strong>14:00h a 15:00h</strong>. Selecciona els dies que l'infant es quedarà a dinar a la <strong>{currentWeekConfig.nom}</strong> ({currentWeekConfig.dates}):
        </p>

        {/* Graella de dies solts per a dinar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {currentWeekConfig.dies.map((dia) => {
            const isDaySelected = serveis.diesDinar.includes(dia.data);
            return (
              <div
                key={dia.data}
                onClick={() => handleToggleDay(dia.data)}
                style={{
                  border: isDaySelected ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  background: isDaySelected ? '#eff6ff' : '#f8fafc',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {dia.diaSetmana}
                </span>
                <strong style={{ display: 'block', fontSize: '14px', margin: '4px 0', color: isDaySelected ? 'var(--primary)' : '#0f172a' }}>
                  {dia.etiqueta.split(' ')[1] || dia.etiqueta}
                </strong>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isDaySelected ? 'var(--primary)' : '#e2e8f0',
                    color: isDaySelected ? '#ffffff' : '#64748b',
                    marginTop: '2px',
                  }}
                >
                  {isDaySelected ? '8 € ✓' : '+ 8 €'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Resum ràpid de dinar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span>Dies seleccionats per a Dinar: <strong>{serveis.diesDinar.length} dies</strong></span>
          <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>Cost Dinar: {pricing.dinarCost} €</strong>
        </div>

        {/* Camp d'intoleràncies alimentàries (obligatori o recomanat si selecciona almenys un dia) */}
        {serveis.diesDinar.length > 0 && (
          <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="dinar-intolerancies" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} color="#d97706" />
              <span>Intoleràncies alimentàries o al·lèrgies per al servei de Dinar</span>
            </label>
            <input
              id="dinar-intolerancies"
              type="text"
              className="form-input"
              placeholder="Indica al·lèrgies (celiaquia, gluten, lactosa, ou, fruita seca...) o deixa en blanc si no en té"
              value={serveis.intoleranciesDinar || serveis.intoleranciesMenjador || ''}
              onChange={(e) => setServeis({ ...serveis, intoleranciesDinar: e.target.value, intoleranciesMenjador: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* 4. SORTIDES / EXCURSIONS (+15 € per excursió) */}
      <div style={{ marginBottom: '28px', background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Compass size={18} color="var(--primary)" />
          <label className="form-label" style={{ margin: 0, fontSize: '15px' }}>
            6 - Sortides i Excursions del Campus (+15 € per sortida)
          </label>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Activitats especials fora de les instal·lacions amb transport i monitors supervisats pel C.D. Murense.
        </p>

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
              <strong style={{ fontSize: '14px' }}>Excursió 1 (30/06/2027)</strong>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: serveis.excursio1 ? 'var(--primary)' : '#e2e8f0',
                  color: serveis.excursio1 ? '#ffffff' : '#64748b',
                }}
              >
                {serveis.excursio1 ? 'SÍ (+15 €)' : 'NO (0 €)'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Sortida programada pel club amb activitats lúdiques supervisades (+15 €).
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
              <strong style={{ fontSize: '14px' }}>Excursió 2 (07/07/2027)</strong>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: serveis.excursio2 ? 'var(--primary)' : '#e2e8f0',
                  color: serveis.excursio2 ? '#ffffff' : '#64748b',
                }}
              >
                {serveis.excursio2 ? 'SÍ (+15 €)' : 'NO (0 €)'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Sortida programada pel club amb activitats aquàtiques/esportives (+15 €).
            </p>
          </div>
        </div>
      </div>

      {/* 5. DESGLOSSAMENT I PREU TOTAL EN TEMPS REAL */}
      <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '12px', border: '1.5px solid #cbd5e1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Desglossament del càlcul en temps real:
            </span>
            <div style={{ fontSize: '13.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>• Preu base (Setmana {serveis.setmana}): <strong>110,00 €</strong></span>
              {pricing.discountAmount > 0 && (
                <span style={{ color: '#16a34a' }}>
                  • Descompte 10% ({serveis.descompte === 'murense' ? 'C.D. Murense' : 'Família Nombrosa'}): <strong>-{pricing.discountAmount},00 €</strong>
                </span>
              )}
              <span>• Dinar ({pricing.numDiesDinar} dies x 8 €): <strong>+{pricing.dinarCost},00 €</strong></span>
              {pricing.excursionsCost > 0 && (
                <span>• Excursions seleccionades: <strong>+{pricing.excursionsCost},00 €</strong></span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total de la inscripció
            </span>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', marginTop: '2px' }}>
              {pricing.totalPrice} €
            </div>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              *Preu oficial C.D. Murense
            </span>
          </div>
        </div>
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
