import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ClientLogin from "./pages/ClientLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientProtectedRoute from "./components/ClientProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import ClientLayout from "./pages/client/ClientLayout";
import Dashboard from "./pages/admin/Dashboard";
import Bookings from "./pages/admin/Bookings";
import BookingDetail from "./pages/admin/BookingDetail";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import Invoices from "./pages/admin/Invoices";
import InvoiceCreate from "./pages/admin/InvoiceCreate";
import InvoiceDetail from "./pages/admin/InvoiceDetail";
import Messages from "./pages/admin/Messages";
import Referrals from "./pages/admin/Referrals";
import GiftCardsAdmin from "./pages/admin/GiftCards";
import Settings from "./pages/admin/Settings";
import AITasks from "./pages/admin/AITasks";
import InvoiceView from "./pages/InvoiceView";
import GiftCardPurchase from "./pages/GiftCardPurchase";
import VirtualConsultation from "./pages/VirtualConsultation";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientMessages from "./pages/client/ClientMessages";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/invoice/:id" element={<InvoiceView />} />
      <Route path="/gift-cards" element={<GiftCardPurchase />} />
      <Route path="/virtual" element={<VirtualConsultation />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceCreate />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="gift-cards" element={<GiftCardsAdmin />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai-tasks" element={<AITasks />} />
        </Route>
      </Route>
      <Route path="/client" element={<ClientProtectedRoute />}>
        <Route element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="messages" element={<ClientMessages />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
