import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import RequestServicePage from '@/pages/RequestServicePage';
import ContactPage from '@/pages/ContactPage';
import PaymentPage from '@/pages/PaymentPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProjectsPage from '@/pages/admin/AdminProjectsPage';
import AdminProjectEditPage from '@/pages/admin/AdminProjectEditPage';
import AdminServiceRequestsPage from '@/pages/admin/AdminServiceRequestsPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/services/:service" element={<PublicLayout><ServiceDetailPage /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
        <Route path="/projects/:project" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
        <Route path="/request-service" element={<PublicLayout><RequestServicePage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/payment/:paymentId" element={<PaymentPage />} />
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectEditPage />} />
          <Route path="projects/:id" element={<AdminProjectEditPage />} />
          <Route path="service-requests" element={<AdminServiceRequestsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
