// frontend/src/pages/public/registration/RegistrationWizard.tsx
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Step1StudentData } from './Step1StudentData';
import type { 
  InscripcioState, 
  DadesNenForm, 
  DadesTutorForm, 
  PersonaAutoritzadaForm, 
  ServeisForm, 
  AutoritzacionsForm 
} from '../../../types/inscripcio';

interface RegistrationWizardProps {
  onCancel: () => void;
  onSuccess: (idInscripcio: number) => void;
}

const INITIAL_NEN: DadesNenForm = {
  nom: '',
  cognoms: '',
  dataNaixement: '',
  sexe: 'nen',
  colegi: 'CEIP Joan Mas (Muro)',
  curs: '4t Primària',
};

const INITIAL_TUTOR: DadesTutorForm = {
  nomComplet: '',
  email: '',
  telefonPrincipal: '',
};

const INITIAL_SERVEIS: ServeisForm = {
  setmanes: [1],
  menjador: false,
  matinera: false,
  piscina: 'NO',
  excursio1: false,
  excursio2: false,
};

const INITIAL_AUTORITZACIONS: AutoritzacionsForm = {
  imatges: true,
  sortides: true,
  sortirSol: false,
};

const STEPS_CONFIG = [
  { num: 1, label: 'Infant' },
  { num: 2, label: 'Tutors' },
  { num: 3, label: 'Serveis' },
  { num: 4, label: 'Permisos' },
  { num: 5, label: 'Confirmació' },
];

/**
 * Assistent complet d'inscripció online (passos 1 a 5) per al Campus C.D. Murense.
 */
export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<InscripcioState>({
    pasActual: 1,
    nen: INITIAL_NEN,
    tutor: INITIAL_TUTOR,
    autoritzats: [] as PersonaAutoritzadaForm[],
    serveis: INITIAL_SERVEIS,
    autoritzacions: INITIAL_AUTORITZACIONS,
  });

  const handleStep1Next = (dadesNen: DadesNenForm) => {
    setFormData((prev) => ({
      ...prev,
      nen: dadesNen,
      pasActual: 2,
    }));
  };

  const handleBack = () => {
    if (formData.pasActual > 1) {
      setFormData((prev) => ({ ...prev, pasActual: prev.pasActual - 1 }));
    } else {
      onCancel();
    }
  };

  return (
    <div className="wizard-page-container">
      {/* Barra superior de retorn */}
      <div className="wizard-nav-top">
        <button
          type="button"
          className="btn-wizard-back"
          onClick={handleBack}
          aria-label="Tornar enrere"
        >
          <ArrowLeft size={18} />
          <span>{formData.pasActual === 1 ? 'Cancel·lar inscripció' : 'Pas anterior'}</span>
        </button>

        <span className="wizard-step-indicator">
          Pas {formData.pasActual} de {STEPS_CONFIG.length}
        </span>
      </div>

      {/* Indicador visual de progrés per passos */}
      <div className="wizard-stepper-row">
        {STEPS_CONFIG.map((step) => {
          const isDone = formData.pasActual > step.num;
          const isCurrent = formData.pasActual === step.num;

          return (
            <div
              key={step.num}
              className={`stepper-node ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="stepper-circle">
                {isDone ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Contingut dinàmic de cada pas */}
      <div className="wizard-content-box">
        {formData.pasActual === 1 && (
          <Step1StudentData
            initialData={formData.nen}
            onNext={handleStep1Next}
          />
        )}

        {formData.pasActual > 1 && (
          <div className="step-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Pas {formData.pasActual}: {STEPS_CONFIG[formData.pasActual - 1]?.label}
            </h3>
            <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '480px', margin: '0 auto 28px' }}>
              Aquest formulari permetrà completar les dades de tutors, setmanes seleccionades i autoritzacions mèdiques.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={handleBack}
              >
                Modificar dades anteriors
              </button>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => {
                  if (formData.pasActual < 5) {
                    setFormData((prev) => ({ ...prev, pasActual: prev.pasActual + 1 }));
                  } else {
                    onSuccess(1);
                  }
                }}
              >
                <span>{formData.pasActual === 5 ? 'Confirmar i Finalitzar' : 'Continuar al següent pas'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationWizard;
