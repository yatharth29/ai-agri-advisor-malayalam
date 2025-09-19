"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import QueryComposer from "@/components/QueryComposer";
import AnswerFeed from "@/components/AnswerFeed";
import FarmerSidebar from "@/components/FarmerSidebar";
import ContextPanel from "@/components/ContextPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  Languages, 
  ChevronDown,
  Wifi,
  WifiOff
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface QueryPayload {
  text?: string;
  images: File[];
  audioFile?: File;
  transcription?: string;
  crop?: string;
  plot?: string;
  location?: string;
  farmerId?: string;
  language: string;
  season?: string;
  problemDescription?: string;
}

interface UserContext {
  farmerId: string;
  name: string;
  location: string;
  language: string;
  preferredCrop?: string;
}

export default function HomePage() {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  // User context
  const [userContext, setUserContext] = useState<UserContext>({
    farmerId: "farmer_001",
    name: "രാജേഷ് കുമാർ",
    location: "കൊച്ചി, കേരളം",
    language: "ml"
  });
  
  // Language and notifications
  const { language, setLanguage, t } = useI18n();
  const [notifications, setNotifications] = useState(3);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  
  // Query state for communication between composer and feed
  const [queries, setQueries] = useState<QueryPayload[]>([]);
  const [refreshFeed, setRefreshFeed] = useState(0);

  // Responsive layout detection
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      
      // Auto-close panels on mobile
      if (isMobileView) {
        setSidebarOpen(false);
        setContextPanelOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle query submission from composer to feed
  const handleQuerySubmit = (query: QueryPayload) => {
    setQueries(prev => [...prev, query]);
    setRefreshFeed(prev => prev + 1);
    
    // Close mobile panels after submission
    if (isMobile) {
      setSidebarOpen(false);
      setContextPanelOpen(false);
    }
  };

  // Handle plot selection from sidebar
  const handlePlotSelect = (plotId: string) => {
    console.log("Selected plot:", plotId);
    // This would typically update user context or query composer defaults
  };

  // Handle crop selection from sidebar
  const handleCropSelect = (crop: string) => {
    setUserContext(prev => ({ ...prev, preferredCrop: crop }));
    console.log("Selected crop:", crop);
  };

  // Language switching
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    setUserContext(prev => ({ ...prev, language: lang }));
    setLanguageMenuOpen(false);
  };

  const languages = [
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Menu and Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-primary">
                {t("appTitle")}
              </h1>
              {isOffline && (
                <Badge variant="destructive" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  {t("offline")}
                </Badge>
              )}
              {!isOffline && (
                <Wifi className="h-4 w-4 text-success" />
              )}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                {languages.find(l => l.code === language)?.flag}
                <ChevronDown className="h-3 w-3" />
              </Button>
              
              {languageMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg min-w-40 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 ${
                        language === lang.code ? 'bg-accent' : ''
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Context Panel Toggle (Mobile) */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContextPanelOpen(!contextPanelOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
        {/* Sidebar - Collapsible on mobile */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80' : 'relative w-80'} 
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <FarmerSidebar
            className="h-full border-r border-border"
            onPlotSelect={handlePlotSelect}
            onCropSelect={handleCropSelect}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 flex min-h-0">
            {/* Central Column - Query Composer + Answer Feed */}
            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto min-h-0">
                {/* Query Composer */}
                <div className="shrink-0">
                  <QueryComposer
                    farmerId={userContext.farmerId}
                    defaultCrop={userContext.preferredCrop}
                    defaultLocation={userContext.location}
                    onQuerySubmit={handleQuerySubmit}
                  />
                </div>

                {/* Answer Feed */}
                <div className="flex-1 min-h-0">
                  <AnswerFeed key={refreshFeed} />
                </div>
              </div>
            </main>

            {/* Context Panel - Hidden on mobile unless opened */}
            <aside className={`
              ${isMobile 
                ? `fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-200 ease-in-out ${
                    contextPanelOpen ? 'translate-x-0' : 'translate-x-full'
                  }`
                : 'w-80 border-l border-border'
              }
              bg-background
            `}>
              <div className="h-full overflow-y-auto">
                <ContextPanel />
              </div>
            </aside>

            {/* Mobile Context Panel Overlay */}
            {isMobile && contextPanelOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-30" 
                onClick={() => setContextPanelOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Global Toast Notifications */}
      <Toaster 
        position="top-center"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}