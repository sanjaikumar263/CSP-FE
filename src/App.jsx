import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import CustomerAuthModal from './components/CustomerAuthModal';
import CartDrawerModal from './components/CartDrawerModal';
import ToastBanner from './components/ToastBanner';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import StoreProductListPage from './pages/StoreProductListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProductListPage from './pages/ProductListPage';
import ProductAddPage from './pages/ProductAddPage';
import GenderCollectionPage from './pages/GenderCollectionPage';
import AboutUsPage from './pages/AboutUsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import BannerManagementPage from './pages/BannerManagementPage';
import OfferManagementPage from './pages/OfferManagementPage';
import StoreInfoManagementPage from './pages/StoreInfoManagementPage';

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <ToastBanner />
        <CustomerAuthModal />
        <CartDrawerModal />
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/products" element={<StoreProductListPage />} />
          <Route path="/gender" element={<GenderCollectionPage />} />
          <Route path="/gender/:genderType" element={<GenderCollectionPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <ProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute>
                <ProductAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute>
                <ProductAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <ProtectedRoute>
                <BannerManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/offers"
            element={
              <ProtectedRoute>
                <OfferManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <StoreInfoManagementPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ShopProvider>
    </AuthProvider>
  );
}
