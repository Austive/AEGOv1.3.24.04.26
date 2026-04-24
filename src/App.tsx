/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Features from './components/Features';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RoleRoute from './components/RoleRoute';
import ClientDashboard from './components/dashboards/ClientDashboard';
import CompanyDashboard from './components/dashboards/CompanyDashboard';
import PersonnelDashboard from './components/dashboards/PersonnelDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import PartnerWithUs from './components/PartnerWithUs';
import FAQAssistant from './components/FAQAssistant';
import CompanyProfile from './components/CompanyProfile';
import ContactUs from './components/ContactUs';

function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Navbar onBookClick={() => setIsBookingOpen(true)} />
      <main>
        <Hero onBookClick={() => setIsBookingOpen(true)} />
        <Features />
        <Services onBookClick={() => setIsBookingOpen(true)} />
        <ContactUs />
      </main>
      <Footer />
      <AnimatePresence>
        {isBookingOpen && (
          <BookingForm onClose={() => setIsBookingOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-white/30">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/partner" element={
              <>
                <Navbar />
                <PartnerWithUs />
                <Footer />
              </>
            } />
            <Route path="/company/:id" element={
              <>
                <Navbar />
                <CompanyProfile />
                <Footer />
              </>
            } />
            <Route path="/dashboard" element={
              <>
                <Navbar />
                <Dashboard />
              </>
            } />
            <Route path="/dashboard/client" element={
              <>
                <Navbar />
                <RoleRoute allowedRole="client">
                  <ClientDashboard />
                </RoleRoute>
              </>
            } />
            <Route path="/dashboard/company" element={
              <>
                <Navbar />
                <RoleRoute allowedRole="company">
                  <CompanyDashboard />
                </RoleRoute>
              </>
            } />
            <Route path="/dashboard/personnel" element={
              <>
                <Navbar />
                <RoleRoute allowedRole="personnel">
                  <PersonnelDashboard />
                </RoleRoute>
              </>
            } />
            <Route path="/dashboard/admin" element={
              <>
                <Navbar />
                <RoleRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleRoute>
              </>
            } />
          </Routes>
          <FAQAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}
