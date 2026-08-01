import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import StoreProductListPage from './pages/StoreProductListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProductListPage from './pages/ProductListPage';
import ProductAddPage from './pages/ProductAddPage';
import GenderCollectionPage from './pages/GenderCollectionPage';
import AboutUsPage from './pages/AboutUsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/products" element={<StoreProductListPage />} />
      <Route path="/gender" element={<GenderCollectionPage />} />
      <Route path="/gender/:genderType" element={<GenderCollectionPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/products" element={<ProductListPage />} />
      <Route path="/admin/products/add" element={<ProductAddPage />} />
      <Route path="/admin/products/edit/:id" element={<ProductAddPage />} />
    </Routes>
  );
}
