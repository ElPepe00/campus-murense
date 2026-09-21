// frontend/src/pages/public/inscripcion/InscripcionWizard.tsx
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Step1DadesNen } from './Step1DadesNen';
import type { 
  InscripcioState, 
  DadesNenForm, 
  DadesTutorForm, 
  PersonaAutoritzadaForm, 
  ServeisForm, 
  AutoritzacionsForm 
} from '../../../types/inscripcio';

interface InscripcionWizardProps {
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

export const InscripcionWizard: React.FC<InscripcionWizardProps> = ({ onCancel, onSuccess }) => {
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
      {/* Wizard Header with Back Button */}
      <div className="wizard-header">
        <button 
          type="button" 
          className="btn-wizard-back" 
          onClick={handleBack}
          aria-label="Tornar enrere"
        >
          <ArrowLeft size={20} />
          <span>{formData.pasActual === 1 ? 'Cancel·lar' : 'Pas anterior'}</span>
        </button>

        <h1 className="wizard-title">Nova inscripció</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer for symmetry */}
      </div>

      {/* Steps Indicator (1 - 2 - 3 - 4 - 5) */}
      <div className="wizard-progress-bar" aria-label="Progrés de la inscripció">
        {[1, 2, 3, 4, 5].map((pas) => {
          const isCompleted = pas < formData.pasActual;
          const isCurrent = pas === formData.pasActual;

          return (
            <div key={pas} className="wizard-step-node">
              <div 
                className={`wizard-circle ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : pas}
              </div>
              <span className="wizard-step-label">
                {pas === 1 && "Infant"}
                {pas === 2 && "Tutors"}
                {pas === 3 && "Semanas"}
                {pas === 4 && "Permisos"}
                {pas === 5 && "Resum"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="wizard-card-content">
        {formData.pasActual === 1 && (
          <Step1DadesNen 
            initialData={formData.nen} 
            onNext={handleStep1Next} 
          />
        )}

        {formData.pasActual > 1 && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
              Pas {formData.pasActual} en preparació
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Has completat el <strong>Pas 1 (Dades del nin/nina: {formData.nen.nom} {formData.nen.cognoms})</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-hero-secondary"
                onClick={() => setFormData((prev) => ({ ...prev, pasActual: 1 }))}
              >
                Modificar Pas 1
              </button>
              <button 
                type="button" 
                className="btn-hero-primary"
                onClick={() => onSuccess(1)}
              >
                Simular finalització
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
