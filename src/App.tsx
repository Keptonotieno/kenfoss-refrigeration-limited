import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationToastContainer } from './components/NotificationToast';
import { SEO } from './components/SEO';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { ServicesSection } from './components/ServicesSection';
import { ColdRoomCalculator } from './components/ColdRoomCalculator';
import { WhyChooseUs } from './components/WhyChooseUs';
import { IndustriesSection } from './components/IndustriesSection';
import { ServiceAreas } from './components/ServiceAreas';
import { ProjectsGallery } from './components/ProjectsGallery';
import { BrandsSection } from './components/BrandsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBanner } from './components/CtaBanner';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AiDiagnosticModal } from './components/AiDiagnosticModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { GeminiImageStudioModal } from './components/GeminiImageStudioModal';
import { AuthModal } from './components/AuthModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminPortal } from './components/admin/AdminPortal';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';

function MainAppContent() {
  const { isAdminOpen, setIsAdminOpen } = useAdmin();
  const [activeTab, setActiveTab] = useState('home');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'service' | 'quote'>('service');
  const [prefillDetails, setPrefillDetails] = useState('');

  // AI Diagnostic Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Gemini Chatbot Modal State
  const [geminiChatbotOpen, setGeminiChatbotOpen] = useState(false);

  // Gemini Image Studio Modal State
  const [geminiImageStudioOpen, setGeminiImageStudioOpen] = useState(false);

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
    <ToastProvider>
      {/* Dynamic SEO Meta Tag Injector */}
      <SEO pageKey={isAdminOpen ? 'admin' : activeTab} />

      {isAdminOpen ? (
        <AdminPortal onCloseAdmin={() => setIsAdminOpen(false)} />
      ) : (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-100 font-sans antialiased selection:bg-[#0057B8] selection:text-white pb-14 md:pb-0 transition-colors duration-200">
          
          {/* Sticky Navigation Header */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenBooking={handleOpenBooking}
            onOpenAiDiagnostic={() => setGeminiChatbotOpen(true)}
            onOpenImageStudio={() => setGeminiImageStudioOpen(true)}
            onOpenCalculator={handleOpenCalculator}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Main Page Sections */}
          <main id="home" className="pt-[84px] md:pt-[116px] lg:pt-[120px] scroll-mt-[84px] md:scroll-mt-[116px] lg:scroll-mt-[120px]">
            
            {/* Hero Section */}
            <Hero
              onOpenBooking={handleOpenBooking}
              onOpenCalculator={handleOpenCalculator}
              onOpenAiDiagnostic={() => setGeminiChatbotOpen(true)}
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

            {/* Coverage Area & Dispatch Network */}
            <ServiceAreas onOpenBooking={handleOpenBooking} />

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
          <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

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
            onOpenChatbot={() => {
              setAiModalOpen(false);
              setGeminiChatbotOpen(true);
            }}
          />

          <GeminiChatbotModal
            isOpen={geminiChatbotOpen}
            onClose={() => setGeminiChatbotOpen(false)}
            onBookService={(prefill) => handleOpenBooking('service', prefill)}
          />

          <GeminiImageStudioModal
            isOpen={geminiImageStudioOpen}
            onClose={() => setGeminiImageStudioOpen(false)}
            onBookService={(prefill) => handleOpenBooking('service', prefill)}
          />

          <AuthModal />

          <FloatingWhatsApp onOpenChatbot={() => setGeminiChatbotOpen(true)} />

          <MobileBottomNav onOpenBooking={handleOpenBooking} />

        </div>
      )}

      {/* Floating Toast Notification Stack */}
      <NotificationToastContainer />

      {/* PWA Install Banner & Offline Status Manager */}
      <PWAInstallPrompt />
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AdminProvider>
            <MainAppContent />
          </AdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
