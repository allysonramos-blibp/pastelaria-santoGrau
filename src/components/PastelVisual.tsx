import React from 'react';
import { ProductCategory } from '../types';

interface PastelVisualProps {
  category: ProductCategory;
  name: string;
  imageUrl?: string;
  className?: string;
}

export const PastelVisual: React.FC<PastelVisualProps> = ({
  category,
  name,
  imageUrl,
  className = 'h-44 w-full',
}) => {
  const [hasError, setHasError] = React.useState(false);

  if (imageUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden bg-stone-900 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-white/10" />
      </div>
    );
  }

  const getTheme = () => {
    switch (category) {
      case 'salgados':
        return {
          bgGradient: 'from-amber-500 via-amber-600 to-amber-800',
          iconLabel: 'Pastel Artesanal Crocante',
          sub: 'Massa dourada frita na hora',
        };
      case 'especiais':
        return {
          bgGradient: 'from-orange-600 via-amber-700 to-stone-900',
          iconLabel: 'Especial Gourmet Recheado',
          sub: 'Ingredientes nobres selecionados',
        };
      case 'doces':
        return {
          bgGradient: 'from-rose-600 via-pink-700 to-amber-900',
          iconLabel: 'Pastel Doce & Cremoso',
          sub: 'Recheio generoso de confeitaria',
        };
      case 'combos':
        return {
          bgGradient: 'from-yellow-500 via-amber-600 to-stone-900',
          iconLabel: 'Combo Especial da Casa',
          sub: 'Pastel quentinho + bebida gelada',
        };
      case 'bebidas':
        return {
          bgGradient: 'from-emerald-600 via-teal-700 to-stone-900',
          iconLabel: 'Bebida Trincando de Gelada',
          sub: 'Refrescância imediata',
        };
      case 'porcoes':
        return {
          bgGradient: 'from-amber-600 via-orange-700 to-stone-900',
          iconLabel: 'Porção & Mini Pastéis',
          sub: 'Crocância para compartilhar',
        };
      default:
        return {
          bgGradient: 'from-amber-600 via-amber-700 to-stone-900',
          iconLabel: 'Feito na Hora',
          sub: 'Crocância incomparável',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} flex flex-col items-center justify-center p-4 text-white select-none ${className}`}
    >
      {/* 3D Studio Lighting & Ambient Glow */}
      <div
        className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/20 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-black/35 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 3D Isometric Grid Floor Perspective */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.45) 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      {/* 3D Sculpted Culinary Object with Floor Shadow */}
      <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105">
        {category === 'bebidas' ? (
          <div className="relative mb-2">
            {/* 3D Drop Shadow on surface */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-xs" />
            <svg
              className="w-16 h-16 relative z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cup3d" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="45%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#065f46" />
                </linearGradient>
                <linearGradient id="lid3d" x1="14" y1="10" x2="50" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
              {/* Straw */}
              <path d="M36 4 L32 16" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
              {/* 3D Cup Body */}
              <path d="M18 18 L46 18 L42 54 C42 56.5 39.5 58 37 58 L27 58 C24.5 58 22 56.5 22 54 Z" fill="url(#cup3d)" />
              {/* Specular 3D Highlight */}
              <path d="M22 22 L25 52" stroke="white" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
              {/* 3D Rim */}
              <rect x="15" y="13" width="34" height="6" rx="3" fill="url(#lid3d)" />
            </svg>
          </div>
        ) : category === 'porcoes' ? (
          <div className="relative mb-2">
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/40 rounded-full blur-xs" />
            <svg
              className="w-18 h-14 relative z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]"
              viewBox="0 0 80 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mini3d" x1="0" y1="0" x2="80" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
              {/* Back Mini Pastel */}
              <rect x="26" y="8" width="34" height="24" rx="5" transform="rotate(8 26 8)" fill="#d97706" stroke="#fef3c7" strokeWidth="1.5" />
              {/* Front Left Mini Pastel */}
              <rect x="12" y="18" width="34" height="24" rx="5" transform="rotate(-10 12 18)" fill="url(#mini3d)" stroke="#fef3c7" strokeWidth="1.5" />
              {/* Front Right Mini Pastel */}
              <rect x="36" y="20" width="34" height="24" rx="5" transform="rotate(6 36 20)" fill="url(#mini3d)" stroke="#fde68a" strokeWidth="1.5" />
              <circle cx="28" cy="27" r="3" fill="#fffbeb" fillOpacity="0.8" />
              <circle cx="52" cy="30" r="3.5" fill="#fffbeb" fillOpacity="0.8" />
            </svg>
          </div>
        ) : (
          <div className="relative mb-2">
            {/* 3D Floor Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black/45 rounded-full blur-xs" />
            <svg
              className="w-22 h-15 relative z-10 drop-shadow-[0_10px_12px_rgba(0,0,0,0.45)]"
              viewBox="0 0 88 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="pastelCrust3D" x1="10" y1="6" x2="78" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="38%" stopColor="#fbbf24" />
                  <stop offset="78%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="pastelSide3D" x1="8" y1="32" x2="80" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
              </defs>
              {/* 3D Extruded Bottom Edge of the Pastel */}
              <path
                d="M10 35 C 24 41, 64 41, 78 35 L 75 42 C 62 47, 26 47, 13 42 Z"
                fill="url(#pastelSide3D)"
              />
              {/* 3D Sculpted Top Puff Body */}
              <path
                d="M8 14 C 22 7, 66 7, 80 14 L 78 36 C 64 42, 24 42, 10 36 Z"
                fill="url(#pastelCrust3D)"
                stroke="#fef3c7"
                strokeWidth="1.5"
              />
              {/* 3D Crimped Fork Seal Marks */}
              <path
                d="M13 15 L13 34 M17 13 L17 36 M71 13 L71 36 M75 15 L75 34"
                stroke="#92400e"
                strokeWidth="1.6"
                strokeDasharray="2.5 2.5"
              />
              {/* 3D Glossy Specular Blisters */}
              <ellipse cx="32" cy="21" rx="7" ry="4" fill="#fffbeb" fillOpacity="0.85" />
              <ellipse cx="54" cy="24" rx="8.5" ry="4.5" fill="#fffbeb" fillOpacity="0.75" />
              <ellipse cx="43" cy="31" rx="5" ry="2.8" fill="#fef3c7" fillOpacity="0.8" />
              <ellipse cx="62" cy="17" rx="4" ry="2.2" fill="#fffbeb" fillOpacity="0.9" />
            </svg>
          </div>
        )}

        <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-xs">
          {theme.iconLabel}
        </span>
        <span className="text-[11px] text-amber-100/90 mt-0.5 font-medium">
          {theme.sub}
        </span>
      </div>

      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
    </div>
  );
};
