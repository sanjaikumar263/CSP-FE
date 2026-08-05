import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0d14',
        color: '#d4af37',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div className="admin-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(212, 175, 55, 0.2)',
          borderTopColor: '#d4af37',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', fontSize: '0.95rem', letterSpacing: '0.05em', opacity: 0.8 }}>
          Verifying Admin Credentials...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and record current location for redirect back
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
