// frontend/src/pages/public/LoginPage.tsx
import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onCancel: () => void;
  isFullPage?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onCancel, isFullPage = false }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@cdmurense.com');
  const [password, setPassword] = useState('ClaveInicialSegura2027!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error d’autenticació.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isFullPage ? "admin-login-page" : "login-modal-overlay"}>
      <div className="login-card">
        <div className="login-card-header">
          <img 
            src="/logo.jpeg" 
            alt="C.D. Murense" 
            style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px', display: 'block' }}
          />
          <h2 className="login-title">Accés de Coordinació i Staff</h2>
          <p className="login-subtitle">Àrea restringida per a administradors i monitors del C.D. Murense</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correu electrònic</label>
            <div className="input-with-icon">
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cdmurense.com"
                required
              />
              <Mail size={18} className="input-right-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-pass">Contrasenya</label>
            <div className="input-with-icon">
              <input
                id="login-pass"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="input-right-icon" />
            </div>
          </div>

          <div className="login-actions">
            <button
              type="submit"
              className="btn-hero-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <span>{loading ? 'Accedint...' : 'Entrar al Panel Admin'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-hero-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onCancel}
            >
              Tornar al portal públic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
