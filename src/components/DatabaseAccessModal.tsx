import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  Layers, 
  HardDrive, 
  Cloud, 
  Lock 
} from 'lucide-react';
import { LandlordUser } from '../types/auth';

interface DatabaseAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LandlordUser | null;
  counts: {
    apartments: number;
    tenants: number;
    bills: number;
    bankAccounts: number;
    expenses: number;
    transactions: number;
  };
  onForceSync: () => Promise<void>;
}

export const DatabaseAccessModal: React.FC<DatabaseAccessModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  counts,
  onForceSync,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const projectId = "elated-pathway-256212";
  const databaseId = "ai-studio-rentreconcileeup-48f3942f-897f-4e2a-9967-35a0ef2f0c96";
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId}/data`;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onForceSync();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Cloud Firestore Database</h2>
              <p className="text-xs text-slate-300">Live storage architecture &amp; management console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700 text-xs">
          {/* Status Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-950 text-sm">
                Dual-Tier Real-Time Persistence Active
              </div>
              <p className="text-emerald-800 leading-relaxed text-xs">
                Every apartment, tenant, bill, expense, and bank account is stored simultaneously in your local browser cache (instant offline load) and pushed to your Google Cloud Firestore database under your secure landlord account.
              </p>
            </div>
          </div>

          {/* Database Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Google Cloud Project
              </span>
              <span className="font-mono font-semibold text-slate-800 text-xs block truncate">
                {projectId}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Firestore Database ID
              </span>
              <span className="font-mono font-semibold text-slate-800 text-xs block truncate" title={databaseId}>
                {databaseId}
              </span>
            </div>
          </div>

          {/* Stored Collections & Live Counts */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Current Cloud Records ({currentUser ? currentUser.email : 'Local Session'})</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.apartments}</span>
                <span className="text-[10px] text-slate-500">Apartments</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.tenants}</span>
                <span className="text-[10px] text-slate-500">Tenants</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.bankAccounts}</span>
                <span className="text-[10px] text-slate-500">Banks</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.bills}</span>
                <span className="text-[10px] text-slate-500">Bills</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.expenses}</span>
                <span className="text-[10px] text-slate-500">Expenses</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-base font-bold text-slate-900 font-mono block">{counts.transactions}</span>
                <span className="text-[10px] text-slate-500">Transactions</span>
              </div>
            </div>
          </div>

          {/* Security & Access details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How your data is secured in Firestore</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Data is stored directly in primary root collections (<code className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">/apartments</code>, <code className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">/tenants</code>, <code className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">/bills</code>, <code className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">/bankAccounts</code>, <code className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">/transactions</code>) so you can view, inspect, edit, or export every single record directly in the Firebase Console!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Open Firebase Database Console</span>
            </a>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : syncSuccess ? 'Cloud In Sync!' : 'Sync All Data Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
