import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { SEO } from './components/SEO';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { ServicesSection } from './components/ServicesSection';
import { ColdRoomCalculator } from './components/ColdRoomCalculator';
import { WhyChooseUs } from './components/WhyChooseUs';
import { IndustriesSection } from './components/IndustriesSection';
import { ProjectsGallery } from './components/ProjectsGallery';
import { BrandsSection } from './components/BrandsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBanner } from './components/CtaBanner';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AiDiagnosticModal } from './components/AiDiagnosticModal';
import { AuthModal } from './components/AuthModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminPortal } from './components/admin/AdminPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'service' | 'quote'>('service');
  const [prefillDetails, setPrefillDetails] = useState('');

  // AI Diagnostic Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Admin Portal State
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  const handleOpenBooking = (type: string = 'service', prefill: string = '') => {
    setBookingType(type as 'service' | 'quote');
    setPrefillDetails(prefill);
    setBookingModalOpen(true);
  };

  const handleOpenCalculator = () => {
    setActiveTab('calculator');
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          {/* Dynamic SEO Meta Tag Injector */}
          <SEO pageKey={isAdminPortalOpen ? 'admin' : activeTab} />

          {isAdminPortalOpen ? (
            <AdminPortal onCloseAdmin={() => setIsAdminPortalOpen(false)} />
          ) : (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-100 font-sans antialiased selection:bg-[#0057B8] selection:text-white pb-14 md:pb-0 transition-colors duration-200">
              
              {/* Sticky Navigation Header */}
              <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenBooking={handleOpenBooking}
                onOpenAiDiagnostic={() => setAiModalOpen(true)}
                onOpenCalculator={handleOpenCalculator}
                onOpenAdmin={() => setIsAdminPortalOpen(true)}
              />

              {/* Main Page Sections */}
              <main id="home" className="pt-[84px] md:pt-[116px] lg:pt-[120px] scroll-mt-[84px] md:scroll-mt-[116px] lg:scroll-mt-[120px]">
                
                {/* Hero Section */}
                <Hero
                  onOpenBooking={handleOpenBooking}
                  onOpenCalculator={handleOpenCalculator}
                  onOpenAiDiagnostic={() => setAiModalOpen(true)}
                />

                {/* Trust Statistics Bar */}
                <TrustStats />

                {/* Services & Repair Section */}
                <ServicesSection onOpenBooking={handleOpenBooking} />

                {/* Cold Room Sizing & Energy Calculator */}
                <ColdRoomCalculator onOpenBooking={handleOpenBooking} />

                {/* Why Choose Kenfoss Split Layout */}
                <WhyChooseUs />

                {/* Industries Served */}
                <IndustriesSection onOpenBooking={handleOpenBooking} />

                {/* Featured Projects & Before/After Comparison */}
                <ProjectsGallery onOpenBooking={handleOpenBooking} />

                {/* OEM Partner Brands */}
                <BrandsSection />

                {/* Customer Testimonials & Verified Google Reviews */}
                <TestimonialsSection />

                {/* Call To Action Banner */}
                <CtaBanner onOpenBooking={handleOpenBooking} />

                {/* Knowledge Hub / Blog */}
                <BlogSection />

                {/* Contact & Office Locations */}
                <ContactSection />

              </main>

              {/* Corporate Footer */}
              <Footer onOpenAdmin={() => setIsAdminPortalOpen(true)} />

              {/* Modals & Floating Lead Generation Tools */}
              <BookingModal
                isOpen={bookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                initialType={bookingType}
                prefillDetails={prefillDetails}
              />

              <AiDiagnosticModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                onBookService={(prefill) => handleOpenBooking('service', prefill)}
              />

              <AuthModal />

              <FloatingWhatsApp />

              <MobileBottomNav onOpenBooking={handleOpenBooking} />

            </div>
          )}
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
