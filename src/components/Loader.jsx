import './Loader.css';

export default function Loader({ message = 'Loading...', fullScreen = false }) {
  return (
    <div className={`loader-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loader-spinner-wrapper">
        <div className="loader-spinner"></div>
        <div className="loader-inner-dot"></div>
      </div>
      {message && <p className="loader-text">{message}</p>}
    </div>
  );
}
