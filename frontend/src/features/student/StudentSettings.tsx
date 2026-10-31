import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService, StudentNotificationPreferences } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { mockStore } from '../../mock/store';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Lock, Bell, Shield, Download, MessageSquare, 
  Smartphone, Mail, CheckCircle2, Trash2, Edit3, 
  Plus, Save, AlertCircle, PhoneCall
} from 'lucide-react';

export const StudentSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const studentId = user?.id || 'usr-student-fresh';

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // WhatsApp Management State
  const defaultLoginMobile = user?.mobile || user?.phone || '9876543210';
  const [whatsappNumber, setWhatsappNumber] = useState(user?.parentPhone || user?.mobile || '');
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [tempWhatsapp, setTempWhatsapp] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Notification Preferences State
  const [prefs, setPrefs] = useState<StudentNotificationPreferences>(() => 
    studentService.getNotificationPreferences(studentId, defaultLoginMobile)
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const loadedPrefs = studentService.getNotificationPreferences(studentId, defaultLoginMobile);
    setPrefs(loadedPrefs);
    if (user?.parentPhone) {
      setWhatsappNumber(user.parentPhone);
    }
  }, [studentId, defaultLoginMobile, user]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill out all password fields', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Account password successfully updated!', 'success');
    }, 500);
  };

  const handleSaveWhatsapp = async () => {
    const cleaned = tempWhatsapp.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      addToast('Please enter a valid 10-digit Indian WhatsApp number', 'error');
      return;
    }

    setSavingWhatsapp(true);
    try {
      await studentService.updateProfile(studentId, { parentPhone: cleaned });
      setWhatsappNumber(cleaned);
      const updatedPrefs = { ...prefs, whatsappNumber: cleaned, receiveWhatsapp: true };
      setPrefs(updatedPrefs);
      studentService.saveNotificationPreferences(studentId, updatedPrefs);
      setIsEditingWhatsapp(false);
      addToast('WhatsApp contact number updated & verified for notifications', 'success');
    } catch (err) {
      addToast('Failed to update WhatsApp contact', 'error');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleDeleteWhatsapp = async () => {
    if (!window.confirm('Are you sure you want to remove your WhatsApp notification number?')) return;
    setSavingWhatsapp(true);
    try {
      await studentService.updateProfile(studentId, { parentPhone: '' });
      setWhatsappNumber('');
      const updatedPrefs = { ...prefs, whatsappNumber: '', receiveWhatsapp: false };
      setPrefs(updatedPrefs);
      studentService.saveNotificationPreferences(studentId, updatedPrefs);
      addToast('WhatsApp contact number removed', 'info');
    } catch (err) {
      addToast('Failed to remove WhatsApp contact', 'error');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleUseLoginMobile = () => {
    setTempWhatsapp(defaultLoginMobile);
  };

  const handleTogglePref = (key: keyof StudentNotificationPreferences) => {
    setPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveAllPreferences = () => {
    setSavingPrefs(true);
    setTimeout(() => {
      studentService.saveNotificationPreferences(studentId, prefs);
      setSavingPrefs(false);
      addToast('Notification channels and alert preferences saved successfully!', 'success');
    }, 400);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Gather all comprehensive student data across all domains
      const [invoices, bookings, attendance] = await Promise.all([
        studentService.getInvoices(studentId).catch(() => []),
        studentService.getStudentBookingsData(studentId).catch(() => []),
        attendanceService.getStudentAttendance(studentId).catch(() => []),
      ]);

      const tutorRequests = mockStore.getTutorRequests().filter(r => r.studentId === studentId);

      const exportObject = {
        metadata: {
          platform: "ZYZU'S EdTech Private Limited",
          platformVersion: '1.0.0',
          exportTimestamp: new Date().toISOString(),
          format: 'ZYZUS_STUDENT_PORTABILITY_RECORD_JSON',
        },
        userProfile: user,
        notificationPreferences: prefs,
        academicAndFeeData: {
          totalBookingsCount: 'allBookings' in bookings ? bookings.allBookings.length : (Array.isArray(bookings) ? bookings.length : 0),
          bookingsRecord: bookings,
          totalInvoicesCount: invoices.length,
          invoicesAndReceipts: invoices,
          attendanceRecordsCount: attendance.length,
          attendanceLedger: attendance,
          tutorRequestsCount: tutorRequests.length,
          tutorRequests: tutorRequests,
        },
      };

      const jsonString = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `zyzus_student_${user?.id || 'record'}_complete_data.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);

      addToast('Student account record compiled and downloaded as a file!', 'success');
    } catch (err) {
      console.error('Data export error:', err);
      addToast('Failed to export student data. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Privacy"
        description="Manage your account security, dedicated WhatsApp notification contacts, SMS alerts, and email preferences."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'Settings' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: WHATSAPP NOTIFICATION MANAGEMENT */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">WhatsApp Alerts & Contact</h3>
              <p className="text-xs text-slate-500">Configure separate WhatsApp channel for real-time updates</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Registered Login Mobile:</span>
              <span className="font-mono font-bold text-slate-900">+91 {defaultLoginMobile}</span>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dedicated WhatsApp Number</span>
                  {whatsappNumber ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono font-black text-slate-950 text-sm">+91 {whatsappNumber}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        Active Channel
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600 font-semibold mt-0.5">No separate WhatsApp number configured</p>
                  )}
                </div>

                {!isEditingWhatsapp && (
                  <div className="flex items-center gap-1.5">
                    {whatsappNumber ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setTempWhatsapp(whatsappNumber);
                            setIsEditingWhatsapp(true);
                          }}
                          className="text-slate-700 border-slate-300"
                        >
                          Edit
                        </Button>
                        <button
                          onClick={handleDeleteWhatsapp}
                          title="Remove WhatsApp Number"
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setTempWhatsapp(defaultLoginMobile);
                          setIsEditingWhatsapp(true);
                        }}
                      >
                        Add WhatsApp
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Editing Form */}
            {isEditingWhatsapp && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enter 10-Digit Indian WhatsApp Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={tempWhatsapp}
                      onChange={(e) => setTempWhatsapp(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <button
                      type="button"
                      onClick={handleUseLoginMobile}
                      className="text-[11px] font-bold text-brand-600 hover:underline"
                    >
                      Use same as Login Mobile ({defaultLoginMobile})
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">10 digits</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    loading={savingWhatsapp}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                    onClick={handleSaveWhatsapp}
                  >
                    Save & Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingWhatsapp(false)}
                    className="border-slate-300 text-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Consent Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.receiveWhatsapp}
              onChange={() => handleTogglePref('receiveWhatsapp')}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-extrabold text-slate-900 block">
                Receive WhatsApp Notifications
              </span>
              <p className="text-slate-600 mt-0.5">
                Authorize ZYZU'S to deliver attendance check-ins, tutor matching status, allotted teacher notes, and payment receipts directly via WhatsApp.
              </p>
            </div>
          </label>
        </Card>

        {/* SECTION 2: PASSWORD CHANGE */}
        <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Account Security</h3>
              <p className="text-xs text-slate-500">Update your student portal login credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="New Password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={savingPassword} className="w-full">
              Update Account Password
            </Button>
          </form>
        </Card>
      </div>

      {/* SECTION 3: GRANULAR NOTIFICATION CHANNELS & PREFERENCES */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Notification Preferences & Alerts</h3>
              <p className="text-xs text-slate-500">Choose exactly which updates you wish to receive via SMS and Email</p>
            </div>
          </div>

          <Button
            size="sm"
            loading={savingPrefs}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveAllPreferences}
          >
            Save Alert Preferences
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SMS Transactional */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">SMS Alerts</span>
              </div>
              <p className="text-sm font-bold text-slate-950">Instant SMS Notifications</p>
              <p className="text-xs text-slate-500">
                Receive transactional SMS for biometric library check-ins and tutor emergency reschedule alerts.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.smsNotifications}
              onChange={() => handleTogglePref('smsNotifications')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Email Invoices */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Billing & Tax</span>
              </div>
              <p className="text-sm font-bold text-slate-950">Official Invoices & Receipts</p>
              <p className="text-xs text-slate-500">
                Receive computer-generated corporate tax receipts and fee vouchers directly to your inbox.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.emailReceipts}
              onChange={() => handleTogglePref('emailReceipts')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Booking Confirmations */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Passes</span>
              </div>
              <p className="text-sm font-bold text-slate-950">Desk & Shift Confirmations</p>
              <p className="text-xs text-slate-500">
                Digital pass issued instantly upon completing library seat reservation with QR access code.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.bookingConfirmations}
              onChange={() => handleTogglePref('bookingConfirmations')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Attendance Alerts */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Biometrics</span>
              </div>
              <p className="text-sm font-bold text-slate-950">Turnstile Entry & Exit Alerts</p>
              <p className="text-xs text-slate-500">
                Real-time timestamps when student logs into study library or when home tutor starts the session.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.attendanceAlerts}
              onChange={() => handleTogglePref('attendanceAlerts')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Tutor Updates */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Tutor Matching</span>
              </div>
              <p className="text-sm font-bold text-slate-950">District Admin Allotments</p>
              <p className="text-xs text-slate-500">
                Notifications when a verified educator is shortlisted and approved for your home tuition request.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.tutorUpdates}
              onChange={() => handleTogglePref('tutorUpdates')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Renewal Reminders */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Renewals</span>
              </div>
              <p className="text-sm font-bold text-slate-950">Desk & Monthly Tuition Renewals</p>
              <p className="text-xs text-slate-500">
                Gentle reminders 3 days before your library pass or monthly tuition cycle expires.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.libraryRenewals}
              onChange={() => handleTogglePref('libraryRenewals')}
              className="w-5 h-5 mt-1 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* SECTION 4: DATA EXPORT & SECURITY */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-950">Data Portability & Compliance</h3>
            <p className="text-xs text-slate-500">ZYZU'S Data Protection Standards</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <h4 className="text-sm font-bold text-slate-950">Export Student Profile & Academic History</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Download your complete enrollment profile, attendance ledger, booking passes, and invoice records in open JSON format.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportData}
            isLoading={isExporting}
            className="text-slate-700 border-slate-300 shrink-0 hover:bg-slate-100"
          >
            {isExporting ? 'Preparing File...' : 'Export All Data (.JSON)'}
          </Button>
        </div>
      </Card>

    </div>
  );
};
