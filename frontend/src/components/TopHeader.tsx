import React from 'react';
import { Shield, Menu } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = "CAMPUS",
  subtitle = "DEPORTIVO C.D. MURENSE",
  onMenuClick,
}) => {
  return (
    <>
      {/* Phone Status Bar (mockup aesthetic) */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="status-bar-icons">
          <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
            <path d="M1 9.5h1.5v1H1v-1zm3-2h1.5v3H4v-3zm3-2h1.5v5H7v-5zm3-2h1.5v7H10v-7zm3-3H14.5v10H13v-10z" />
          </svg>
          <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 2.5C4.8 2.5 2 4.2.6 6.8L8 15.5l7.4-8.7C14 4.2 11.2 2.5 8 2.5z" />
          </svg>
          <svg width="22" height="11" viewBox="0 0 24 12" fill="currentColor">
            <rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="3" width="12" height="6" rx="1.5" />
            <path d="M21 4.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Blue App Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Shield size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div className="brand-title">
            <span className="brand-name">{title}</span>
            <span className="brand-subtitle">{subtitle}</span>
          </div>
        </div>
        <button 
          type="button" 
          className="header-action-btn" 
          aria-label="Menú principal"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </header>
    </>
  );
};
