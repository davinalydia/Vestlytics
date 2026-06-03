import logoImg from '../assets/logo.png';

export const Logo = ({ className = "w-10 h-10" }) => (
  <img src={logoImg} alt="Vestlytics Logo" className={`object-contain ${className}`} />
);
