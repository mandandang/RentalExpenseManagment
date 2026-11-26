import React, { useState } from 'react';
import { 
  Calendar, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Building, 
  X,
  FileCheck,
  TrendingUp,
  Receipt,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { LandlordExpense, ExpenseFrequency, ExpenseCategory, Apartment } from '../types';

interface LandlordExpensesSectionProps {
  apartment: Apartment;
  expenses: LandlordExpense[];
  monthlyRentIncome: number;
  onAddExpense: (expense: Omit<LandlordExpense, 'id'>) => void;
  onUpdateExpense: (expense: LandlordExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onMarkPaid: (expenseId: string) => void;
}

export function advanceDueDate(currentDueDateStr: string, frequency: ExpenseFrequency, dueDay?: number): string {
  const parts = currentDueDateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10); // 1-12
  const day = dueDay || parseInt(parts[2], 10);

  let monthsToAdd = 1;
  switch (frequency) {
    case 'monthly': monthsToAdd = 1; break;
    case 'every_2_months': monthsToAdd = 2; break;
    case 'quarterly': monthsToAdd = 3; break;
    case 'semi_annually': monthsToAdd = 6; break;
    case 'annually': monthsToAdd = 12; break;
    case 'one_time': return currentDueDateStr;
  }

  month += monthsToAdd;
  while (month > 12) {
    month -= 12;
    year += 1;
  }

  const daysInTargetMonth = new Date(year, month, 0).getDate();
  const validDay = Math.min(day, daysInTargetMonth);

  return `${year}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
}

export function getDaysUntil(dateStr: string): { days: number; isOverdue: boolean; label: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, isOverdue: true, label: `${Math.abs(diffDays)}d overdue` };
  } else if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: 'Due today' };
  } else if (diffDays === 1) {
    return { days: 1, isOverdue: false, label: 'Due tomorrow' };
  } else {
    return { days: diffDays, isOverdue: false, label: `Due in ${diffDays} days` };
  }
}

export const LandlordExpensesSection: React.FC<LandlordExpensesSectionProps> = ({
  apartment,
  expenses,
  monthlyRentIncome,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onMarkPaid,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<LandlordExpense | null>(null);

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('building_fees');
  const [formAmount, setFormAmount] = useState('200');
  const [formFrequency, setFormFrequency] = useState<ExpenseFrequency>('every_2_months');
  const [formDueDay, setFormDueDay] = useState('1');
  const [formNextDueDate, setFormNextDueDate] = useState('2026-11-01');
  const [formRecipient, setFormRecipient] = useState('');
  const [formIban, setFormIban] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const apartmentExpenses = expenses.filter((e) => e.apartmentId === apartment.id);

  // Calculate monthly normalized burden
  const monthlyNormalizedExpense = apartmentExpenses.reduce((sum, exp) => {
    switch (exp.frequency) {
      case 'monthly': return sum + exp.amount;
      case 'every_2_months': return sum + (exp.amount / 2);
      case 'quarterly': return sum + (exp.amount / 3);
      case 'semi_annually': return sum + (exp.amount / 6);
      case 'annually': return sum + (exp.amount / 12);
      default: return sum;
    }
  }, 0);

  const netMonthlyCashFlow = monthlyRentIncome - monthlyNormalizedExpense;

  const openAddModal = () => {
    setFormTitle('');
    setFormCategory('building_fees');
    setFormAmount('200');
    setFormFrequency('every_2_months');
    setFormDueDay('1');
    setFormNextDueDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
    setFormRecipient('');
    setFormIban('');
    setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (expense: LandlordExpense) => {
    setEditingExpense(expense);
    setFormTitle(expense.title);
    setFormCategory(expense.category);
    setFormAmount(expense.amount.toString());
    setFormFrequency(expense.frequency);
    setFormDueDay(expense.dueDay.toString());
    setFormNextDueDate(expense.nextDueDate);
    setFormRecipient(expense.recipient || '');
    setFormIban(expense.iban || '');
    setFormNotes(expense.notes || '');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    onAddExpense({
      apartmentId: apartment.id,
      title: formTitle,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      frequency: formFrequency,
      dueDay: parseInt(formDueDay, 10) || 1,
      nextDueDate: formNextDueDate,
      recipient: formRecipient || undefined,
      iban: formIban || undefined,
      notes: formNotes || undefined,
      status: 'upcoming',
    });

    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formTitle || !formAmount) return;

    onUpdateExpense({
      ...editingExpense,
      title: formTitle,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      frequency: formFrequency,
      dueDay: parseInt(formDueDay, 10) || 1,
      nextDueDate: formNextDueDate,
      recipient: formRecipient || undefined,
      iban: formIban || undefined,
      notes: formNotes || undefined,
    });

    setEditingExpense(null);
  };

  const getFrequencyLabel = (freq: ExpenseFrequency, day: number) => {
    switch (freq) {
      case 'monthly': return `Monthly · Due ${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month`;
      case 'every_2_months': return `Every 2 Months (Bi-monthly) · Due day ${day}`;
      case 'quarterly': return `Quarterly (Every 3 months)`;
      case 'semi_annually': return `Semi-annually (Every 6 months)`;
      case 'annually': return `Annually (Once a year)`;
      case 'one_time': return `One-time Expense`;
    }
  };

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'mortgage_installment':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Mortgage / Bank Installment</span>;
      case 'building_fees':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Building / HOA Fees (VvE / WEG)</span>;
      case 'property_tax':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Property Tax</span>;
      case 'insurance':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Building Insurance</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Maintenance &amp; Repairs</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Landlord Expense</span>;
    }
  };

  // Sort expenses by upcoming due date
  const sortedExpenses = [...apartmentExpenses].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Financial Health & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Owner Monthly Burden</span>
            <CreditCard className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            €{monthlyNormalizedExpense.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-500 font-sans ml-1">/mo avg</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Installments + bi-monthly/annual dues normalized
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Rental Income</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-blue-700 tabular-nums">
            €{monthlyRentIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-500 font-sans ml-1">/mo</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Combined rent collected from all rooms
          </p>
        </div>

        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Net Monthly Cash Flow</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {netMonthlyCashFlow >= 0 ? '+' : ''}€{netMonthlyCashFlow.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-emerald-600 font-sans ml-1">/mo</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700">
            Profit after paying bank &amp; building obligations
          </p>
        </div>
      </div>

      {/* Info Notice about Landlord-Only Expenses */}
      <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">Owner-Only Schedule:</span> These expenses belong strictly to you as the property owner (mortgage installments, bi-monthly building management fees, insurance). They are <strong>never billed to tenants</strong>, but kept here to help you remember deadlines and cash flow.
        </div>
      </div>

      {/* Header and Add Expense Trigger */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Recurring Landlord Obligations ({apartmentExpenses.length})
          </h3>
          <p className="text-xs text-slate-500">
            Scheduled deadlines, mortgage payments, and bi-monthly building association fees for {apartment.name}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense / Due Date
        </button>
      </div>

      {/* Expense List */}
      {sortedExpenses.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-slate-800">No recurring expenses scheduled yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add your mortgage loan installments (e.g. €800 on 1st of each month) or building fees (e.g. €200 every 2 months).
          </p>
          <button
            onClick={openAddModal}
            className="mt-3 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Obligation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map((exp) => {
            const countdown = getDaysUntil(exp.nextDueDate);
            const isDueSoon = countdown.days <= 7 && countdown.days >= 0;

            return (
              <div
                key={exp.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                      {getCategoryBadge(exp.category)}
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {getFrequencyLabel(exp.frequency, exp.dueDay)}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-3 text-xs text-slate-600 pt-0.5">
                      {exp.recipient && (
                        <span>
                          Payee: <strong>{exp.recipient}</strong>
                        </span>
                      )}
                      {exp.iban && (
                        <span className="font-mono text-slate-500">{exp.iban}</span>
                      )}
                      {exp.lastPaidDate && (
                        <span className="text-slate-400">
                          Last paid: {new Date(exp.lastPaidDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {exp.notes && (
                      <p className="text-xs text-slate-500 italic mt-1">{exp.notes}</p>
                    )}
                  </div>

                  {/* Right side: Amount and Due Status */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
                        €{exp.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                          countdown.isOverdue
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        Next: {new Date(exp.nextDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ({countdown.label})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Schedule: {exp.frequency === 'every_2_months' ? 'Cycles every 2 months' : exp.frequency === 'monthly' ? 'Monthly recurring' : exp.frequency}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onMarkPaid(exp.id)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Advance to next billing cycle and log last paid date"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Paid &amp; Roll Cycle
                    </button>
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit expense details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {(showAddModal || editingExpense) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editingExpense ? 'Edit Scheduled Expense' : `New Obligation for ${apartment.unitNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track mortgage installments, building fees, and scheduled deadlines
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExpense(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingExpense ? handleSaveEdit : handleSaveAdd} className="space-y-4">
              {/* Title & Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Mortgage Installment, Building / HOA Fees"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="mortgage_installment">Mortgage / Loan Installment</option>
                    <option value="building_fees">Building / HOA Fees (VvE / WEG)</option>
                    <option value="property_tax">Property Tax</option>
                    <option value="insurance">Building Hazard Insurance</option>
                    <option value="maintenance">Maintenance Fund</option>
                    <option value="other">Other Landlord Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (€) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400">€</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="800.00"
                      className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Frequency and Due Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as ExpenseFrequency)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="monthly">Monthly (Every month)</option>
                    <option value="every_2_months">Every 2 Months (Bi-monthly)</option>
                    <option value="quarterly">Quarterly (Every 3 months)</option>
                    <option value="semi_annually">Semi-annually (Every 6 months)</option>
                    <option value="annually">Annually (Once a year)</option>
                    <option value="one_time">One-time payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Day of Month
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formDueDay}
                      onChange={(e) => setFormDueDay(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">st / th</span>
                  </div>
                </div>
              </div>

              {/* Next Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Due Date / Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formNextDueDate}
                  onChange={(e) => setFormNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When you click "Mark Paid", the deadline automatically advances by your selected frequency (e.g. +2 months for building fees).
                </p>
              </div>

              {/* Recipient and IBAN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payee / Recipient
                  </label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="e.g. ING Hypotheken, VvE Beheer"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target IBAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formIban}
                    onChange={(e) => setFormIban(e.target.value)}
                    placeholder="NL91 INGB..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Memo / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes &amp; Contract Reference
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Contract #49128, direct debit from ING account on 1st."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {editingExpense ? 'Save Changes' : 'Schedule Obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
