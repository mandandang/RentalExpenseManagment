import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  UserCheck, 
  Search, 
  Landmark,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BankTransaction, Tenant, BillSplitShare, BankAccount } from '../types';

interface ReconciliationViewProps {
  transactions: BankTransaction[];
  tenants: Tenant[];
  shares: BillSplitShare[];
  bankAccounts: BankAccount[];
  onApproveMatch: (transactionId: string, entityType: 'rent' | 'bill_share', entityId: string, description: string) => void;
  onIgnoreTransaction: (transactionId: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  transactions,
  tenants,
  shares,
  bankAccounts,
  onApproveMatch,
  onIgnoreTransaction,
}) => {
  const [activeFilter, setActiveFilter] = useState<'review' | 'matched' | 'all'>('review');
  const [manualSelectTenantId, setManualSelectTenantId] = useState<Record<string, string>>({});

  const unmatchedTransactions = transactions.filter((t) => t.reconciliationStatus === 'unmatched');
  const matchedTransactions = transactions.filter((t) => t.reconciliationStatus === 'matched');

  const handleApproveSuggested = (tx: BankTransaction) => {
    if (tx.matchedEntityType && tx.matchedEntityId) {
      onApproveMatch(
        tx.id,
        tx.matchedEntityType,
        tx.matchedEntityId,
        tx.matchedDescription || 'Manual Approval'
      );
    } else {
      // Fallback: match by tenant selection
      const tenantId = manualSelectTenantId[tx.id] || tenants[0].id;
      const tenant = tenants.find((t) => t.id === tenantId);
      onApproveMatch(
        tx.id,
        'rent',
        tenantId,
        `Approved Rent Payment for ${tenant?.fullName} (€${tx.amount.toFixed(2)})`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            Automatic Reconciliation &amp; Audit Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parses transaction remittance notes, counterparty names, and custom amounts across ING &amp; Revolut accounts.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('review')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeFilter === 'review'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Needs Review ({unmatchedTransactions.length})
          </button>
          <button
            onClick={() => setActiveFilter('matched')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeFilter === 'matched'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Matched Ledger ({matchedTransactions.length})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Feeds ({transactions.length})
          </button>
        </div>
      </div>

      {/* 3-Tier Rule Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">1</span>
            Exact Reference Token (100% Match)
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Scans payment text for unique reference codes (e.g. <code>RF-A2-ELEC-MATTEO</code>). Instantly reconciles.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">2</span>
            Custom Rent &amp; Counterparty Name (95–99%)
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Matches sender name + exact individualized rent amount (e.g. €650, €580, €540) to tenant profile.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[11px]">3</span>
            Heuristic &amp; Exception Queue
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Flags third-party/parent senders (e.g. Hans Meyer paying for Lucas) for 1-click landlord approval.
          </p>
        </div>
      </div>

      {/* Main Review Section */}
      {(activeFilter === 'review' || activeFilter === 'all') && unmatchedTransactions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Incoming Transactions Awaiting Landlord Approval ({unmatchedTransactions.length})
            </h2>
            <span className="text-xs text-slate-500">
              One-click confirmation matches payment to tenant ledger
            </span>
          </div>

          <div className="space-y-3">
            {unmatchedTransactions.map((tx) => {
              const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);

              return (
                <div
                  key={tx.id}
                  className="p-5 bg-white rounded-xl border-2 border-amber-300 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono">
                          {bank?.institutionName}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {tx.counterpartyName}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">({tx.bookingDate})</span>
                      </div>

                      <div className="mt-2 text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <span className="font-semibold text-amber-900 block mb-0.5">
                          Remittance Message:
                        </span>
                        <code className="text-slate-900 font-mono">{tx.remittanceInformation}</code>
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        <strong>Engine Analysis:</strong> {tx.matchReason}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                        +€{tx.amount.toFixed(2)}
                      </span>
                      <div className="text-xs text-amber-700 font-semibold mt-1">
                        Confidence: {tx.matchConfidence}%
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Landlord Action */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Assign To:</span>
                      <select
                        value={manualSelectTenantId[tx.id] || tx.matchedEntityId || tenants[0].id}
                        onChange={(e) =>
                          setManualSelectTenantId({
                            ...manualSelectTenantId,
                            [tx.id]: e.target.value,
                          })
                        }
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium"
                      >
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.roomLabel} - Rent: €{t.monthlyRent.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onIgnoreTransaction(tx.id)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Ignore (Personal Transfer)
                      </button>
                      <button
                        onClick={() => handleApproveSuggested(tx)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Confirm &amp; Reconcile Payment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matched Transactions Ledger */}
      {(activeFilter === 'matched' || activeFilter === 'all') && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Automated Reconciliation Ledger ({matchedTransactions.length})
              </h2>
              <p className="text-xs text-slate-500">
                Verified payments matched with confidence &gt; 90%
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              100% Audit Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Bank</th>
                  <th className="py-2.5 px-3">Sender &amp; Remittance Note</th>
                  <th className="py-2.5 px-3">Reconciled To</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchedTransactions.map((tx) => {
                  const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {tx.bookingDate}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            bank?.institutionName === 'ING'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {bank?.institutionName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{tx.counterpartyName}</div>
                        <div className="font-mono text-[11px] text-slate-500 max-w-sm truncate">
                          {tx.remittanceInformation}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {tx.matchedDescription}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          {tx.matchReason}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        +€{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {tx.matchConfidence}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
