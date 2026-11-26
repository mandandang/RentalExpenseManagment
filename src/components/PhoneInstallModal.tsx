import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Share2, 
  PlusSquare, 
  Check, 
  Copy, 
  ExternalLink, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  Send
} from 'lucide-react';

interface PhoneInstallModalProps {
  onClose: () => void;
}

export const PhoneInstallModal: React.FC<PhoneInstallModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const sharedAppUrl = 'https://rentreconcile-eu-property-bank-reconciliation.ai.studio';
  const cloudRunUrl = 'https://ais-pre-iyih6q2ydneqgisa3vauaq-957350472957.europe-west2.run.app';
  const devAppUrl = 'https://ais-dev-iyih6q2ydneqgisa3vauaq-957350472957.europe-west2.run.app';
  const [selectedUrlType, setSelectedUrlType] = useState<'custom' | 'cloudrun' | 'dev'>('custom');
  const appUrl = selectedUrlType === 'custom' ? sharedAppUrl : (selectedUrlType === 'cloudrun' ? cloudRunUrl : devAppUrl);
  const userEmail = 'mandanahashemi74@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code encoded image URL via fast SVG/PNG service for easy camera scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(appUrl)}&color=25-99-235`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Download &amp; Install on iPhone (iOS)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Install as a native standalone app directly onto your home screen with zero App Store waiting.
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

        {/* Host fix confirmation & Link selector */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Host permissions configured! Anyone with this link or QR code can now install the app.
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shrink-0">
            <button
              onClick={() => setSelectedUrlType('custom')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedUrlType === 'custom'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Link (.ai.studio)
            </button>
            <button
              onClick={() => setSelectedUrlType('cloudrun')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedUrlType === 'cloudrun'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cloud Run Link
            </button>
          </div>
        </div>

        {/* Quick QR Code Scan & Direct Link Strip */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-5">
          {/* QR Code */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 text-center">
            <img
              src={qrCodeUrl}
              alt="Scan to open on iPhone"
              className="w-32 h-32 rounded-lg mx-auto"
            />
            <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
              Point iPhone Camera
            </span>
          </div>

          {/* Direct URL & Copy Options */}
          <div className="space-y-2.5 flex-1 w-full text-xs">
            <div className="font-semibold text-slate-800">
              Your Live Mobile App URL:
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 truncate select-all">
              {appUrl}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Mobile Link</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${userEmail}?subject=RentReconcile EU - Mobile Link&body=Here is your direct link to open and install RentReconcile on your iPhone:%0D%0A%0D%0A${appUrl}%0D%0A%0D%0AInstructions:%0D%0A1. Open the link in Safari%0D%0A2. Tap the Share button%0D%0A3. Tap 'Add to Home Screen'`}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email to My Phone</span>
              </a>

              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>

        {/* Step-by-Step iOS Home Screen Installation Guide */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            3 Steps to Install on iPhone (Safari)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <div className="font-semibold text-slate-900">
                Open in Safari
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Scan the QR code with your iPhone camera or open Safari and navigate to the link above.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <span>Tap Share</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono">⎋</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Tap the iOS <strong>Share</strong> button (the square with an arrow pointing up) at the bottom toolbar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <span>Add to Home Screen</span>
                <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Scroll down in the share sheet, tap <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>&quot;Add&quot;</strong> in the top right.
              </p>
            </div>
          </div>
        </div>

        {/* What to Test on Phone Checklist */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-emerald-950">
              Key Features to Test Directly on Your iPhone:
            </h4>
          </div>
          <ul className="space-y-1.5 text-emerald-900 text-[11px] pl-1">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>1-Tap Native WhatsApp App Switching:</strong> Tap &quot;Launch WhatsApp&quot; on any tenant share — iOS will directly open your installed WhatsApp app with the pre-filled message and reference code!
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Mobile PDF Bill Upload:</strong> Take a photo or upload a utility bill PDF directly from your iPhone Files or Camera Roll.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Pro-Rata Absence Date Picker:</strong> Test setting absence dates with native iOS date wheels to watch roommate shares adjust instantly.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Sign in with Apple (Face ID):</strong> Fast, secure biometric landlord login with Apple ID, Google, or your 4-digit PIN.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Standalone Fullscreen Experience:</strong> Runs without Safari address bars, exactly like an App Store app.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
