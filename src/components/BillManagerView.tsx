import React, { useState } from 'react';
import { 
  Receipt, 
  FileText, 
  Send, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Plus, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Bill, BillSplitShare, Apartment, Tenant, BankAccount } from '../types';
import { formatWhatsAppMessage, createWhatsAppUrl } from '../utils/whatsappGenerator';

interface BillManagerViewProps {
  bills: Bill[];
  shares: BillSplitShare[];
  apartments: Apartment[];
  tenants: Tenant[];
  bankAccounts: BankAccount[];
  onOpenUpload: () => void;
  onOpenWhatsAppService: (shareId?: string) => void;
  onMarkSharePaid: (shareId: string) => void;
  onSettleShareFromDeposit: (shareId: string, depositAmount: number) => void;
}

export const BillManagerView: React.FC<BillManagerViewProps> = ({
  bills,
  shares,
  apartments,
  tenants,
  bankAccounts,
  onOpenUpload,
  onOpenWhatsAppService,
  onMarkSharePaid,
  onSettleShareFromDeposit,
}) => {
  const [selectedApartmentFilter, setSelectedApartmentFilter] = useState<string>('all');
  const [selectedBillId, setSelectedBillId] = useState<string>(bills[0]?.id || '');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const filteredBills = bills.filter((b) =>
    selectedApartmentFilter === 'all' ? true : b.apartmentId === selectedApartmentFilter
  );

  const activeBill = bills.find((b) => b.id === selectedBillId) || filteredBills[0] || bills[0];
  const activeApartment = apartments.find((a) => a.id === activeBill?.apartmentId);
  const activeBank = bankAccounts.find((b) => b.id === activeApartment?.targetBankAccountId);
  const billShares = shares.filter((s) => s.billId === activeBill?.id);

  const handleCopyMessage = (share: BillSplitShare) => {
    if (!activeApartment || !activeBill) return;
    const shareTenant = tenants.find((t) => t.id === share.tenantId);
    const targetBankId = shareTenant?.targetBankAccountId || activeApartment.targetBankAccountId;
    const targetBank = bankAccounts.find((b) => b.id === targetBankId) || activeBank || bankAccounts[0];
    const msg = formatWhatsAppMessage(share.tenantName, activeApartment, activeBill, share, targetBank);
    navigator.clipboard.writeText(msg);
    setCopiedShareId(share.id);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  const handleOpenWhatsApp = (share: BillSplitShare) => {
    onOpenWhatsAppService(share.id);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            PDF Utility Bills &amp; Roommate Split Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest invoices arriving 2–3 months delayed, match historical tenancy dates, and dispatch WhatsApp payment links.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenWhatsAppService()}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            WhatsApp Dispatch Service
          </button>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload New PDF Bill
          </button>
        </div>
      </div>

      {/* Filter Tabs for Apartments */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setSelectedApartmentFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            selectedApartmentFilter === 'all'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Invoices ({bills.length})
        </button>
        {apartments.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedApartmentFilter(a.id)}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedApartmentFilter === a.id
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {a.unitNumber} ({bills.filter((b) => b.apartmentId === a.id).length})
          </button>
        ))}
      </div>

      {/* 2-Column Split: Bill List on Left, Active Bill Detailed Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bill Selection List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recorded Invoices
          </h3>

          <div className="space-y-2">
            {filteredBills.map((bill) => {
              const apt = apartments.find((a) => a.id === bill.apartmentId);
              const bShares = shares.filter((s) => s.billId === bill.id);
              const settledCount = bShares.filter(
                (s) => s.status === 'paid' || s.status === 'settled_deposit'
              ).length;
              const isSelected = bill.id === activeBill?.id;

              return (
                <button
                  key={bill.id}
                  onClick={() => setSelectedBillId(bill.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 font-mono">
                      {apt?.unitNumber}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      €{bill.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 mt-1">{bill.title}</h4>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Period: {bill.billingPeriodStart} → {bill.billingPeriodEnd}
                    </span>
                    <span
                      className={`font-semibold ${
                        settledCount === bShares.length && bShares.length > 0
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {settledCount}/{bShares.length} Settled
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Bill Detailed Breakdown, Pro-Rata Math & WhatsApp Dispatch */}
        {activeBill ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
              {/* Active Bill Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 font-display">
                      {activeBill.title}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                      €{activeBill.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeApartment?.name} ({activeApartment?.unitNumber}) · Bank: {activeBank?.institutionName} ({activeBank?.iban})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate max-w-[150px]">{activeBill.pdfFilename}</span>
                  </div>
                </div>
              </div>

              {/* Interval & Delayed Billing Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block text-[11px]">Invoice Date:</span>
                  <span className="font-mono font-semibold text-slate-800">{activeBill.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Billing Period:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {activeBill.billingPeriodStart} to {activeBill.billingPeriodEnd}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Payment Due:</span>
                  <span className="font-mono font-semibold text-slate-800">{activeBill.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Collection Status:</span>
                  <span className="font-semibold text-blue-700 capitalize">
                    {activeBill.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Roommate Shares Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Roommate Pro-Rata Allocations &amp; WhatsApp Dispatch
                  </h3>
                  <span className="text-xs text-slate-400">
                    Calculated by active days in billing period
                  </span>
                </div>

                <div className="space-y-2.5">
                  {billShares.map((share) => {
                    const tenant = tenants.find((t) => t.id === share.tenantId);
                    const isSettled = share.status === 'paid' || share.status === 'settled_deposit';
                    const hasAbsence = share.activeDays < share.totalPeriodDays;
                    const isCopied = copiedShareId === share.id;

                    return (
                      <div
                        key={share.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          isSettled
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {share.tenantName}
                              </span>
                              <span className="text-xs text-slate-500">
                                · {share.roomLabel}
                              </span>
                              {(() => {
                                const tBankId = tenant?.targetBankAccountId || activeApartment?.targetBankAccountId;
                                const bank = bankAccounts.find((b) => b.id === tBankId);
                                return bank ? (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                                    bank.institutionName === 'ING' ? 'bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20' : 'bg-[#0075EB]/10 text-[#0075EB] border border-[#0075EB]/20'
                                  }`}>
                                    Pays to {bank.institutionName}
                                  </span>
                                ) : null;
                              })()}
                              {share.settledFromDeposit && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Settled from Retained Deposit (€{share.depositAmountApplied.toFixed(2)})
                                </span>
                              )}
                              {share.status === 'paid' && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Reconciled via Bank Feed
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                              <span>
                                Active days: <strong>{share.activeDays}</strong> of {share.totalPeriodDays} days
                              </span>
                              {hasAbsence && (
                                <span className="text-blue-700 font-medium">
                                  ({share.totalPeriodDays - share.activeDays} days absent accounted for)
                                </span>
                              )}
                              <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                Ref: {share.referenceCode}
                              </span>
                            </div>
                          </div>

                          {/* Share Amount */}
                          <div className="text-right shrink-0">
                            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                              €{share.shareAmount.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {Math.round((share.shareAmount / activeBill.totalAmount) * 100)}% of total
                            </span>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            {/* WhatsApp Button */}
                            {!share.settledFromDeposit && (
                              <button
                                onClick={() => handleOpenWhatsApp(share)}
                                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                                  share.status === 'paid'
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send WhatsApp</span>
                              </button>
                            )}

                            {/* Copy Message Text */}
                            {!share.settledFromDeposit && (
                              <button
                                onClick={() => handleCopyMessage(share)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Breakdown</span>
                                  </>
                                )}
                              </button>
                            )}

                            {share.settledFromDeposit && (
                              <span className="text-xs text-slate-500 italic">
                                WhatsApp suppressed: fully deducted from retained security advance.
                              </span>
                            )}
                          </div>

                          {/* Settle / Mark Actions */}
                          <div className="flex items-center gap-2">
                            {!isSettled && tenant && tenant.retainedDepositBalance > 0 && (
                              <button
                                onClick={() =>
                                  onSettleShareFromDeposit(
                                    share.id,
                                    Math.min(share.shareAmount, tenant.retainedDepositBalance)
                                  )
                                }
                                className="px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium"
                              >
                                Settle with Deposit (€{tenant.retainedDepositBalance.toFixed(2)})
                              </button>
                            )}

                            {!isSettled && (
                              <button
                                onClick={() => onMarkSharePaid(share.id)}
                                className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium"
                              >
                                Mark Paid Manually
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-8 bg-white rounded-xl border border-slate-200 text-center">
            <Receipt className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 font-medium">No utility bills found</p>
            <button
              onClick={onOpenUpload}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Upload First Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
