import React, { useState, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Loader2,
  FileCheck2
} from 'lucide-react';
import { Apartment, Tenant, Bill, BillSplitShare } from '../types';
import { calculateProRataDistribution, AbsenceConfig } from '../utils/reconciliationEngine';
import { parseInvoiceFile, ParsedInvoiceResult } from '../utils/pdfInvoiceParser';

interface BillUploadModalProps {
  apartments: Apartment[];
  tenants: Tenant[];
  initialApartmentId?: string;
  onClose: () => void;
  onCreateBillWithShares: (
    bill: Omit<Bill, 'id' | 'createdAt'>,
    shares: Omit<BillSplitShare, 'id'>[]
  ) => void;
}

export const BillUploadModal: React.FC<BillUploadModalProps> = ({
  apartments,
  tenants,
  initialApartmentId,
  onClose,
  onCreateBillWithShares,
}) => {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>(
    initialApartmentId || 'apt_2'
  );
  const [title, setTitle] = useState('Stadtwerke Q1 Electricity');
  const [category, setCategory] = useState<'electricity' | 'water' | 'gas' | 'internet' | 'heating' | 'other'>('electricity');
  const [totalAmount, setTotalAmount] = useState('360.00');
  const [periodStart, setPeriodStart] = useState('2026-01-15');
  const [periodEnd, setPeriodEnd] = useState('2026-04-15');
  const [dueDate, setDueDate] = useState('2026-07-25');
  const [fileName, setFileName] = useState('Stadtwerke_Munich_Strom_Q1_2026.pdf');

  // Parser state
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseFeedback, setParseFeedback] = useState<ParsedInvoiceResult | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Absence date ranges per tenant
  const [absenceMap, setAbsenceMap] = useState<Record<string, AbsenceConfig>>({
    ten_emma: {
      startDate: '2026-03-10',
      endDate: '2026-04-10',
      reason: 'Exchange study trip',
    },
  });

  // Deposit settle choices per tenant
  const [settleDepositMap, setSettleDepositMap] = useState<Record<string, boolean>>({
    ten_julia: true,
  });

  const selectedApartment = apartments.find((a) => a.id === selectedApartmentId) || apartments[0];
  const apartmentTenants = tenants.filter((t) => t.apartmentId === selectedApartment.id);

  // Compute live pro-rata distribution
  const calculatedDistribution = useMemo(() => {
    const amountNum = parseFloat(totalAmount) || 0;
    return calculateProRataDistribution(
      amountNum,
      title || 'Bill',
      periodStart,
      periodEnd,
      apartmentTenants,
      absenceMap,
      []
    );
  }, [totalAmount, title, periodStart, periodEnd, apartmentTenants, absenceMap]);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsParsing(true);
    setParseFeedback(null);

    try {
      const result = await parseInvoiceFile(file);
      setParseFeedback(result);

      if (result.detectedTotalAmount !== null) {
        setTotalAmount(result.detectedTotalAmount.toFixed(2));
      }
      if (result.detectedTitle) {
        setTitle(result.detectedTitle);
      }
      if (result.detectedCategory) {
        setCategory(result.detectedCategory);
      }
      if (result.detectedPeriodStart) {
        setPeriodStart(result.detectedPeriodStart);
      }
      if (result.detectedPeriodEnd) {
        setPeriodEnd(result.detectedPeriodEnd);
      }
      if (result.detectedDueDate) {
        setDueDate(result.detectedDueDate);
      }
    } catch (err) {
      console.error('Invoice file extraction error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectSample = (sampleType: 'electricity' | 'water' | 'internet') => {
    if (sampleType === 'electricity') {
      setTitle('Stadtwerke Q1 Electricity (Quarterly)');
      setCategory('electricity');
      setTotalAmount('360.00');
      setPeriodStart('2026-01-15');
      setPeriodEnd('2026-04-15');
      setDueDate('2026-07-25');
      setFileName('Stadtwerke_Munich_Strom_Q1_2026.pdf');
    } else if (sampleType === 'water') {
      setTitle('Waternet Drinking Water & Sewage');
      setCategory('water');
      setTotalAmount('210.00');
      setPeriodStart('2026-02-01');
      setPeriodEnd('2026-04-30');
      setDueDate('2026-07-30');
      setFileName('Waternet_Amsterdam_Drinkwater_2026.pdf');
    } else {
      setTitle('Vodafone Gigabit Fiber (April)');
      setCategory('internet');
      setTotalAmount('49.99');
      setPeriodStart('2026-04-01');
      setPeriodEnd('2026-04-30');
      setDueDate('2026-05-20');
      setFileName('Vodafone_Fiber_April_2026.pdf');
    }
  };

  const handleToggleAbsence = (tenantId: string) => {
    if (absenceMap[tenantId]?.startDate) {
      // Remove absence
      const updated = { ...absenceMap };
      delete updated[tenantId];
      setAbsenceMap(updated);
    } else {
      // Add default absence window matching middle of period
      setAbsenceMap({
        ...absenceMap,
        [tenantId]: {
          startDate: periodStart,
          endDate: periodEnd,
          reason: 'Away during billing period',
        },
      });
    }
  };

  const handleUpdateAbsenceDate = (
    tenantId: string,
    field: 'startDate' | 'endDate',
    value: string
  ) => {
    setAbsenceMap({
      ...absenceMap,
      [tenantId]: {
        ...absenceMap[tenantId],
        [field]: value,
      },
    });
  };

  const handleToggleDeposit = (tenantId: string) => {
    setSettleDepositMap({
      ...settleDepositMap,
      [tenantId]: !settleDepositMap[tenantId],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(totalAmount) || 0;
    if (amountNum <= 0) return;

    // Generate shares
    const shares: Omit<BillSplitShare, 'id'>[] = calculatedDistribution
      .filter((dist) => !dist.isExcluded)
      .map((dist) => {
        const tenant = dist.tenant;
        const settleFromDeposit = Boolean(settleDepositMap[tenant.id]);
        const depositApplied = settleFromDeposit
          ? Math.min(dist.shareAmount, tenant.retainedDepositBalance || dist.shareAmount)
          : 0;

        return {
          billId: '', // assigned in parent
          tenantId: tenant.id,
          tenantName: tenant.fullName,
          roomLabel: tenant.roomLabel,
          shareAmount: dist.shareAmount,
          totalPeriodDays: dist.totalPeriodDays,
          activeDays: dist.activeDays,
          absenceStartDate: absenceMap[tenant.id]?.startDate || null,
          absenceEndDate: absenceMap[tenant.id]?.endDate || null,
          absenceReason: absenceMap[tenant.id]?.reason,
          settledFromDeposit: settleFromDeposit,
          depositAmountApplied: depositApplied,
          referenceCode: dist.referenceCode,
          status: settleFromDeposit ? 'settled_deposit' : 'pending',
          whatsappSentAt: null,
          settledAt: settleFromDeposit ? new Date().toISOString().split('T')[0] : null,
        };
      });

    onCreateBillWithShares(
      {
        apartmentId: selectedApartmentId,
        title,
        category,
        totalAmount: amountNum,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate,
        pdfFilename: fileName,
        status: 'split_calculated',
      },
      shares
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Upload PDF Utility Bill &amp; Calculate Split
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reads multi-month intervals, resolves historical tenant dates, and calculates pro-rata absence math.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Selector */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Quick Test European Invoices:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectSample('electricity')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-medium"
            >
              Stadtwerke Q1 Electricity (€360)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('water')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-medium"
            >
              Waternet Q1 Water (€210)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('internet')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-medium"
            >
              Vodafone Fiber (€49.99)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Drag-and-drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                : isParsing
                ? 'border-blue-300 bg-blue-50/30 animate-pulse'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              id="pdfUploadInput"
              accept=".pdf, .txt, .json, .csv, image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="pdfUploadInput" className="cursor-pointer block">
              {isParsing ? (
                <div className="py-2 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                  <div className="text-xs font-semibold text-blue-900">
                    Scanning &amp; Decoding Invoice Text Layer...
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Extracting total amount, currency, and billing period dates
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto text-blue-600 mb-1.5" />
                  <div className="text-xs font-semibold text-slate-800">
                    {fileName ? `Uploaded File: ${fileName}` : 'Drop PDF utility invoice here or click to browse'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Supports European Utility PDFs, Invoices, Scans, &amp; Text statements
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Real-Time Extraction Feedback Banner */}
          {parseFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                parseFeedback.detectedTotalAmount !== null
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/90 border-amber-300 text-amber-950'
              }`}
            >
              {parseFeedback.detectedTotalAmount !== null ? (
                <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {parseFeedback.detectedTotalAmount !== null
                      ? `Extracted Invoice Total: €${parseFeedback.detectedTotalAmount.toFixed(2)}`
                      : 'File Decoded (Manual Amount Check)'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-current font-semibold">
                    Confidence: {parseFeedback.confidenceScore}%
                  </span>
                </div>

                <p className="text-[11px] opacity-90 leading-relaxed">
                  {parseFeedback.detectedTotalAmount !== null ? (
                    <>
                      Detected <strong>{parseFeedback.detectedTitle}</strong> ({parseFeedback.detectedCategory}) from <code>{parseFeedback.fileName}</code>. 
                      {parseFeedback.extractionDetails.amountSource && ` (${parseFeedback.extractionDetails.amountSource})`}
                      {parseFeedback.detectedPeriodStart && parseFeedback.detectedPeriodEnd && ` Billing period set to ${parseFeedback.detectedPeriodStart} → ${parseFeedback.detectedPeriodEnd}.`}
                    </>
                  ) : (
                    <>
                      Text layer was scanned. No explicit Euro total was detected with certainty. The form fields below have been left editable so you can enter or confirm the invoice amount.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Form Fields: Apartment & Bill Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Apartment Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign to Apartment
              </label>
              <select
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white"
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.unitNumber} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bill Title */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bill Title / Provider
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                placeholder="e.g. Stadtwerke Electricity"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Invoice Amount (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Billing Period (Crucial for 2-3 month lag matching) */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Multi-Month Billing Period (Historical Resolution)
              </span>
              <span className="text-[11px] text-blue-700">
                Matches who resided during this specific interval
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Period Start</label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Period End</label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Live Calculated Roommate Splits with Pro-Rata & Absence Controls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Roommate Occupancy &amp; Pro-Rata Split Calculation
              </h3>
              <span className="text-[11px] text-slate-500">
                Sum: €{calculatedDistribution.reduce((s, r) => s + r.shareAmount, 0).toFixed(2)} / €{parseFloat(totalAmount || '0').toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {calculatedDistribution.map((dist) => {
                const tenant = dist.tenant;
                const hasAbsence = Boolean(absenceMap[tenant.id]?.startDate);
                const isDeparted = !tenant.isActive;
                const settleDeposit = Boolean(settleDepositMap[tenant.id]);

                return (
                  <div
                    key={tenant.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      dist.isExcluded
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {tenant.fullName}
                          <span className="text-slate-500 font-normal">({tenant.roomLabel})</span>
                          {isDeparted && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                              Moved out {tenant.leaseEndDate}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {dist.isExcluded ? (
                            <span className="text-rose-600 font-medium">
                              Excluded: {dist.exclusionReason}
                            </span>
                          ) : (
                            <span>
                              Active: <strong>{dist.activeDays}</strong> of {dist.totalPeriodDays} days ({dist.percentage}% share)
                              {hasAbsence && (
                                <span className="text-blue-700 font-medium ml-1">
                                  · {dist.absentDays} days away
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Share Amount & Reference */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                          €{dist.shareAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Ref: {dist.referenceCode}
                        </div>
                      </div>
                    </div>

                    {/* Absence Date Controls & Deposit Settling for Eligible Tenants */}
                    {!dist.isExcluded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        {/* Absence Toggle & Interval Inputs */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAbsence(tenant.id)}
                            className={`px-2 py-0.5 rounded font-medium transition-colors ${
                              hasAbsence
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {hasAbsence ? 'Custom Absence Active' : '+ Specify Travel/Absence'}
                          </button>

                          {hasAbsence && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">From:</span>
                              <input
                                type="date"
                                value={absenceMap[tenant.id]?.startDate || periodStart}
                                onChange={(e) =>
                                  handleUpdateAbsenceDate(tenant.id, 'startDate', e.target.value)
                                }
                                className="px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[10px]"
                              />
                              <span className="text-slate-400">To:</span>
                              <input
                                type="date"
                                value={absenceMap[tenant.id]?.endDate || periodEnd}
                                onChange={(e) =>
                                  handleUpdateAbsenceDate(tenant.id, 'endDate', e.target.value)
                                }
                                className="px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[10px]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Deposit Deduction / Zero-Communication Option (especially for Julia) */}
                        {tenant.retainedDepositBalance > 0 && (
                          <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 font-medium">
                            <input
                              type="checkbox"
                              checked={settleDeposit}
                              onChange={() => handleToggleDeposit(tenant.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>
                              Settle from Deposit (€{tenant.retainedDepositBalance.toFixed(2)} held) — No WhatsApp
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Bill &amp; Generate WhatsApp Links
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
