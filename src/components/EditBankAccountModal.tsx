import React, { useState } from 'react';
import { 
  X, 
  Landmark, 
  Check, 
  AlertCircle, 
  Eye, 
  Sparkles, 
  CreditCard,
  MessageSquare,
  Building,
  RefreshCw
} from 'lucide-react';
import { BankAccount } from '../types';

interface EditBankAccountModalProps {
  account: BankAccount | null; // null if creating a new account
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAccount: BankAccount) => void;
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!account;

  const [institutionName, setInstitutionName] = useState<'ING' | 'Revolut'>(
    account ? account.institutionName : 'Revolut'
  );
  const [accountName, setAccountName] = useState<string>(
    account ? account.accountName : 'Mandana Hashemi (Rental Account)'
  );
  const [iban, setIban] = useState<string>(
    account ? account.iban : 'NL91 INGB 0417 8829 10'
  );
  const [bic, setBic] = useState<string>(
    account ? account.bic : (institutionName === 'ING' ? 'INGBNL2A' : 'REVOLT21')
  );
  const [currency, setCurrency] = useState<'EUR' | 'GBP' | 'USD'>(
    account ? account.currency : 'EUR'
  );
  const [balance, setBalance] = useState<string>(
    account ? account.balance.toString() : '5000.00'
  );
  const [revtag, setRevtag] = useState<string>('@mandana_landlord');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-fill typical BIC when switching institution
  const handleInstitutionChange = (inst: 'ING' | 'Revolut') => {
    setInstitutionName(inst);
    if (!account) {
      if (inst === 'ING') {
        setBic('INGBNL2A');
        setIban('NL91 INGB 0417 8829 10');
      } else {
        setBic('REVOLT21');
        setIban('LT58 3250 0124 5589 3321');
      }
    }
  };

  const handleFormatIban = (raw: string) => {
    // Strip non-alphanumeric, uppercase, group by 4
    const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setIban(formatted);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!accountName.trim()) {
      newErrors.accountName = 'Account name is required.';
    }
    const cleanIban = iban.replace(/\s+/g, '');
    if (!cleanIban) {
      newErrors.iban = 'IBAN is required.';
    } else if (cleanIban.length < 14 || cleanIban.length > 34) {
      newErrors.iban = 'European IBANs must be between 15 and 34 characters.';
    }
    if (!bic.trim()) {
      newErrors.bic = 'BIC / SWIFT code is required.';
    }
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      newErrors.balance = 'Please enter a valid numeric balance.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: BankAccount = {
      id: account ? account.id : `acc_${institutionName.toLowerCase()}_${Date.now()}`,
      institutionName,
      accountName: accountName.trim(),
      iban: iban.trim().toUpperCase(),
      bic: bic.trim().toUpperCase(),
      currency,
      balance: parseFloat(balance) || 0,
      lastSyncedAt: account ? account.lastSyncedAt : new Date().toISOString(),
      consentExpiresAt: account
        ? account.consentExpiresAt
        : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      status: account ? account.status : 'connected',
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              institutionName === 'ING' ? 'bg-orange-600' : 'bg-blue-600'
            }`}>
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {isEditing ? `Edit ${account?.institutionName} Bank Account` : 'Add Landlord Bank Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update account details, IBAN, and BIC. Used for tenant WhatsApp payment routing.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Institution Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Financial Institution
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInstitutionChange('ING')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  institutionName === 'ING'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-semibold ring-2 ring-orange-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ING
                </div>
                <div>
                  <div className="text-xs font-semibold">ING Bank EU</div>
                  <div className="text-[10px] text-slate-500">Dutch &amp; Eurozone IBAN</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInstitutionChange('Revolut')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  institutionName === 'Revolut'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  R
                </div>
                <div>
                  <div className="text-xs font-semibold">Revolut Bank UAB</div>
                  <div className="text-[10px] text-slate-500">Lithuanian / Multi-Currency</div>
                </div>
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Account Holder Name (Beneficiary)
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Mandana Hashemi (Primary Rent Account)"
              className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                errors.accountName ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.accountName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.accountName}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              This name will be displayed as the transfer recipient in tenant messages.
            </p>
          </div>

          {/* IBAN & BIC Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                IBAN (International Bank Account Number)
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => handleFormatIban(e.target.value)}
                placeholder="NL91 INGB 0417 8829 10"
                className={`w-full px-3 py-2 bg-white border rounded-lg font-mono text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.iban ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.iban && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.iban}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                BIC / SWIFT
              </label>
              <input
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value.toUpperCase())}
                placeholder="INGBNL2A"
                className={`w-full px-3 py-2 bg-white border rounded-lg font-mono text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.bic ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.bic && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.bic}</p>
              )}
            </div>
          </div>

          {/* Currency & Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Account Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'EUR' | 'GBP' | 'USD')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="USD">USD ($) - US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Ledger Balance (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.balance ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.balance && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.balance}</p>
              )}
            </div>
          </div>

          {/* Optional Revtag if Revolut */}
          {institutionName === 'Revolut' && (
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Revolut Revtag (Optional handle for instant app-to-app transfers)
              </label>
              <input
                type="text"
                value={revtag}
                onChange={(e) => setRevtag(e.target.value)}
                placeholder="@mandana_rent"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* Live Tenant WhatsApp Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Tenant WhatsApp Instructions Preview</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed space-y-1">
              <div>🏦 *Bank:* {institutionName} ({accountName || 'Beneficiary Name'})</div>
              <div>💳 *IBAN:* `{iban || 'NL91 INGB ...'}`</div>
              <div>🌐 *BIC / SWIFT:* `{bic || 'INGBNL2A'}`</div>
              <div>⚠️ *Payment Reference:* `RF-A2-ELEC-TENANTNAME`</div>
            </div>
            <p className="text-[10px] text-slate-500">
              When tenants tap &quot;Launch WhatsApp&quot;, these exact updated bank details will be pre-filled in their message.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Account Changes' : 'Create Bank Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
