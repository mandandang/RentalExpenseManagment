import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Landmark, 
  Building2, 
  Check, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Tenant, Apartment, BankAccount } from '../types';

interface EditTenantModalProps {
  tenant: Tenant | null;
  apartments: Apartment[];
  bankAccounts: BankAccount[];
  isOpen: boolean;
  onClose: () => void;
  onSaveTenant: (updatedTenant: Tenant) => void;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({
  tenant,
  apartments,
  bankAccounts,
  isOpen,
  onClose,
  onSaveTenant,
}) => {
  if (!isOpen || !tenant) return null;

  const [fullName, setFullName] = useState<string>(tenant.fullName);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(tenant.whatsappNumber);
  const [email, setEmail] = useState<string>(tenant.email);
  const [apartmentId, setApartmentId] = useState<string>(tenant.apartmentId);
  const [roomLabel, setRoomLabel] = useState<string>(tenant.roomLabel);
  const [monthlyRent, setMonthlyRent] = useState<number>(tenant.monthlyRent);
  const [rentDueDay, setRentDueDay] = useState<number>(tenant.rentDueDay || 1);
  const [leaseStartDate, setLeaseStartDate] = useState<string>(tenant.leaseStartDate || '');
  const [leaseEndDate, setLeaseEndDate] = useState<string>(tenant.leaseEndDate || '');
  const [retainedDepositBalance, setRetainedDepositBalance] = useState<number>(tenant.retainedDepositBalance || 0);
  const [targetBankAccountId, setTargetBankAccountId] = useState<string>(
    tenant.targetBankAccountId || bankAccounts[0]?.id || 'acc_ing_eur'
  );
  const [isActive, setIsActive] = useState<boolean>(tenant.isActive);
  const [notes, setNotes] = useState<string>(tenant.notes || '');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Tenant full name is required.');
      return;
    }
    if (!leaseStartDate) {
      setFormError('Lease start date is required.');
      return;
    }
    if (monthlyRent <= 0) {
      setFormError('Monthly rent must be greater than €0.');
      return;
    }

    const updated: Tenant = {
      ...tenant,
      fullName: fullName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      apartmentId,
      roomLabel: roomLabel.trim() || 'Room',
      monthlyRent: Number(monthlyRent),
      rentDueDay: Number(rentDueDay),
      leaseStartDate,
      leaseEndDate: leaseEndDate ? leaseEndDate : null,
      retainedDepositBalance: Number(retainedDepositBalance),
      targetBankAccountId,
      isActive,
      notes: notes.trim(),
    };

    onSaveTenant(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Tenant Profile &amp; Lease</h2>
              <p className="text-xs text-slate-300">
                Update personal contact details, room allocation, and lease timeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-700 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Room Move / Transfer Notice */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2.5 text-slate-700 text-[11px]">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Room Transfer or Lease Rollover:</strong> If the tenant moves to another room or property, select the new apartment, update the <strong>Room Label</strong>, and set the new <strong>Lease Start Date</strong>. Historical utility splits will calculate accurately.
            </p>
          </div>

          {/* Section 1: Identity & Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Personal Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Julia Weber"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +49 170 1234567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Property & Room Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Property &amp; Room Assignment</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Apartment / Building</label>
                <select
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                >
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} ({apt.unitNumber}) · {apt.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Unit Designation</label>
                <input
                  type="text"
                  value={roomLabel}
                  onChange={(e) => setRoomLabel(e.target.value)}
                  placeholder="e.g. Room 1 (Master) or Studio Flat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Lease Dates */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Financial Rent &amp; Lease Dates</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (€) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rent Due Day</label>
                <select
                  value={rentDueDay}
                  onChange={(e) => setRentDueDay(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}st/th of every month
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Retained Deposit (€)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={retainedDepositBalance}
                    onChange={(e) => setRetainedDepositBalance(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lease Start Date *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lease End Date (Optional / Move-Out)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Target Bank Selection for this tenant */}
            <div className="pt-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Designated Payment Destination Bank
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bankAccounts.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      targetBankAccountId === b.id
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bankAccount"
                      value={b.id}
                      checked={targetBankAccountId === b.id}
                      onChange={() => setTargetBankAccountId(b.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-left leading-tight truncate">
                      <span className="font-bold text-xs block">{b.institutionName} ({b.accountName})</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{b.iban}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Resident Status Toggle */}
            <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="font-semibold text-slate-900 block">Active Resident Status</span>
                <span className="text-[11px] text-slate-500">
                  {isActive ? 'Currently occupying the room and included in active splits' : 'Moved out / archived in historical ledger'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {isActive ? 'Active Resident' : 'Moved Out / Inactive'}
              </button>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes / Room Transfer Log</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Swapped to Room 1 on Oct 1. Retained deposit holds €50 for Q1 electricity settlement."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Tenant Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
