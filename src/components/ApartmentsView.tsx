import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  Check, 
  Edit3, 
  Plus, 
  Sparkles, 
  History, 
  Info,
  X,
  UserMinus,
  Archive,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Landmark,
  Layers,
  Users,
  Trash2,
  AlertTriangle,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { Apartment, Tenant, BankAccount, LandlordExpense } from '../types';
import { LandlordExpensesSection, getDaysUntil } from './LandlordExpensesSection';
import { EditTenantModal } from './EditTenantModal';

interface ApartmentsViewProps {
  apartments: Apartment[];
  tenants: Tenant[];
  bankAccounts: BankAccount[];
  landlordExpenses: LandlordExpense[];
  onUpdateTenantRent: (tenantId: string, newRent: number) => void;
  onUpdateTenantDeposit: (tenantId: string, newDeposit: number) => void;
  onUpdateTenantBank: (tenantId: string, bankId: string) => void;
  onUpdateFullTenant: (updatedTenant: Tenant) => void;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onEndTenancy: (tenantId: string, moveOutDate: string, retainedDeposit: number, notes?: string) => void;
  onReactivateTenant: (tenantId: string) => void;
  onOpenUploadForApartment: (apartmentId: string) => void;
  onUpdateApartment: (apartment: Apartment) => void;
  onAddApartment: (apartment: Omit<Apartment, 'id'>) => void;
  onDeleteApartment: (apartmentId: string) => void;
  onAddLandlordExpense: (expense: Omit<LandlordExpense, 'id'>) => void;
  onUpdateLandlordExpense: (expense: LandlordExpense) => void;
  onDeleteLandlordExpense: (expenseId: string) => void;
  onMarkExpensePaid: (expenseId: string) => void;
}

export const ApartmentsView: React.FC<ApartmentsViewProps> = ({
  apartments,
  tenants,
  bankAccounts,
  landlordExpenses,
  onUpdateTenantRent,
  onUpdateTenantDeposit,
  onUpdateTenantBank,
  onUpdateFullTenant,
  onAddTenant,
  onEndTenancy,
  onReactivateTenant,
  onOpenUploadForApartment,
  onUpdateApartment,
  onAddApartment,
  onDeleteApartment,
  onAddLandlordExpense,
  onUpdateLandlordExpense,
  onDeleteLandlordExpense,
  onMarkExpensePaid,
}) => {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>(apartments[0]?.id || 'apt_2');
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'expenses'>('tenants');

  // If selectedApartmentId is no longer in apartments (e.g. after deletion), reset to first available
  useEffect(() => {
    if (!apartments.some((a) => a.id === selectedApartmentId) && apartments.length > 0) {
      setSelectedApartmentId(apartments[0].id);
    }
  }, [apartments, selectedApartmentId]);

  // Comprehensive Tenant Full Profile & Lease Edit Modal State
  const [modalEditingTenant, setModalEditingTenant] = useState<Tenant | null>(null);
  const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState<boolean>(false);

  // Tenant Editing & Modals
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [tempRent, setTempRent] = useState<string>('');
  const [tempDeposit, setTempDeposit] = useState<string>('');
  const [tempBankId, setTempBankId] = useState<string>('acc_ing_eur');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'active' | 'archive'>('all');

  // Move-Out Checkout Modal State
  const [moveOutTenant, setMoveOutTenant] = useState<Tenant | null>(null);
  const [moveOutDate, setMoveOutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [moveOutDeposit, setMoveOutDeposit] = useState<string>('50');
  const [moveOutNotes, setMoveOutNotes] = useState<string>('');

  // New tenant form state
  const [newFullName, setNewFullName] = useState('');
  const [newRoomLabel, setNewRoomLabel] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState('600');
  const [newWhatsapp, setNewWhatsapp] = useState('+49');
  const [newEmail, setNewEmail] = useState('');
  const [newStartDate, setNewStartDate] = useState('2026-05-01');
  const [newDeposit, setNewDeposit] = useState('0');
  const [newBankId, setNewBankId] = useState('acc_ing_eur');

  // Apartment Edit State
  const [showEditApartmentModal, setShowEditApartmentModal] = useState<boolean>(false);
  const [editAptName, setEditAptName] = useState('');
  const [editAptUnit, setEditAptUnit] = useState('');
  const [editAptAddress, setEditAptAddress] = useState('');
  const [editAptCity, setEditAptCity] = useState('');
  const [editAptCountry, setEditAptCountry] = useState('');
  const [editAptBankId, setEditAptBankId] = useState('acc_ing_eur');
  const [editAptColor, setEditAptColor] = useState('blue');

  // Add New Apartment State
  const [showAddApartmentModal, setShowAddApartmentModal] = useState<boolean>(false);
  const [newAptName, setNewAptName] = useState('');
  const [newAptUnit, setNewAptUnit] = useState('');
  const [newAptAddress, setNewAptAddress] = useState('');
  const [newAptCity, setNewAptCity] = useState('');
  const [newAptCountry, setNewAptCountry] = useState('Netherlands');
  const [newAptBankId, setNewAptBankId] = useState('acc_ing_eur');
  const [newAptColor, setNewAptColor] = useState('emerald');

  // Safe Delete Apartment Modal State
  const [showDeleteApartmentModal, setShowDeleteApartmentModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [deleteConfirmCheckbox, setDeleteConfirmCheckbox] = useState<boolean>(false);

  const selectedApartment = apartments.find((a) => a.id === selectedApartmentId) || apartments[0];
  const apartmentTenants = selectedApartment ? tenants.filter((t) => t.apartmentId === selectedApartment.id) : [];
  const activeTenants = apartmentTenants.filter((t) => t.isActive);
  const departedTenants = apartmentTenants.filter((t) => !t.isActive);
  const targetBank = selectedApartment ? bankAccounts.find((b) => b.id === selectedApartment.targetBankAccountId) : bankAccounts[0];
  
  const currentAptExpenses = selectedApartment ? landlordExpenses.filter((e) => e.apartmentId === selectedApartment.id) : [];
  const currentRentTotal = activeTenants.reduce((s, t) => s + t.monthlyRent, 0);

  const startEditTenant = (tenant: Tenant) => {
    setEditingTenantId(tenant.id);
    setTempRent(tenant.monthlyRent.toString());
    setTempDeposit(tenant.retainedDepositBalance.toString());
    setTempBankId(tenant.targetBankAccountId || selectedApartment.targetBankAccountId || 'acc_ing_eur');
  };

  const saveEditTenant = (tenantId: string) => {
    const rentNum = parseFloat(tempRent);
    const depositNum = parseFloat(tempDeposit);
    if (!isNaN(rentNum) && rentNum >= 0) {
      onUpdateTenantRent(tenantId, rentNum);
    }
    if (!isNaN(depositNum) && depositNum >= 0) {
      onUpdateTenantDeposit(tenantId, depositNum);
    }
    if (tempBankId) {
      onUpdateTenantBank(tenantId, tempBankId);
    }
    setEditingTenantId(null);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !selectedApartment) return;
    onAddTenant({
      apartmentId: selectedApartment.id,
      fullName: newFullName,
      roomLabel: newRoomLabel || 'Standard Room',
      monthlyRent: parseFloat(newMonthlyRent) || 600,
      rentDueDay: 1,
      leaseStartDate: newStartDate,
      leaseEndDate: null,
      whatsappNumber: newWhatsapp,
      email: newEmail || `${newFullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      retainedDepositBalance: parseFloat(newDeposit) || 0,
      targetBankAccountId: newBankId || selectedApartment.targetBankAccountId || 'acc_ing_eur',
      isActive: true,
    });
    setShowAddModal(false);
    setNewFullName('');
    setNewRoomLabel('');
    setNewMonthlyRent('600');
  };

  const openMoveOutModal = (tenant: Tenant) => {
    setMoveOutTenant(tenant);
    setMoveOutDate(new Date().toISOString().split('T')[0]);
    setMoveOutDeposit(tenant.retainedDepositBalance ? tenant.retainedDepositBalance.toString() : '50');
    setMoveOutNotes('');
  };

  const handleConfirmMoveOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveOutTenant) return;
    const depositNum = parseFloat(moveOutDeposit) || 0;
    onEndTenancy(moveOutTenant.id, moveOutDate, depositNum, moveOutNotes);
    setMoveOutTenant(null);
  };

  // Open Edit Apartment Modal
  const openEditApartment = () => {
    if (!selectedApartment) return;
    setEditAptName(selectedApartment.name);
    setEditAptUnit(selectedApartment.unitNumber);
    setEditAptAddress(selectedApartment.address);
    setEditAptCity(selectedApartment.city);
    setEditAptCountry(selectedApartment.country);
    setEditAptBankId(selectedApartment.targetBankAccountId);
    setEditAptColor(selectedApartment.colorTag || 'blue');
    setShowEditApartmentModal(true);
  };

  const handleSaveApartmentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartment || !editAptName || !editAptAddress) return;

    onUpdateApartment({
      ...selectedApartment,
      name: editAptName,
      unitNumber: editAptUnit || 'Unit 1',
      address: editAptAddress,
      city: editAptCity || 'Amsterdam',
      country: editAptCountry || 'Netherlands',
      targetBankAccountId: editAptBankId,
      colorTag: editAptColor,
    });

    setShowEditApartmentModal(false);
  };

  // Open Add Apartment Modal
  const openAddApartment = () => {
    setNewAptName('');
    setNewAptUnit('');
    setNewAptAddress('');
    setNewAptCity('');
    setNewAptCountry('Netherlands');
    setNewAptBankId('acc_ing_eur');
    setNewAptColor('emerald');
    setShowAddApartmentModal(true);
  };

  const handleSaveNewApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptName || !newAptAddress) return;

    onAddApartment({
      name: newAptName,
      unitNumber: newAptUnit || 'Apt 1',
      address: newAptAddress,
      city: newAptCity || 'Amsterdam',
      country: newAptCountry || 'Netherlands',
      targetBankAccountId: newAptBankId,
      colorTag: newAptColor,
    });

    setShowAddApartmentModal(false);
  };

  // Open Safe Delete Apartment Modal
  const openDeleteApartmentModal = () => {
    setDeleteConfirmText('');
    setDeleteConfirmCheckbox(false);
    setShowDeleteApartmentModal(true);
  };

  const handleConfirmDeleteApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartment) return;
    if (apartments.length <= 1) return;

    const typedNormalized = deleteConfirmText.trim().toLowerCase();
    const requiredNormalized = selectedApartment.unitNumber.trim().toLowerCase();

    if (!deleteConfirmCheckbox || typedNormalized !== requiredNormalized) {
      return;
    }

    const nextApartment = apartments.find((a) => a.id !== selectedApartment.id);
    if (nextApartment) {
      setSelectedApartmentId(nextApartment.id);
    }

    onDeleteApartment(selectedApartment.id);
    setShowDeleteApartmentModal(false);
    setShowEditApartmentModal(false);
  };

  const calculateStayDuration = (startStr: string, endStr?: string | null): string => {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date();
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (diffMonths <= 0) {
      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return `${Math.max(1, days)} days`;
    }
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
  };

  const urgentExpenses = currentAptExpenses.filter((e) => {
    const { days } = getDaysUntil(e.nextDueDate);
    return days <= 7;
  });

  if (!selectedApartment) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">No properties in portfolio</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">Add your first property to start managing leases and expenses.</p>
        <button
          onClick={openAddApartment}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add First Apartment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Properties, Leases &amp; Owner Financials
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage apartments, per-tenant ING/Revolut bank routing, move-out archives, and scheduled mortgage deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={openAddApartment}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Apartment
          </button>
          
          <button
            onClick={() => {
              setNewBankId(selectedApartment.targetBankAccountId || 'acc_ing_eur');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Tenant to {selectedApartment.unitNumber}
          </button>
        </div>
      </div>

      {/* Apartment Selector Segmented Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {apartments.map((apt) => {
          const aptTenants = tenants.filter((t) => t.apartmentId === apt.id);
          const activeCount = aptTenants.filter((t) => t.isActive).length;
          const archiveCount = aptTenants.filter((t) => !t.isActive).length;
          const isSelected = apt.id === selectedApartmentId;
          const bank = bankAccounts.find((b) => b.id === apt.targetBankAccountId);
          const aptExpenses = landlordExpenses.filter((e) => e.apartmentId === apt.id);
          const totalRent = aptTenants.filter((t) => t.isActive).reduce((s, t) => s + t.monthlyRent, 0);

          return (
            <button
              key={apt.id}
              onClick={() => setSelectedApartmentId(apt.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-sm'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                  {apt.unitNumber}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {bank?.institutionName} Primary
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mt-2 truncate">{apt.name}</h3>
              <p className="text-xs text-slate-500 truncate">{apt.address}, {apt.city}</p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {activeCount} Active {archiveCount > 0 && `· ${archiveCount} Archived`}
                </span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  €{totalRent.toFixed(2)}/mo
                </span>
              </div>

              {aptExpenses.length > 0 && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Owner Dues:</span>
                  <span className="font-mono text-slate-700">
                    {aptExpenses.length} scheduled
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Apartment Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Apartment Header Banner & Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {selectedApartment.name}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800">
                {selectedApartment.unitNumber}
              </span>
              {selectedApartment.id === 'apt_2' && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                  4-Person Flatshare
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedApartment.address}, {selectedApartment.city}, {selectedApartment.country}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono">
                <Landmark className="w-3.5 h-3.5 text-slate-400" />
                Building Primary Bank: {targetBank?.accountName}
              </span>
            </div>
          </div>

          {/* Quick Header Actions: Edit, Delete & Upload Bill */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={openEditApartment}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Edit apartment name and address"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              Edit Property
            </button>

            <button
              onClick={openDeleteApartmentModal}
              className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Permanently remove this property with two-step safety lock"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => onOpenUploadForApartment(selectedApartment.id)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Assign Utility Bill
            </button>
          </div>
        </div>

        {/* Primary Sub-Tab Switcher: Tenants vs Owner Expenses */}
        <div className="px-4 sm:px-5 border-b border-slate-200 bg-white flex items-center gap-4">
          <button
            onClick={() => setActiveSubTab('tenants')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'tenants'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Roommates &amp; Leases ({apartmentTenants.length})</span>
            {departedTenants.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                {departedTenants.length} archived
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors relative ${
              activeSubTab === 'expenses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Owner Expenses &amp; Deadlines ({currentAptExpenses.length})</span>
            {urgentExpenses.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] font-bold rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {urgentExpenses.length} due soon
              </span>
            )}
          </button>
        </div>

        {/* Tab 1 Content: Roommates & Leases */}
        {activeSubTab === 'tenants' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Filter Toggle: All vs Active Residents vs Residency Archive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => setViewFilter('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  All ({apartmentTenants.length})
                </button>
                <button
                  onClick={() => setViewFilter('active')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewFilter === 'active' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  Active Residents ({activeTenants.length})
                </button>
                <button
                  onClick={() => setViewFilter('archive')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                    viewFilter === 'archive' ? 'bg-white text-amber-800 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Residency Archive ({departedTenants.length})
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Combined Rent Roll: <strong className="font-mono text-slate-800">€{currentRentTotal.toFixed(2)}/month</strong>
              </div>
            </div>

            {/* Explanatory callout for Delayed Utility Matching & Per-Tenant Banks */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Individual Tenant Bank Routing &amp; Delayed Utilities:</strong> Each roommate can pay into either your <strong>ING</strong> or <strong>Revolut</strong> account individually. When utility bills arrive 2–3 months delayed, the app checks their exact stay dates and dispatches WhatsApp messages with the specific bank account and IBAN assigned to that tenant!
              </div>
            </div>

            {/* Active Residents Section */}
            {(viewFilter === 'all' || viewFilter === 'active') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Active Current Tenants ({activeTenants.length})
                  </h4>
                  <span className="text-xs text-slate-400">
                    Click &quot;Move Out / Archive&quot; when a roommate departs
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {activeTenants.map((tenant) => {
                    const isEditing = editingTenantId === tenant.id;
                    const tenantBankId = tenant.targetBankAccountId || selectedApartment.targetBankAccountId;
                    const tenantBank = bankAccounts.find((b) => b.id === tenantBankId) || bankAccounts[0];

                    return (
                      <div
                        key={tenant.id}
                        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {tenant.fullName}
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                Active Resident
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {tenant.roomLabel}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <button
                                onClick={() => saveEditTenant(tenant.id)}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setModalEditingTenant(tenant);
                                  setIsEditTenantModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                                title="Edit tenant full name, phone number, room assignment, rent, and lease start date"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Profile</span>
                              </button>
                            )}

                            <button
                              onClick={() => openMoveOutModal(tenant)}
                              className="px-2 py-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                              title="End tenancy, archive stay dates, and withhold delayed utility deposit"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Move Out / Archive
                            </button>
                          </div>
                        </div>

                        {/* Tenant Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-500 block text-[11px]">Monthly Custom Rent:</span>
                            {isEditing ? (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-slate-500 font-mono">€</span>
                                <input
                                  type="number"
                                  step="5"
                                  value={tempRent}
                                  onChange={(e) => setTempRent(e.target.value)}
                                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                                €{tenant.monthlyRent.toFixed(2)}
                                <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-slate-500 block text-[11px]">Lease Start Date:</span>
                            <span className="font-mono text-slate-800 text-xs">
                              {tenant.leaseStartDate}
                            </span>
                          </div>
                        </div>

                        {/* Per-Tenant Bank Account Routing Badge / Selector */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-slate-400" />
                            Pays Into Bank:
                          </span>
                          {isEditing ? (
                            <select
                              value={tempBankId}
                              onChange={(e) => setTempBankId(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-blue-600"
                            >
                              {bankAccounts.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.institutionName} - {b.accountName.split(' ')[0]} ({b.iban.slice(-6)})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono flex items-center gap-1.5 ${
                              tenantBank.institutionName === 'ING'
                                ? 'bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/25'
                                : 'bg-[#0075EB]/10 text-[#0075EB] border border-[#0075EB]/25'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                tenantBank.institutionName === 'ING' ? 'bg-[#FF6200]' : 'bg-[#0075EB]'
                              }`}></span>
                              {tenantBank.institutionName} Account
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {tenant.whatsappNumber}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] truncate max-w-[130px]">
                              <Mail className="w-3 h-3 text-blue-500" />
                              {tenant.email}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">Due 1st</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Residency Archive Section */}
            {(viewFilter === 'all' || viewFilter === 'archive') && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-amber-600" />
                    Residency Archive &amp; Historical Stays ({departedTenants.length})
                  </h4>
                  <span className="text-xs text-slate-400">
                    Stay timeline preserved for retroactive utility allocation
                  </span>
                </div>

                {departedTenants.length === 0 ? (
                  <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No departed tenants archived yet for this apartment. When a roommate moves out, their historical stay dates and retained utility deposit will appear here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {departedTenants.map((tenant) => {
                      const isEditing = editingTenantId === tenant.id;
                      const tenantBankId = tenant.targetBankAccountId || selectedApartment.targetBankAccountId;
                      const tenantBank = bankAccounts.find((b) => b.id === tenantBankId) || bankAccounts[0];

                      return (
                        <div
                          key={tenant.id}
                          className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                {tenant.fullName}
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                                  <Archive className="w-3 h-3" />
                                  Departed
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {tenant.roomLabel}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <button
                                  onClick={() => saveEditTenant(tenant.id)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setModalEditingTenant(tenant);
                                    setIsEditTenantModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-xs text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 rounded-lg font-medium flex items-center gap-1 transition-colors"
                                  title="Edit departed tenant historical stay dates or name"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Edit Dates</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Historical Stay Interval */}
                          <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200/60 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-900">
                                <History className="w-3.5 h-3.5 text-amber-600" />
                                Total Stay Duration:
                              </span>
                              <span className="font-mono font-bold text-amber-950">
                                {calculateStayDuration(tenant.leaseStartDate, tenant.leaseEndDate)}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-600">
                              {tenant.leaseStartDate} &rarr; {tenant.leaseEndDate}
                            </div>
                          </div>

                          {/* Retained Deposit & Previous Rent */}
                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div>
                              <span className="text-slate-600 block text-[11px] font-medium">
                                Retained Utility Advance:
                              </span>
                              {isEditing ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-slate-500 font-mono">€</span>
                                  <input
                                    type="number"
                                    step="5"
                                    value={tempDeposit}
                                    onChange={(e) => setTempDeposit(e.target.value)}
                                    className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                                  />
                                </div>
                              ) : (
                                <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
                                  €{tenant.retainedDepositBalance.toFixed(2)}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 block">
                                Held for delayed true-ups
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-600 block text-[11px]">Previous Rent:</span>
                              <span className="font-mono text-slate-800 tabular-nums text-xs">
                                €{tenant.monthlyRent.toFixed(2)}/mo
                              </span>
                            </div>
                          </div>

                          {/* Bank Paid To */}
                          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500">Designated Bank:</span>
                            <span className="font-mono text-[11px] font-semibold text-slate-700">
                              {tenantBank.institutionName} ({tenantBank.iban.slice(-6)})
                            </span>
                          </div>

                          {tenant.notes && (
                            <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-amber-200/60">
                              {tenant.notes}
                            </div>
                          )}

                          {/* Reactivate option */}
                          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {tenant.whatsappNumber}
                            </span>
                            <button
                              onClick={() => onReactivateTenant(tenant.id)}
                              className="px-2 py-1 text-[11px] text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors flex items-center gap-1 font-medium"
                              title="Restore to active residents if tenant returns"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-500" />
                              <span>Reactivate Lease</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Owner Expenses & Deadlines */}
        {activeSubTab === 'expenses' && (
          <div className="p-4 sm:p-5">
            <LandlordExpensesSection
              apartment={selectedApartment}
              expenses={landlordExpenses}
              monthlyRentIncome={currentRentTotal}
              onAddExpense={onAddLandlordExpense}
              onUpdateExpense={onUpdateLandlordExpense}
              onDeleteExpense={onDeleteLandlordExpense}
              onMarkPaid={onMarkExpensePaid}
            />
          </div>
        )}
      </div>

      {/* Edit Apartment Modal */}
      {showEditApartmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Edit Apartment Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update building name, street address, and linked default bank account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditApartmentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApartmentEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Apartment / Building Name *</label>
                  <input
                    type="text"
                    required
                    value={editAptName}
                    onChange={(e) => setEditAptName(e.target.value)}
                    placeholder="e.g. Prinsengracht Canal House"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Flat *</label>
                  <input
                    type="text"
                    required
                    value={editAptUnit}
                    onChange={(e) => setEditAptUnit(e.target.value)}
                    placeholder="Apt 101"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={editAptAddress}
                  onChange={(e) => setEditAptAddress(e.target.value)}
                  placeholder="e.g. Prinsengracht 142-A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={editAptCity}
                    onChange={(e) => setEditAptCity(e.target.value)}
                    placeholder="Amsterdam"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={editAptCountry}
                    onChange={(e) => setEditAptCountry(e.target.value)}
                    placeholder="Netherlands"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building Primary Bank Account</label>
                <select
                  value={editAptBankId}
                  onChange={(e) => setEditAptBankId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-blue-600 font-mono"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.institutionName} - {b.accountName} ({b.iban})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Used as fallback for general property fees. (Note: Individual roommates can be assigned to either ING or Revolut independently).
                </span>
              </div>

              {/* Delete trigger inside Edit Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditApartmentModal(false);
                    openDeleteApartmentModal();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete this building...
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditApartmentModal(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                  >
                    Save Property Details
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Apartment Modal */}
      {showAddApartmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Add New Apartment Property
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register a new rental building in your European portfolio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddApartmentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewApartment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Building / Property Name *</label>
                  <input
                    type="text"
                    required
                    value={newAptName}
                    onChange={(e) => setNewAptName(e.target.value)}
                    placeholder="e.g. Rotterdam Waterfront Apt"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Flat *</label>
                  <input
                    type="text"
                    required
                    value={newAptUnit}
                    onChange={(e) => setNewAptUnit(e.target.value)}
                    placeholder="Flat 4A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAptAddress}
                  onChange={(e) => setNewAptAddress(e.target.value)}
                  placeholder="e.g. Wilhelminakade 44"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAptCity}
                    onChange={(e) => setNewAptCity(e.target.value)}
                    placeholder="Rotterdam"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={newAptCountry}
                    onChange={(e) => setNewAptCountry(e.target.value)}
                    placeholder="Netherlands"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Bank Account for Rent &amp; Deposits</label>
                <select
                  value={newAptBankId}
                  onChange={(e) => setNewAptBankId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-blue-600 font-mono"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.institutionName} - {b.accountName} ({b.iban})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                Once created, you can immediately add tenants with individual ING or Revolut routing, schedule landlord mortgage and building fee obligations, and assign retroactive utility bills.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddApartmentModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Create Apartment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Two-Step Delete Apartment Modal with Protection Lock */}
      {showDeleteApartmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-4 my-8">
            {apartments.length <= 1 ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Cannot Delete Only Property
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Your portfolio must maintain at least one registered property. To delete <strong>{selectedApartment.name}</strong>, please add your new property first.
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setShowDeleteApartmentModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDeleteApartment} className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-rose-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-rose-900 font-display flex items-center gap-2">
                        Safe Delete: {selectedApartment.name}
                      </h3>
                      <p className="text-xs text-rose-700 font-medium">
                        Unit {selectedApartment.unitNumber} · Accidental Deletion Protection
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteApartmentModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Audit & Impact Box */}
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Permanent Data Removal Warning
                  </div>
                  <p className="text-rose-800 leading-relaxed text-[11px]">
                    To ensure no property is ever deleted by a mistaken touch or click, please review all records that will be permanently erased:
                  </p>
                  <ul className="list-disc pl-4 text-rose-900 space-y-1 text-[11px]">
                    <li>
                      <strong>{activeTenants.length} Active Resident(s)</strong>
                      {activeTenants.length > 0 && ` (${activeTenants.map((t) => t.fullName).join(', ')})`}
                    </li>
                    <li>
                      <strong>{departedTenants.length} Archived Tenant(s)</strong> with historical stay intervals
                    </li>
                    <li>
                      <strong>{currentAptExpenses.length} Scheduled Owner Obligation(s)</strong> (mortgages &amp; building dues)
                    </li>
                  </ul>
                </div>

                {/* Barrier 1: Checkbox */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteConfirmCheckbox}
                      onChange={(e) => setDeleteConfirmCheckbox(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      I understand that deleting this building permanently deletes its active roommates, archive history, and scheduled mortgage deadlines.
                    </span>
                  </label>
                </div>

                {/* Barrier 2: Typed Unit Confirmation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Security Barrier: Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-rose-700">{selectedApartment.unitNumber}</span> below to unlock:
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${selectedApartment.unitNumber}" here`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-rose-600"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteApartmentModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                  >
                    Cancel (Keep Property Safe)
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !deleteConfirmCheckbox ||
                      deleteConfirmText.trim().toLowerCase() !== selectedApartment.unitNumber.trim().toLowerCase()
                    }
                    className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                      deleteConfirmCheckbox &&
                      deleteConfirmText.trim().toLowerCase() === selectedApartment.unitNumber.trim().toLowerCase()
                        ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-rose-200'
                        : 'bg-slate-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete Building
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tenant Move-Out & Check-Out Modal */}
      {moveOutTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    End Tenancy &amp; Archive Resident
                  </h3>
                  <p className="text-xs text-slate-500">
                    {moveOutTenant.fullName} · {moveOutTenant.roomLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMoveOutTenant(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMoveOut} className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Preserving Stay for Delayed Utility Invoices
                </div>
                <p className="text-[11px] leading-relaxed">
                  Moving out will preserve <strong>{moveOutTenant.fullName}</strong> in the Tenancy Archive with their start date (<strong>{moveOutTenant.leaseStartDate}</strong>) and end date. When upcoming utility bills arrive 2–3 months later, the app will automatically recognize that they lived there during that billing window and assign their proportional share!
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Move-Out Date (Last Day of Tenancy)
                </label>
                <input
                  type="date"
                  required
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Retained Utility Advance / Deposit (€)
                </label>
                <input
                  type="number"
                  step="5"
                  required
                  value={moveOutDeposit}
                  onChange={(e) => setMoveOutDeposit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-blue-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Amount withheld from deposit to automatically settle delayed future utility bills without asking the tenant for new bank transfers.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Move-Out Notes / Forwarding Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completed university exchange; held €50 deposit for final Q2 heating true-up."
                  value={moveOutNotes}
                  onChange={(e) => setMoveOutNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMoveOutTenant(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  Confirm Move-Out &amp; Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Tenant to {selectedApartment.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Schmidt"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Room Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 2 (Balcony)"
                    value={newRoomLabel}
                    onChange={(e) => setNewRoomLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Custom Monthly Rent (€) *</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={newMonthlyRent}
                    onChange={(e) => setNewMonthlyRent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Per-Tenant Payment Destination Account */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination Bank (Where this tenant pays rent &amp; bills) *
                </label>
                <select
                  value={newBankId}
                  onChange={(e) => setNewBankId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-blue-600 font-semibold"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.institutionName} - {b.accountName} ({b.iban})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Select either ING or Revolut specifically for this tenant. Their WhatsApp payment links will automatically use this bank account.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+49171234567"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lease Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Retained Utility Deposit / Reserve (€)</label>
                <input
                  type="number"
                  step="10"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-blue-600"
                  placeholder="0.00"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Advance amount held to settle delayed future utility true-ups without asking for extra transfers.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Tenant Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Tenant Profile & Lease Dates Edit Modal */}
      <EditTenantModal
        tenant={modalEditingTenant}
        apartments={apartments}
        bankAccounts={bankAccounts}
        isOpen={isEditTenantModalOpen}
        onClose={() => {
          setIsEditTenantModalOpen(false);
          setModalEditingTenant(null);
        }}
        onSaveTenant={(updated) => {
          onUpdateFullTenant(updated);
        }}
      />
    </div>
  );
};
