import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { ChatDrawer } from './components/ai/ChatDrawer.jsx';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.jsx';
import { MarketplacePage } from './pages/public/MarketplacePage.jsx';
import { ListingDetailPage } from './pages/public/ListingDetailPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/public/VerifyEmailPage.jsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage.jsx';

// Buyer Pages
import { ComparisonAgentPage } from './pages/buyer/ComparisonAgentPage.jsx';
import { BuyerDashboardPage } from './pages/buyer/BuyerDashboardPage.jsx';
import { ShortlistPage } from './pages/buyer/ShortlistPage.jsx';
import { BuyerViewingsPage } from './pages/buyer/BuyerViewingsPage.jsx';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage.jsx';

// Seller Pages
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage.jsx';
import { CreateListingPage } from './pages/seller/CreateListingPage.jsx';
import { EditListingPage } from './pages/seller/EditListingPage.jsx';
import { SellerEvidencePage } from './pages/seller/SellerEvidencePage.jsx';
import { SellerQuestionsPage } from './pages/seller/SellerQuestionsPage.jsx';
import { SellerViewingsPage } from './pages/seller/SellerViewingsPage.jsx';

// Moderator Pages
import { ModeratorDashboardPage } from './pages/moderator/ModeratorDashboardPage.jsx';
import { ModeratorReviewPage } from './pages/moderator/ModeratorReviewPage.jsx';
import { ModeratorAuditPage } from './pages/moderator/ModeratorAuditPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/compare" element={<ComparisonAgentPage />} />

          {/* Protected Buyer Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shortlist"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <ShortlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/viewings"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerViewingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/profile"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'seller', 'moderator']}>
                <BuyerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Seller Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/create-listing"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/listings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['seller', 'moderator']}>
                <EditListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/listings/:id/evidence"
            element={
              <ProtectedRoute allowedRoles={['seller', 'moderator']}>
                <SellerEvidencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/questions"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/viewings"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerViewingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Moderator Routes */}
          <Route
            path="/moderator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['moderator']}>
                <ModeratorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/inspect/:id"
            element={
              <ProtectedRoute allowedRoles={['moderator']}>
                <ModeratorReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/audit"
            element={
              <ProtectedRoute allowedRoles={['moderator']}>
                <ModeratorAuditPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route
            path="*"
            element={
              <div className="container-custom py-16 text-center space-y-3">
                <h2 className="text-2xl font-bold text-slate-800">404 - Page Not Found</h2>
                <p className="text-xs text-slate-500">The requested screen does not exist.</p>
                <a href="/" className="btn btn-primary text-xs inline-flex">Return to Marketplace</a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Floating AI Buyer Chat Assistant */}
      <ChatDrawer />

      <Footer />
    </div>
  );
}
