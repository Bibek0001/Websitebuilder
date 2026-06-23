import React, { createContext, useContext, useEffect, useState } from 'react';
import { landingService } from '../services/api';

interface PrimaryColorContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const PrimaryColorContext = createContext<PrimaryColorContextType>({
  primaryColor: '#2563eb',
  setPrimaryColor: () => {},
});

// Inject color as CSS custom properties on :root
const applyColorToDOM = (hex: string) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', hex);

  // Generate lighter/darker shades from the hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--color-primary-50',  lighten(r, g, b, 0.95));
  root.style.setProperty('--color-primary-100', lighten(r, g, b, 0.88));
  root.style.setProperty('--color-primary-200', lighten(r, g, b, 0.75));
  root.style.setProperty('--color-primary-400', lighten(r, g, b, 0.35));
  root.style.setProperty('--color-primary-500', hex);
  root.style.setProperty('--color-primary-600', hex);
  root.style.setProperty('--color-primary-700', darken(r, g, b, 0.15));
  root.style.setProperty('--color-primary-800', darken(r, g, b, 0.30));
  root.style.setProperty('--color-primary-900', darken(r, g, b, 0.45));
};

const lighten = (r: number, g: number, b: number, amount: number) => {
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

const darken = (r: number, g: number, b: number, amount: number) => {
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

export const PrimaryColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColorState] = useState('#2563eb');

  // Load color from platform settings on mount
  useEffect(() => {
    landingService.getContent()
      .then(r => {
        // Not in content — try a direct settings check via a known key
      })
      .catch(() => {});

    // Also try fetching from public landing stats endpoint to get the color
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5283/api'}/landing/primary-color`)
      .then(r => r.json())
      .then(d => {
        if (d.color && /^#[0-9A-Fa-f]{6}$/.test(d.color)) {
          setPrimaryColorState(d.color);
          applyColorToDOM(d.color);
        }
      })
      .catch(() => {
        // Use default color
        applyColorToDOM('#2563eb');
      });
  }, []);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    applyColorToDOM(color);
  };

  // Apply on initial load
  useEffect(() => {
    applyColorToDOM(primaryColor);
  }, [primaryColor]);

  return (
    <PrimaryColorContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </PrimaryColorContext.Provider>
  );
};

export const usePrimaryColor = () => useContext(PrimaryColorContext);
export { applyColorToDOM };
