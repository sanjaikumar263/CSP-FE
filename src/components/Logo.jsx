import logoImg from '../assets/hero_logo.svg';

export default function Logo({ size = 38 }) {
  return (
    <div className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img
        src={logoImg}
        alt="Chennai Silk Palace"
        style={{ height: `${size}px`, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}
