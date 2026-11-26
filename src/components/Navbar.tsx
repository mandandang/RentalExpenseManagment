import { Building2, Receipt, ArrowLeftRight, Landmark, ShieldCheck, Plus, Send, Smartphone, Lock, LogOut, Database } from 'lucide-react';
import { LandlordUser } from '../types/auth';

interface NavbarProps {
  activeTab: 'overview' | 'apartments' | 'bills' | 'banks' | 'reconciliation';
  setActiveTab: (tab: 'overview' | 'apartments' | 'bills' | 'banks' | 'reconciliation') => void;
  onOpenUpload: () => void;
  onOpenSecurityGuide: () => void;
  onOpenWhatsAppService: () => void;
  onOpenPhoneInstall: () => void;
  onOpenDatabaseModal: () => void;
  pendingReviewCount: number;
  pendingWhatsAppCount: number;
  currentUser: LandlordUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenSecurityGuide,
  onOpenWhatsAppService,
  onOpenPhoneInstall,
  onOpenDatabaseModal,
  pendingReviewCount,
  pendingWhatsAppCount,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark (Single text element, no pills) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block font-display leading-tight">
                RentReconcile EU
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                PSD2 Multi-Bank &amp; Split Engine
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean hover states) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-slate-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('apartments')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'apartments'
                  ? 'bg-slate-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              3 Apartments &amp; Tenants
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'bills'
                  ? 'bg-slate-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                PDF Bills &amp; Splits
              </span>
            </button>
            <button
              onClick={() => setActiveTab('banks')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'banks'
                  ? 'bg-slate-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Landmark className="w-4 h-4" />
                ING &amp; Revolut
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors relative whitespace-nowrap shrink-0 ${
                activeTab === 'reconciliation'
                  ? 'bg-slate-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4" />
                Reconciliation
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-md">
                    {pendingReviewCount}
                  </span>
                )}
              </span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenWhatsAppService}
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Launch WhatsApp Dispatch Service for outstanding shares"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp Dispatch</span>
              {pendingWhatsAppCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-600 text-white rounded-md">
                  {pendingWhatsAppCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenPhoneInstall}
              className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Install &amp; test on your iPhone or scan QR code"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Test on iPhone</span>
              <span className="sm:hidden">Install</span>
            </button>

            <button
              onClick={onOpenDatabaseModal}
              className="hidden md:flex px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
              title="Inspect Google Cloud Firestore Database & Console Link"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Cloud DB</span>
            </button>

            <button
              onClick={onOpenSecurityGuide}
              className="hidden lg:flex px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
              title="View PSD2 API limits, ING/Revolut security, and architecture"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PSD2 Specs</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload PDF Bill</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Landlord User Profile & Lock Session Button */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 bg-slate-100/90 rounded-lg border border-slate-200/80 text-xs"
                  title={`Authenticated as ${currentUser.name} (${currentUser.email})`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left max-w-[120px] truncate leading-tight">
                    <span className="font-semibold text-slate-800 block truncate text-[11px]">{currentUser.name}</span>
                    <span className="text-[9px] text-slate-500 capitalize">{currentUser.provider} • Owner</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Lock Financial Portal (Require login to view)"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50/90 px-3 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-1.5 px-2.5 rounded font-medium ${
            activeTab === 'overview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('apartments')}
          className={`py-1.5 px-2.5 rounded font-medium ${
            activeTab === 'apartments' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Apartments
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`py-1.5 px-2.5 rounded font-medium ${
            activeTab === 'bills' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveTab('banks')}
          className={`py-1.5 px-2.5 rounded font-medium ${
            activeTab === 'banks' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Banks
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`py-1.5 px-2.5 rounded font-medium ${
            activeTab === 'reconciliation' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Reconcile ({pendingReviewCount})
        </button>
      </div>
    </header>
  );
};
