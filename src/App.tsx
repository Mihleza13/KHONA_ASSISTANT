import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { ConsultationScreen } from './components/ConsultationScreen';
import { VideoUploadScreen } from './components/VideoUploadScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ClinicSessionFlow } from './components/ClinicSessionFlow';
import { CommunityHub } from './components/Community/CommunityHub';
import { PatientVisitsView } from './components/PatientVisitsView';
import { PatientProfileView } from './components/PatientProfileView';
import { BottomTabBar } from './components/BottomTabBar';
import { ClinicMapModal } from './components/ClinicMapModal';
import { StaffViewModal } from './components/StaffViewModal';
import { PrivacyConsentModal } from './components/PrivacyConsentModal';
import { SignGuideModal } from './components/SignGuideModal';
import type { 
  NavigationTab, 
  StaffCommunication, 
  POPIAConsentState, 
  ClinicSession 
} from './types';
import { 
  getActiveSession, 
  clearActiveSession,
  recordCompletedConsultation 
} from './utils/patientSessionService';
import { MessageSquare, X } from 'lucide-react';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

export type AppView = 'welcome' | 'community' | 'clinic-flow' | 'app';
export type AppTab = NavigationTab | 'community' | 'history' | 'profile';

export function AppContent() {
  const { isDark } = useTheme();
  // Main view state: starts on the Welcome Screen
  const [appView, setAppView] = useState<AppView>('welcome');
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [activeSession, setActiveSession] = useState<ClinicSession | null>(() => getActiveSession());

  // Modals
  const [isClinicMapOpen, setIsClinicMapOpen] = useState(false);
  const [isStaffViewOpen, setIsStaffViewOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Staff Communications
  const [staffCommunications, setStaffCommunications] = useState<StaffCommunication[]>([]);
  const [patientIncomingPrompt, setPatientIncomingPrompt] = useState<string | null>(null);

  // POPIA Consent
  const [popiaConsent, setPopiaConsent] = useState<POPIAConsentState>(() => {
    try {
      const saved = localStorage.getItem('khona_popia_consent');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      hasAnswered: false,
      allowModelImprovement: true,
      timestamp: new Date().toISOString(),
    };
  });

  const handleSetConsent = (allow: boolean) => {
    const nextState: POPIAConsentState = {
      hasAnswered: true,
      allowModelImprovement: allow,
      timestamp: new Date().toISOString(),
    };
    setPopiaConsent(nextState);
    try {
      localStorage.setItem('khona_popia_consent', JSON.stringify(nextState));
    } catch {
      // ignore
    }
  };

  const handleSendToStaff = (comm: StaffCommunication) => {
    setStaffCommunications((prev) => [comm, ...prev]);

    if (ttsEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(comm.patientMessage);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAcknowledgeComm = (id: string) => {
    setStaffCommunications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'acknowledged' } : c))
    );
  };

  const handleClearAllComm = () => {
    setStaffCommunications([]);
  };

  const handleStaffPromptToPatient = (promptText: string) => {
    setPatientIncomingPrompt(promptText);
  };

  // Launching clinic consultation from the flow
  const handleStartConsultationSession = (session: ClinicSession) => {
    setActiveSession(session);
    setCurrentTab('home');
    setAppView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // End consultation session
  const handleEndConsultation = () => {
    if (activeSession) {
      recordCompletedConsultation(
        activeSession.patient.id,
        activeSession.todayReason || 'Consultation',
        `Consultation concluded with ${activeSession.practitioner.name}. Patient signs translated via KHONA.`,
        activeSession.todayLocation,
        undefined
      );
    }
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit from active app back to Welcome Screen / Sign Out
  const handleSignOut = () => {
    clearActiveSession();
    setActiveSession(null);
    setAppView('welcome');
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // VIEW 1: WELCOME SCREEN (Initial Entry Point)
  // =========================================================================
  if (appView === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <WelcomeScreen
          onContinueToClinic={() => {
            setAppView('clinic-flow');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCommunity={() => {
            setAppView('community');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStartClinicSession={() => {
            setAppView('clinic-flow');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCommunityHub={() => {
            setAppView('community');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenClinicMap={() => setIsClinicMapOpen(true)}
        />

        <ClinicMapModal
          isOpen={isClinicMapOpen}
          onClose={() => setIsClinicMapOpen(false)}
        />

        <PrivacyConsentModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
          popiaConsent={popiaConsent}
          onSetConsent={handleSetConsent}
        />

        <SignGuideModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SASL COMMUNITY (Pre-Sign-In Hub & Waiting Area)
  // =========================================================================
  if (appView === 'community') {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#090d14] text-white' : 'bg-[#f8fafc] text-zinc-900'
      }`}>
        <main className="flex-1 flex flex-col justify-start">
          <CommunityHub
            popiaConsent={popiaConsent}
            onBackToWelcome={() => {
              setAppView('welcome');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProceedToClinicSession={() => {
              setAppView('clinic-flow');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>

        <ClinicMapModal
          isOpen={isClinicMapOpen}
          onClose={() => setIsClinicMapOpen(false)}
        />

        <PrivacyConsentModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
          popiaConsent={popiaConsent}
          onSetConsent={handleSetConsent}
        />

        <SignGuideModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: CLINIC SESSION FLOW (Patient & Staff Authentication / Intake)
  // =========================================================================
  if (appView === 'clinic-flow') {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#090d14] text-white' : 'bg-[#f8fafc] text-zinc-900'
      }`}>
        <ClinicSessionFlow
          onStartConsultation={handleStartConsultationSession}
          onCancel={() => {
            setAppView('welcome');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <PrivacyConsentModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
          popiaConsent={popiaConsent}
          onSetConsent={handleSetConsent}
        />

        <SignGuideModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: AUTHENTICATED MOBILE APP SHELL (Home, Community, Visits, Profile, Talk)
  // =========================================================================
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark ? 'bg-[#090d14] text-white' : 'bg-[#f8fafc] text-zinc-900'
    }`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        ttsEnabled={ttsEnabled}
        onToggleTTS={() => setTtsEnabled((prev) => !prev)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenClinicMap={() => setIsClinicMapOpen(true)}
        onOpenStaffView={() => setIsStaffViewOpen(true)}
        activePatientMessageCount={staffCommunications.length}
        activeSession={activeSession}
        onExitToWelcome={handleSignOut}
      />

      {/* Staff Message Alert (Shown on patient tablet if staff sends prompt) */}
      {patientIncomingPrompt && (
        <div className="bg-teal-600 text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="max-w-6xl mx-auto flex items-center gap-3 w-full">
            <MessageSquare className="w-5 h-5 shrink-0 text-teal-200" />
            <div className="flex-1 text-sm font-semibold">
              <span className="text-teal-200 font-mono text-xs uppercase mr-2">
                Message from Clinic Staff:
              </span>
              <span>{patientIncomingPrompt}</span>
            </div>
            <button
              type="button"
              onClick={() => setPatientIncomingPrompt(null)}
              className="p-1 rounded-lg hover:bg-teal-700 text-teal-200 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {currentTab === 'home' && (
          <Homepage
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenClinicMap={() => setIsClinicMapOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenStaffView={() => setIsStaffViewOpen(true)}
            activeSession={activeSession}
            onStartNewSession={() => {
              setAppView('clinic-flow');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'community' && (
          <div className="py-4">
            <CommunityHub
              popiaConsent={popiaConsent}
              onBackToWelcome={() => setCurrentTab('home')}
              onProceedToClinicSession={() => setCurrentTab('consultation')}
            />
          </div>
        )}

        {currentTab === 'history' && activeSession?.patient && (
          <PatientVisitsView
            patient={activeSession.patient}
            activeSession={activeSession}
            onStartConsultation={() => setCurrentTab('consultation')}
          />
        )}

        {currentTab === 'profile' && activeSession?.patient && (
          <PatientProfileView
            patient={activeSession.patient}
            activeSession={activeSession}
            popiaConsent={popiaConsent}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onSignOut={handleSignOut}
          />
        )}

        {(currentTab === 'consultation' || currentTab === 'live-sign') && (
          <ConsultationScreen
            popiaConsent={popiaConsent}
            ttsEnabled={ttsEnabled}
            onToggleTTS={() => setTtsEnabled((prev) => !prev)}
            onEndSessionComplete={handleEndConsultation}
          />
        )}

        {currentTab === 'upload-video' && (
          <VideoUploadScreen
            onSendToStaff={handleSendToStaff}
            popiaConsent={popiaConsent}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasActiveSession={!!activeSession}
      />

      {/* Modals */}
      <ClinicMapModal
        isOpen={isClinicMapOpen}
        onClose={() => setIsClinicMapOpen(false)}
      />

      <StaffViewModal
        isOpen={isStaffViewOpen}
        onClose={() => setIsStaffViewOpen(false)}
        communications={staffCommunications}
        onAcknowledge={handleAcknowledgeComm}
        onClearAll={handleClearAllComm}
        onSendStaffPromptToPatient={handleStaffPromptToPatient}
      />

      <PrivacyConsentModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        popiaConsent={popiaConsent}
        onSetConsent={handleSetConsent}
      />

      <SignGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
