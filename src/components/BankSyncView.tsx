import React, { useState } from 'react';
import { 
  Landmark, 
  RefreshCw, 
  ShieldCheck, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Plus, 
  HelpCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { BankAccount, BankTransaction } from '../types';
import { EditBankAccountModal } from './EditBankAccountModal';

interface BankSyncViewProps {
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  onSyncAccounts: () => void;
  onSimulateIncomingPayment: (preset: 'ref_token' | 'rent_name' | 'parent_transfer') => void;
  onNavigateToReconcile: () => void;
  onOpenSecurityGuide: () => void;
  onUpdateBankAccount: (updated: BankAccount) => void;
  onAddBankAccount: (newAcc: BankAccount) => void;
}

export const BankSyncView: React.FC<BankSyncViewProps> = ({
  bankAccounts,
  transactions,
  onSyncAccounts,
  onSimulateIncomingPayment,
  onNavigateToReconcile,
  onOpenSecurityGuide,
  onUpdateBankAccount,
  onAddBankAccount,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  
  // Bank Account Edit Modal state
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleOpenEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setIsEditModalOpen(true);
  };

  const handleSaveAccount = (account: BankAccount) => {
    if (editingAccount) {
      onUpdateBankAccount(account);
    } else {
      onAddBankAccount(account);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onSyncAccounts();
      setIsSyncing(false);
    }, 1200);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (selectedBankFilter !== 'all' && t.bankAccountId !== selectedBankFilter) return false;
    if (selectedStatusFilter !== 'all' && t.reconciliationStatus !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Sync Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            European Bank Accounts (ING &amp; Revolut)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connected via regulated PSD2 Open Banking (AISP Read-Only). Protected by European RTS standards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenAdd}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Bank Account</span>
          </button>

          <button
            onClick={onOpenSecurityGuide}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security &amp; Rate Limits
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Feeds...' : 'Sync Feeds Now'}</span>
          </button>
        </div>
      </div>

      {/* PSD2 Rate Limit & Safety Explanation Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="leading-relaxed">
            <strong>Read-Only Bank Security Guaranteed:</strong> Under European PSD2 regulations, the app holds strictly read-only Account Information (`AISP`) permissions. <strong>It cannot initiate wire transfers, withdraw money, or alter accounts.</strong>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
          RTS 4 Syncs/Day Compliant
        </span>
      </div>

      {/* Bank Account Overview Cards (ING & Revolut) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankAccounts.map((account) => {
          const isING = account.institutionName === 'ING';
          const aptCount = account.id === 'acc_ing_eur' ? 2 : 1;

          return (
            <div
              key={account.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs ${
                      isING ? 'bg-[#FF6200]' : 'bg-[#0075EB]'
                    }`}
                  >
                    {isING ? 'ING' : 'R'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{account.accountName}</h3>
                    <p className="text-xs font-mono text-slate-500 tabular-nums">{account.iban}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                  <button
                    onClick={() => handleOpenEdit(account)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                    title="Edit Bank Account Information"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Available Balance</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    €{account.balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Routing for {aptCount} apartment {aptCount === 1 ? 'unit' : 'units'}</span>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">BIC: {account.bic}</div>
                </div>
              </div>

              {/* Actions & PSD2 Consent Tracker */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  PSD2 Consent: {account.consentExpiresAt}
                </span>
                <button
                  onClick={() => handleOpenEdit(account)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Account Info</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Tools: Test Real-Time Reconciliation */}
      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold">Simulate Incoming Bank Feed Credits</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click to test how the engine parses remittance notes &amp; counterparties
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => onSimulateIncomingPayment('ref_token')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors border border-slate-700"
          >
            <div className="font-semibold text-blue-300">1. Bill Share with Reference Token</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Liam sends €98.48 citing `RF-A2-ELEC-LIAM` &rarr; Auto-matched!
            </div>
          </button>

          <button
            onClick={() => onSimulateIncomingPayment('rent_name')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors border border-slate-700"
          >
            <div className="font-semibold text-emerald-300">2. Rent Match via Custom Amount</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Emma sends €540.00 with "Miete Flat 3B" &rarr; Auto-matched!
            </div>
          </button>

          <button
            onClick={() => onSimulateIncomingPayment('parent_transfer')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors border border-slate-700"
          >
            <div className="font-semibold text-amber-300">3. Parent / 3rd Party Payment</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Parent sends €1,450 &rarr; Queued in review queue!
            </div>
          </button>
        </div>
      </div>

      {/* Transaction Feed Ledger */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Live Bank Transactions ({filteredTransactions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Transactions ingested via ING &amp; Revolut Open Banking feeds
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedBankFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedBankFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All Banks
              </button>
              <button
                onClick={() => setSelectedBankFilter('acc_ing_eur')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedBankFilter === 'acc_ing_eur' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ING
              </button>
              <button
                onClick={() => setSelectedBankFilter('acc_revolut_eur')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedBankFilter === 'acc_revolut_eur' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Revolut
              </button>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All States
              </button>
              <button
                onClick={() => setSelectedStatusFilter('matched')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedStatusFilter === 'matched' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Matched
              </button>
              <button
                onClick={() => setSelectedStatusFilter('unmatched')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedStatusFilter === 'unmatched' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Bank</th>
                <th className="py-2.5 px-3">Sender / Counterparty</th>
                <th className="py-2.5 px-3">Remittance Note (Message)</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);
                const isMatched = tx.reconciliationStatus === 'matched';

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
                    <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {tx.counterpartyName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {tx.remittanceInformation}
                      </span>
                      {tx.matchReason && (
                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          {tx.matchReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      +€{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Matched ({tx.matchConfidence}%)
                        </span>
                      ) : (
                        <button
                          onClick={onNavigateToReconcile}
                          className="inline-flex items-center gap-1 text-amber-800 font-semibold text-[11px] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Review ({tx.matchConfidence}%)
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Bank Account Modal */}
      <EditBankAccountModal
        isOpen={isEditModalOpen}
        account={editingAccount}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
};
