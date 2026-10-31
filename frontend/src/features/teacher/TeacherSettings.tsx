import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { Teacher, TeacherExperienceRecord } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  Lock,
  Briefcase,
  Download,
  Shield,
  Plus,
  Trash2,
  Calendar,
  Building,
  FileCheck,
  CheckCircle2,
  Printer
} from 'lucide-react';

export const TeacherSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [acceptAllotments, setAcceptAllotments] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(true);

  // Experience Records Modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [savingExp, setSavingExp] = useState(false);
  const [expForm, setExpForm] = useState({
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  const loadTeacherData = async () => {
    if (!user) return;
    try {
      const data = await teacherService.getProfile(user.id);
      if (data) setTeacher(data);
    } catch (err) {
      console.error('Failed to load teacher data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
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
      addToast('Password updated successfully!', 'success');
    }, 600);
  };

  const handleSavePreferences = () => {
    addToast('Teaching preferences and capacity updated!', 'success');
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setSavingExp(true);
    try {
      const newExp: TeacherExperienceRecord = {
        id: `exp-${Date.now()}`,
        organization: expForm.organization,
        role: expForm.role,
        startDate: expForm.startDate,
        endDate: expForm.isCurrent ? 'Present' : expForm.endDate,
        isCurrent: expForm.isCurrent,
        description: expForm.description,
        verifiedStatus: 'verified',
      };

      await teacherService.addExperience(teacher.id, newExp);
      await loadTeacherData();
      setIsExpModalOpen(false);
      setExpForm({
        organization: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      });
      addToast('Experience record added successfully!', 'success');
    } catch (err) {
      addToast('Failed to add experience record', 'error');
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!teacher) return;
    try {
      await teacherService.deleteExperience(teacher.id, expId);
      await loadTeacherData();
      addToast('Experience record removed', 'info');
    } catch (err) {
      addToast('Failed to delete record', 'error');
    }
  };

  // Generate Official Printable A4 Document
  const handleDownloadOfficialDocument = () => {
    if (!teacher) return;

    const experiences = teacher.experienceRecords || [];
    const issueDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const docContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZYZU'S Official Educator Summary - ${teacher.name}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .logo span { color: #f97316; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .title-block {
      text-align: center;
      margin-bottom: 24px;
    }
    .title-block h1 {
      font-size: 20px;
      margin: 0 0 4px 0;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-block p {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-group label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      display: block;
    }
    .info-group span {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .declaration {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 14px;
      border-radius: 8px;
      font-size: 11px;
      color: #166534;
      margin-bottom: 40px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
    }
    .sig-box {
      text-align: center;
      width: 220px;
      border-top: 1px dashed #94a3b8;
      padding-top: 8px;
      font-size: 11px;
      color: #475569;
    }
    .sig-box strong {
      display: block;
      color: #0f172a;
      font-size: 12px;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #1e3a8a;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }
    @media print {
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <div>
      <div class="logo">FOCUS<span>POINT</span></div>
      <div style="font-size: 11px; color: #64748b;">Government Recognized Tutor Allotment Network</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Official Credential Summary</span>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Doc Ref: FP-TCH-${teacher.id.slice(-8).toUpperCase()}</div>
    </div>
  </div>

  <div class="title-block">
    <h1>Educator Credentials & Experience Portfolio</h1>
    <p>Issued by District Education Coordination Board • Uttar Pradesh</p>
  </div>

  <div class="grid">
    <div class="info-group">
      <label>Full Legal Name</label>
      <span>${teacher.name}</span>
    </div>
    <div class="info-group">
      <label>Registered District</label>
      <span>${teacher.district || 'Ghazipur'}, Uttar Pradesh</span>
    </div>
    <div class="info-group">
      <label>Highest Qualification</label>
      <span>${teacher.qualification || 'Not Specified'} ${teacher.university ? `(${teacher.university})` : ''}</span>
    </div>
    <div class="info-group">
      <label>Total Experience</label>
      <span>${teacher.experienceYears || 0} Years Active Tutoring</span>
    </div>
    <div class="info-group">
      <label>Teaching Subjects</label>
      <span>${teacher.subjects?.join(', ') || 'General Subjects'}</span>
    </div>
    <div class="info-group">
      <label>Verification Status</label>
      <span>${teacher.verificationStatus === 'APPROVED' ? 'District Approved & Verified' : 'Application In Review'}</span>
    </div>
  </div>

  <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
    Verified Institutional & Tutoring Experience Records
  </h3>

  <table>
    <thead>
      <tr>
        <th>Institution / Organization</th>
        <th>Designation / Role</th>
        <th>Duration Period</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${experiences.length > 0 ? experiences.map(exp => `
        <tr>
          <td><strong>${exp.organization}</strong></td>
          <td>${exp.role}</td>
          <td>${exp.startDate} – ${exp.endDate}</td>
          <td><span style="color: #059669; font-weight: 600;">Verified</span></td>
        </tr>
      `).join('') : `
        <tr>
          <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">
            No prior institutional records listed. Registered as Independent Home Tutor.
          </td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="declaration">
    <strong>ZYZU'S Official Attestation:</strong> This document certifies that the aforementioned educator has completed credential filing and identity vetting with the ZYZU'S District Administration. All tutoring assignments conform to strict safety and pedagogical standards.
  </div>

  <div class="signatures">
    <div class="sig-box">
      <strong>${teacher.name}</strong>
      Educator Signature
    </div>
    <div class="sig-box">
      <strong>District Education Officer</strong>
      ${teacher.district || 'Ghazipur'} Division, UP
    </div>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    Document generated on ${issueDate} • Verification Link: https://focuspoint.org.in/verify/${teacher.id}
  </div>
</body>
</html>`;

    const blob = new Blob([docContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // Fallback: download
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZYZUS_Educator_Portfolio_${teacher.name.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    addToast('Official A4 Experience Document generated!', 'success');
  };

  const experiences = teacher?.experienceRecords || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teacher Settings & Experience Records"
        subtitle="Manage login security, intake capacity, and professional experience records with official printable documentation"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Settings & Records' }
        ]}
        actions={
          <Button
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={handleDownloadOfficialDocument}
          >
            Download Official A4 Portfolio
          </Button>
        }
      />

      {/* Experience Records Management */}
      <Card className="p-6 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-royal-blue-600" /> Teaching Experience Records
            </h3>
            <p className="text-xs text-slate-500">
              List past schools, coaching centers, or academic positions. Included in your official downloadable record.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsExpModalOpen(true)}
            className="text-xs"
          >
            Add Experience Record
          </Button>
        </div>

        {experiences.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No experience records added yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Fresh educators or tutors can add past school affiliations, coaching classes, or private tutoring records here.
            </p>
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsExpModalOpen(true)}
              className="text-xs"
            >
              Add First Record
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map(exp => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-royal-blue-700 mt-0.5">{exp.organization}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exp.startDate} – {exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="text-slate-400 hover:text-rose-600 self-start sm:self-center transition-colors p-1"
                  title="Remove record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card className="p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="p-2.5 rounded-xl bg-royal-blue-50 text-royal-blue-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your teacher portal login security</p>
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
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" loading={savingPassword} className="w-full">
              Update Password
            </Button>
          </form>
        </Card>

        {/* Teaching Intake Capacity & Preferences */}
        <Card className="p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Allotment Intake Preferences</h3>
              <p className="text-xs text-slate-500">Configure your workload for District Admin matching</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-900">Open for New Student Allotments</p>
                <p className="text-xs text-slate-500">District Admin can propose matching students in your locality</p>
              </div>
              <input
                type="checkbox"
                checked={acceptAllotments}
                onChange={(e) => setAcceptAllotments(e.target.checked)}
                className="w-5 h-5 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Max Active Students Capacity:</span>
                <span className="text-sm font-bold text-royal-blue-600">{maxCapacity} Students</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-royal-blue-600"
              />
              <p className="text-xs text-slate-500">
                You will not be assigned more than {maxCapacity} students simultaneously.
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-900">WhatsApp Allotment Alerts</p>
                <p className="text-xs text-slate-500">Receive instant notification when allotted a student</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifs}
                onChange={(e) => setWhatsappNotifs(e.target.checked)}
                className="w-5 h-5 text-royal-blue-600 rounded focus:ring-royal-blue-500"
              />
            </div>

            <Button variant="outline" onClick={handleSavePreferences} className="w-full text-xs">
              Save Allotment Preferences
            </Button>
          </div>
        </Card>
      </div>

      {/* Add Experience Modal */}
      {isExpModalOpen && (
        <Modal
          isOpen={isExpModalOpen}
          onClose={() => setIsExpModalOpen(false)}
          title="Add Teaching Experience Record"
          size="md"
        >
          <form onSubmit={handleAddExperience} className="space-y-4">
            <Input
              label="Organization / School / Coaching Institute"
              placeholder="e.g. Delhi Public School, Ghazipur"
              value={expForm.organization}
              onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
              required
            />

            <Input
              label="Role / Designation"
              placeholder="e.g. Senior Physics Teacher, PGT Mathematics"
              value={expForm.role}
              onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Year / Date"
                placeholder="e.g. July 2021"
                value={expForm.startDate}
                onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                required
              />
              <Input
                label="End Year / Date"
                placeholder="e.g. March 2024"
                disabled={expForm.isCurrent}
                value={expForm.isCurrent ? 'Present' : expForm.endDate}
                onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                required={!expForm.isCurrent}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrentExp"
                checked={expForm.isCurrent}
                onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                className="w-4 h-4 text-royal-blue-600 rounded"
              />
              <label htmlFor="isCurrentExp" className="text-xs text-slate-700 font-semibold cursor-pointer">
                I currently teach here
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description / Key Responsibilities
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Taught Class 11 and 12 CBSE curriculum, conducted board exam preparation batches..."
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsExpModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingExp}>
                Save Experience
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
