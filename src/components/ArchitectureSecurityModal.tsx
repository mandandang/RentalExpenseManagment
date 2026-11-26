import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Landmark, 
  Lock, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  FileCode2,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';

interface ArchitectureSecurityModalProps {
  onClose: () => void;
}

export const ArchitectureSecurityModal: React.FC<ArchitectureSecurityModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                European Open Banking (PSD2) &amp; Security Architecture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical guide on free-tier aggregation, API limits, ING &amp; Revolut integration, and anti-theft security.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Is Open Banking Free to Use? */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Pricing Answer
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Is European Open Banking Free to Use?
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Yes, completely free.</strong> Under the European Union PSD2 directive, banks must provide access to account information. 
            <strong>GoCardless Bank Account Data</strong> (formerly Nordigen) provides a <strong>100% Free Tier</strong> specifically for European developers and landlords. 
            It connects to <strong>ING Bank</strong> across all European markets (Netherlands, Germany, Belgium, etc.) and <strong>Revolut</strong> without any monthly fee or credit card required.
          </p>
          <div className="mt-2 text-[11px] text-slate-500 bg-white p-2.5 rounded border border-slate-200">
            <strong>Why is it free?</strong> While American screen-scrapers (like Plaid) charge per connected account, European regulations forced standard APIs (NextGenPSD2 &amp; Berlin Group). GoCardless uses this open ecosystem as a free entry point to their wider payments network.
          </div>
        </div>

        {/* Section 2: How to Connect ING & Revolut (Step-by-Step) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              How to Connect ING and Revolut to the App
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-blue-700 block text-[11px]">Step 1: Requisition</span>
              <p className="text-slate-600 text-[11px]">
                App calls GoCardless API to create a bank requisition specifically requesting read-only access for ING or Revolut.
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-blue-700 block text-[11px]">Step 2: Bank Redirect</span>
              <p className="text-slate-600 text-[11px]">
                App opens official ING or Revolut screen (or launches the ING/Revolut app on your iPhone via Universal Link).
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-blue-700 block text-[11px]">Step 3: Biometric 2FA</span>
              <p className="text-slate-600 text-[11px]">
                You approve read access using FaceID, TouchID, or your banking PIN inside your bank&apos;s own secure app.
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-blue-700 block text-[11px]">Step 4: 180-Day Token</span>
              <p className="text-slate-600 text-[11px]">
                Bank redirects back with an encrypted OAuth2 token. Valid for 180 days under EU law; renewed with 1 tap.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: PSD2 API Limits Explained */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">⏱️</span>
            What is the PSD2 API Rate Limit?
          </h3>
          <p className="text-xs text-blue-900 leading-relaxed">
            Under European Regulatory Technical Standards (RTS), European banks limit <strong>unattended background syncing to at least 4 times per 24 hours</strong> per account without requiring you to log in again.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-blue-950">
            <div className="bg-white/80 p-2.5 rounded border border-blue-100">
              <strong>Automated Background:</strong> Runs 2–4 times daily (e.g. at 06:00 and 18:00 CET) to ingest overnight rent transfers.
            </div>
            <div className="bg-white/80 p-2.5 rounded border border-blue-100">
              <strong>On-Demand Manual Refresh:</strong> When you actively open the app and tap &quot;Sync Feeds Now&quot;, banks permit immediate manual pulls.
            </div>
          </div>
        </div>

        {/* Section 4: Absolute Protection from Attacks, Theft & Phishing */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              How the App is Immune to Bank Account Attacks &amp; Phishing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                1. Read-Only Scope (AISP)
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                The connection is strictly Account Information Service (AISP), NOT Payment Initiation (PISP). 
                <strong>It is physically impossible</strong> for the app or any hacker to transfer money or withdraw a single euro from your ING or Revolut accounts.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                2. Zero Credential Exposure
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Your ING password, Revolut passcode, or 2FA credentials <strong>never enter this app</strong>. 
                Authentication occurs solely on ING and Revolut&apos;s encrypted bank domains.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                3. Anti-Phishing Domain Binding
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Bank OAuth redirects enforce strict URI whitelisting with PKCE (Proof Key for Code Exchange). Phishing interceptors cannot capture authorization codes.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                4. Total Tenant Isolation
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Tenants only receive standard WhatsApp payment breakdowns with public IBANs and transfer reference notes. They have zero access to the backend or bank feeds.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Production Architecture Blueprint */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recommended Production Stack (iOS &amp; Web)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-blue-300 font-bold mb-1">Mobile Client</div>
              <div className="text-slate-300 text-[11px]">
                <strong>iOS App / PWA:</strong> React + Tailwind CSS with iOS viewport safe-areas, or Swift/SwiftUI wrapper with universal links.
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-blue-300 font-bold mb-1">Backend API</div>
              <div className="text-slate-300 text-[11px]">
                <strong>Node.js / Express:</strong> Handles bank webhooks, PDF OCR ingestion, GoCardless token management, and WhatsApp link generation.
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-blue-300 font-bold mb-1">Database &amp; Security</div>
              <div className="text-slate-300 text-[11px]">
                <strong>PostgreSQL / Firestore:</strong> Stores 3 apartment units, tenant lease dates, and AES-256 encrypted tokens.
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Close Technical Guide
          </button>
        </div>
      </div>
    </div>
  );
};
