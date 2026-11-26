import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { Bill, BillSplitShare, BankAccount, Apartment, Tenant } from '../types';
import { WhatsAppService, WhatsAppMessageTone, WhatsAppDeepLinkResult } from '../services/whatsappService';

interface WhatsAppDispatchServiceModalProps {
  bills: Bill[];
  shares: BillSplitShare[];
  apartments: Apartment[];
  tenants: Tenant[];
  bankAccounts: BankAccount[];
  initialShareId?: string;
  onClose: () => void;
  onMarkDispatched: (shareId: string) => void;
}

export const WhatsAppDispatchServiceModal: React.FC<WhatsAppDispatchServiceModalProps> = ({
  bills,
  shares,
  apartments,
  tenants,
  bankAccounts,
  initialShareId,
  onClose,
  onMarkDispatched,
}) => {
  const [selectedTone, setSelectedTone] = useState<WhatsAppMessageTone>('standard_breakdown');
  const [customNote, setCustomNote] = useState<string>('');
  const [includeAbsence, setIncludeAbsence] = useState<boolean>(true);
  const [selectedBillFilter, setSelectedBillFilter] = useState<string>('all');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [copiedLinkShareId, setCopiedLinkShareId] = useState<string | null>(null);
  const [activePreviewShareId, setActivePreviewShareId] = useState<string | null>(
    initialShareId || null
  );

  // Generate deep-link payloads for all pending shares
  const allPayloads = useMemo(() => {
    return WhatsAppService.generateOutstandingBatch(
      tenants,
      apartments,
      bills,
      shares,
      bankAccounts,
      {
        tone: selectedTone,
        customNote,
        includeAbsenceDetails: includeAbsence,
      }
    );
  }, [tenants, apartments, bills, shares, bankAccounts, selectedTone, customNote, includeAbsence]);

  // Filter payloads by bill
  const filteredPayloads = useMemo(() => {
    if (selectedBillFilter === 'all') return allPayloads;
    return allPayloads.filter((p) => {
      const share = shares.find((s) => s.id === p.shareId);
      return share?.billId === selectedBillFilter;
    });
  }, [allPayloads, selectedBillFilter, shares]);

  const handleCopyMessage = (payload: WhatsAppDeepLinkResult) => {
    navigator.clipboard.writeText(payload.rawMessage);
    setCopiedShareId(payload.shareId);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  const handleCopyLink = (payload: WhatsAppDeepLinkResult) => {
    navigator.clipboard.writeText(payload.deepLinkUrl);
    setCopiedLinkShareId(payload.shareId);
    setTimeout(() => setCopiedLinkShareId(null), 2000);
  };

  const handleLaunchWhatsApp = (payload: WhatsAppDeepLinkResult) => {
    window.open(payload.deepLinkUrl, '_blank');
    onMarkDispatched(payload.shareId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                WhatsApp Deep-Link Dispatch Service
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates unique, pre-filled WhatsApp links for outstanding utility shares with embedded reference codes.
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

        {/* Global Controls & Customizer Strip */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tone Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Message Tone:</span>
              <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedTone('standard_breakdown')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    selectedTone === 'standard_breakdown'
                      ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standard Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTone('friendly_reminder')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    selectedTone === 'friendly_reminder'
                      ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Friendly Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTone('urgent_notice')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    selectedTone === 'urgent_notice'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Urgent Notice
                </button>
              </div>
            </div>

            {/* Filter by Bill */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter Bill:</span>
              <select
                value={selectedBillFilter}
                onChange={(e) => setSelectedBillFilter(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
              >
                <option value="all">All Pending Bills ({allPayloads.length})</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Landlord Custom Note Input */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
            <span className="text-slate-600 whitespace-nowrap">Add Landlord Note:</span>
            <input
              type="text"
              placeholder="e.g. You can verify meter readings in the hallway cabinet."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
            />
          </div>
        </div>

        {/* Share Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Outstanding Share Targets ({filteredPayloads.length})
            </h3>
            <span className="text-slate-400">
              Unique reference codes embedded in every link
            </span>
          </div>

          {filteredPayloads.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-sm font-semibold text-slate-800">
                All outstanding shares have been settled or dispatched!
              </p>
              <p className="text-xs text-slate-500">
                Departed tenants settled via retained deposit require no communication.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayloads.map((payload) => {
                const share = shares.find((s) => s.id === payload.shareId);
                const bill = bills.find((b) => b.id === share?.billId);
                const apartment = apartments.find((a) => a.id === bill?.apartmentId);
                const isPreviewOpen = activePreviewShareId === payload.shareId;
                const wasSent = Boolean(share?.whatsappSentAt);

                return (
                  <div
                    key={payload.shareId}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {payload.tenantName}
                          </span>
                          <span className="text-xs text-slate-500">
                            · {share?.roomLabel} ({apartment?.unitNumber})
                          </span>
                          {wasSent ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Dispatched: {share?.whatsappSentAt}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Awaiting Dispatch
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span className="font-mono text-slate-700 font-medium flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            {payload.rawPhoneNumber}
                          </span>
                          <span>Bill: <strong>{bill?.title}</strong></span>
                        </div>
                      </div>

                      {/* Share Amount & Reference Token */}
                      <div className="text-right shrink-0">
                        <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          {payload.formattedAmount}
                        </span>
                        <div className="text-[11px] font-mono text-blue-700 font-semibold">
                          Code: {payload.referenceCode}
                        </div>
                      </div>
                    </div>

                    {/* Deep-Link URL Bar */}
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <div className="truncate font-mono text-[11px] text-slate-600 flex-1">
                        <span className="text-slate-400 select-none">URL: </span>
                        {payload.deepLinkUrl}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(payload)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded transition-colors shrink-0 flex items-center gap-1"
                      >
                        {copiedLinkShareId === payload.shareId ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Accordion Toggle for Message Preview */}
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePreviewShareId(isPreviewOpen ? null : payload.shareId)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        {isPreviewOpen ? 'Hide Full Pre-Filled Message' : 'Preview Pre-Filled Message &amp; Text'} &darr;
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(payload)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {copiedShareId === payload.shareId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Text Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLaunchWhatsApp(payload)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Launch WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>
                      </div>
                    </div>

                    {/* Message Preview Drawer */}
                    {isPreviewOpen && (
                      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                        {payload.rawMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Deep-links use universal <code>wa.me/&lt;phone&gt;?text=&lt;encoded&gt;</code> syntax.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close Service Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
