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
  // If an image URL is supplied, render it with resilient error fallback
  const [hasError, setHasError] = React.useState(false);

  if (imageUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-80" />
      </div>
    );
  }

  // Domain-crafted culinary SVG artwork with bubbly golden crust, artisan colors per category
  const getTheme = () => {
    switch (category) {
      case 'salgados':
        return {
          bgGradient: 'from-amber-600 to-amber-700',
          accent: '#f59e0b',
          iconLabel: '🥟 Pastel Salgado Crocante',
          sub: 'Massa fininha e sequinha',
        };
      case 'especiais':
        return {
          bgGradient: 'from-orange-700 to-stone-900',
          accent: '#ea580c',
          iconLabel: '⭐ Pastel Especial Gourmet',
          sub: 'Recheio farto & selecionado',
        };
      case 'doces':
        return {
          bgGradient: 'from-rose-600 to-amber-800',
          accent: '#e11d48',
          iconLabel: '🍓 Pastel Doce Artesanal',
          sub: 'Com açúcar e canela',
        };
      case 'combos':
        return {
          bgGradient: 'from-yellow-600 to-amber-800',
          accent: '#ca8a04',
          iconLabel: '⚡ Combo Pastelaria + Bebida',
          sub: 'Mais sabor por menos',
        };
      case 'bebidas':
        return {
          bgGradient: 'from-emerald-700 to-lime-900',
          accent: '#10b981',
          iconLabel: '🥤 Caldo de Cana & Bebidas',
          sub: 'Geladinho na hora',
        };
      case 'porcoes':
        return {
          bgGradient: 'from-amber-700 to-stone-900',
          accent: '#d97706',
          iconLabel: '🥢 Mini Pastéis & Aperitivos',
          sub: 'Perfeito para compartilhar',
        };
      default:
        return {
          bgGradient: 'from-amber-600 to-stone-800',
          accent: '#f59e0b',
          iconLabel: '🥟 Feito na Hora',
          sub: 'Crocância incomparável',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} flex flex-col items-center justify-center p-4 text-white select-none ${className}`}
    >
      {/* Decorative textured bubbly background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="30" cy="20" r="14" fill="#fff" />
        <circle cx="80" cy="80" r="22" fill="#fff" />
        <circle cx="150" cy="30" r="18" fill="#fff" />
        <circle cx="180" cy="90" r="12" fill="#fff" />
        <circle cx="120" cy="60" r="8" fill="#fff" />
      </svg>

      {/* Pastel Shape Icon */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {category === 'bebidas' ? (
          <svg
            className="w-14 h-14 mb-2 drop-shadow-md text-emerald-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        ) : category === 'porcoes' ? (
          <svg
            className="w-14 h-14 mb-2 drop-shadow-md text-amber-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 3 3 5-5" />
          </svg>
        ) : (
          <svg
            className="w-16 h-12 mb-1.5 drop-shadow-lg text-amber-200"
            viewBox="0 0 72 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Authentic Brazilian pastel silhouette with crimped fork edges */}
            <path
              d="M6 10 C 18 6, 54 6, 66 10 L 64 36 C 52 40, 20 40, 8 36 Z"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Crimping marks on edges */}
            <path
              d="M9 13 L9 33 M13 11 L13 35 M59 11 L59 35 M63 13 L63 33"
              stroke="#b45309"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            {/* Crisp bubbles on the surface */}
            <ellipse cx="26" cy="20" rx="5" ry="3" fill="#fef3c7" opacity="0.8" />
            <ellipse cx="45" cy="22" rx="7" ry="4" fill="#fef3c7" opacity="0.8" />
            <ellipse cx="36" cy="28" rx="4" ry="2.5" fill="#fef3c7" opacity="0.8" />
            <ellipse cx="52" cy="16" rx="3.5" ry="2" fill="#fef3c7" opacity="0.8" />
          </svg>
        )}

        <span className="text-xs font-semibold uppercase tracking-wider text-amber-100/90">
          {theme.iconLabel}
        </span>
        <span className="text-[11px] text-stone-200/90 mt-0.5">
          {theme.sub}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};
