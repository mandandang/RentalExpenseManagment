import React from 'react';
import { 
  Building2, 
  Users, 
  Receipt, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Landmark, 
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Apartment, Tenant, Bill, BillSplitShare, BankAccount, BankTransaction, LandlordExpense } from '../types';
import { getDaysUntil } from './LandlordExpensesSection';

interface DashboardOverviewProps {
  apartments: Apartment[];
  tenants: Tenant[];
  bills: Bill[];
  shares: BillSplitShare[];
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  landlordExpenses?: LandlordExpense[];
  onMarkExpensePaid?: (expenseId: string) => void;
  onNavigateTab: (tab: 'overview' | 'apartments' | 'bills' | 'banks' | 'reconciliation') => void;
  onOpenUpload: () => void;
  onOpenSecurityGuide: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  apartments,
  tenants,
  bills,
  shares,
  bankAccounts,
  transactions,
  landlordExpenses = [],
  onMarkExpensePaid,
  onNavigateTab,
  onOpenUpload,
  onOpenSecurityGuide,
}) => {
  // Aggregate calculations
  const totalRentRoll = tenants
    .filter((t) => t.isActive)
    .reduce((sum, t) => sum + t.monthlyRent, 0);

  const pendingShares = shares.filter((s) => s.status === 'pending');
  const pendingSharesTotal = pendingShares.reduce((sum, s) => sum + s.shareAmount, 0);

  const matchedCount = transactions.filter((t) => t.reconciliationStatus === 'matched').length;
  const reviewCount = transactions.filter((t) => t.reconciliationStatus === 'unmatched').length;

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Review Reminder */}
      {reviewCount > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                {reviewCount} Incoming Bank Transaction Requires Landlord Review
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Hans Meyer sent €1,450.00 mentioning "Huur Prinsengracht voor Lucas Meyer".
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reconciliation')}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Review &amp; Approve
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Monthly Rent */}
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Rent Roll</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              €{totalRentRoll.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across 3 units · {tenants.filter((t) => t.isActive).length} active tenants
          </div>
        </div>

        {/* Pending Utility Dues */}
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Bill Splits</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              €{pendingSharesTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {pendingShares.length} shares awaiting roommate transfer
          </div>
        </div>

        {/* Reconciled Payments */}
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bank Reconciliation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {matchedCount} / {transactions.length}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Matched via name, amount &amp; ref note
          </div>
        </div>

        {/* Bank Liquidity & PSD2 Status */}
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Connected Accounts</span>
            <Landmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              €{totalBankBalance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ING &amp; Revolut Active (PSD2)
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Apartments Status & Bank Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 3 Apartments Breakdown & Owner Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Landlord Obligations Banner / Widget */}
          {landlordExpenses.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Upcoming Owner Obligations &amp; Deadlines
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mortgage installments, bi-monthly building fees &amp; property dues (not billed to tenants)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('apartments')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Schedule &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[...landlordExpenses]
                  .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                  .slice(0, 4)
                  .map((exp) => {
                    const apt = apartments.find((a) => a.id === exp.apartmentId);
                    const countdown = getDaysUntil(exp.nextDueDate);

                    return (
                      <div
                        key={exp.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                              {apt?.unitNumber || 'Unit'} · {apt?.name || 'Property'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                              {exp.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 block">
                              {exp.frequency === 'every_2_months' ? 'Every 2 months' : exp.frequency === 'monthly' ? 'Monthly' : exp.frequency} · Due day {exp.dueDay}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold font-mono text-slate-900 tabular-nums block">
                              €{exp.amount.toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                                countdown.isOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : countdown.days <= 7
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {countdown.label}
                            </span>
                          </div>
                        </div>

                        {onMarkExpensePaid && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">
                              {new Date(exp.nextDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                            <button
                              onClick={() => onMarkExpensePaid(exp.id)}
                              className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded font-semibold text-[10px] transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Mark Paid
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-display">
                Property Portfolio &amp; Roommate Units
              </h2>
              <p className="text-xs text-slate-500">
                Individual tenant rent schedules, deposit reserves, and historical residency
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('apartments')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Manage Units
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {apartments.map((apt) => {
              const aptTenants = tenants.filter((t) => t.apartmentId === apt.id);
              const activeTenants = aptTenants.filter((t) => t.isActive);
              const departedTenants = aptTenants.filter((t) => !t.isActive);
              const aptRent = activeTenants.reduce((s, t) => s + t.monthlyRent, 0);
              const assignedBank = bankAccounts.find((b) => b.id === apt.targetBankAccountId);

              return (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                        {apt.unitNumber.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{apt.name}</h3>
                        <p className="text-xs text-slate-500">
                          {apt.address}, {apt.city} · Assigned to {assignedBank?.institutionName} ({assignedBank?.accountName})
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-xs text-slate-400 block sm:inline mr-2">Monthly Rent:</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                        €{aptRent.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Roommates / Tenants mini-list */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-slate-600 mb-2">
                      Occupants ({activeTenants.length} Active{departedTenants.length > 0 ? `, ${departedTenants.length} Past with Retained Deposit` : ''}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aptTenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            tenant.isActive
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-amber-50/40 border-amber-200/60'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {tenant.fullName}
                              {!tenant.isActive && (
                                <span className="text-[10px] text-amber-700 font-normal">
                                  (Departed Apr 30)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {tenant.roomLabel}
                              {tenant.retainedDepositBalance > 0 && (
                                <span className="text-emerald-700 font-medium ml-1">
                                  · Deposit: €{tenant.retainedDepositBalance.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-800 tabular-nums">
                              €{tenant.monthlyRent.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/month</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contextual actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {apt.id === 'apt_2'
                        ? 'Includes 4-way split logic for electricity & water'
                        : 'Single lease direct bank reconciliation'}
                    </span>
                    <button
                      onClick={() => onNavigateTab('bills')}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Assign Bill to {apt.unitNumber} &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bank PSD2 Health & Quick Tools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 font-display">
              Open Banking (PSD2)
            </h2>
            <button
              onClick={() => onNavigateTab('banks')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Feeds
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Connected Bank Accounts */}
          <div className="space-y-3">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                        acc.institutionName === 'ING' ? 'bg-[#FF6200]' : 'bg-[#0075EB]'
                      }`}
                    >
                      {acc.institutionName === 'ING' ? 'ING' : 'R'}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{acc.accountName}</h4>
                      <p className="text-[11px] font-mono text-slate-500 tabular-nums">{acc.iban}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    €{acc.balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Read-Only AISP
                  </span>
                  <span>Consent: {acc.consentExpiresAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Practical Guide & Security Highlights Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold">Bank Compliance &amp; Limits</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under European PSD2 RTS regulations, banks allow 4 background syncs per day. 
              Your accounts are protected by read-only AISP scope: <strong>no money can ever be moved or withdrawn</strong>.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">GoCardless Free Tier</span>
              <button
                onClick={onOpenSecurityGuide}
                className="text-xs font-medium text-blue-300 hover:text-white underline underline-offset-2"
              >
                Read Full Technical Specs &rarr;
              </button>
            </div>
          </div>

          {/* Quick Action Button Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900">Quick Actions</h4>
            <button
              onClick={onOpenUpload}
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Upload PDF Utility Bill
            </button>
            <button
              onClick={() => onNavigateTab('bills')}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <Receipt className="w-4 h-4" />
              Calculate Retroactive Pro-Rata Split
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
