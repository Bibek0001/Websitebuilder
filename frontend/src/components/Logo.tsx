import React from 'react';
import { Link } from 'react-router-dom';
import logoSite from '../assets/logosite.png';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClass?: string;
  className?: string;
  dark?: boolean;
  to?: string;
  noLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 36,
  showText = true,
  textClass,
  className = '',
  dark = false,
  to = '/',
  noLink = false,
}) => {
  const nameClass = textClass || (dark ? 'text-white' : 'text-gray-900 dark:text-white');
  const accentClass = dark ? 'text-primary-300' : 'text-primary-600';

  const inner = (
    <>
      <img
        src={logoSite}
        alt="PersonalSite"
        style={{ width: size, height: size }}
        className="object-contain flex-shrink-0 transition-transform group-hover:scale-105"
      />
      {showText && (
        <span className={`font-extrabold text-lg leading-none ${nameClass}`}>
          PersonalSite<span className={accentClass}></span>
        </span>
      )}
    </>
  );

  if (noLink) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} className={`flex items-center gap-2.5 group flex-shrink-0 ${className}`}>
      {inner}
    </Link>
  );
};

export default Logo;
