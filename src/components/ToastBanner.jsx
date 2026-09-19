import { useShop } from '../context/ShopContext';
import './ToastBanner.css';

export default function ToastBanner() {
  const { toast } = useShop();

  if (!toast) return null;

  return (
    <div className={`toast-banner-wrapper ${toast.type || 'success'}`}>
      <div className="toast-content">
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
