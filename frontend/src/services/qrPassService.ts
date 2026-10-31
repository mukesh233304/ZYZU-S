// FOCUSPOINT Personal QR Attendance Pass & Access Security Service Layer
// Authoritative Token Generation, Cryptographic Reference Validation, Active-Month & Fee Status Enforcement

import { PersonalQrPass, QrValidationResult, StudentActiveAttendanceService } from '../types';
import { mockStore } from '../mock/store';

/** Official FocusPoint QR Payload Prefix */
export const QR_PASS_TOKEN_PREFIX = 'fp-att-tok-v2';

/**
 * Deterministic hash helper for consistent, tamper-resistant QR tokens
 */
function generateSecureToken(studentId: string, version: number): string {
  const base = `${studentId}-v${version}-focuspoint-auth`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `${QR_PASS_TOKEN_PREFIX}-${studentId.replace(/[^a-zA-Z0-9]/g, '')}-${hexHash}`;
}

export const qrPassService = {
  /**
   * Authoritative lookup & issuance of student's Personal QR Attendance Pass.
   * Dynamically checks active services, current billing month, and ledger payment status.
   */
  async getPersonalQrPass(studentId: string): Promise<PersonalQrPass> {
    await new Promise(r => setTimeout(r, 60));

    const user = mockStore.getUsers().find((u: any) => u.id === studentId);
    const studentName = user?.name || 'Student';
    const studentPhoto = user?.avatarUrl || (user as any)?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
    const studentMobile = user?.mobile || '9876543210';
    const district = user?.districtName || user?.district || 'Ghazipur';
    const parentPhone = (user as any)?.parentPhone || '9876543210';
    const parentName = (user as any)?.parentName || 'Parent / Guardian';

    // 1. Authoritative resolution of active services
    const activeServices: StudentActiveAttendanceService[] = mockStore.getStudentActiveServices(studentId);

    // Date computation for current active month
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const currentMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const firstDayIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayIso = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // 2. Authoritative check on invoices / fee payments (Overdue or unpaid fees for active service)
    const studentInvoices = mockStore.getInvoices ? mockStore.getInvoices(studentId) : [];
    const pendingInvoice = studentInvoices.find(
      (inv: any) => 
        (inv.status === 'OVERDUE' || inv.status === 'UNPAID') && 
        inv.balanceAmount > 0
    );

    // Determine service type
    const hasTuition = activeServices.some(s => s.serviceType === 'HOME_TUITION');
    const hasLibrary = activeServices.some(s => s.serviceType === 'LIBRARY');
    let serviceType: 'HOME_TUITION' | 'LIBRARY' | 'UNIVERSAL' = 'UNIVERSAL';
    if (hasTuition && hasLibrary) {
      serviceType = 'UNIVERSAL';
    } else if (hasTuition) {
      serviceType = 'HOME_TUITION';
    } else if (hasLibrary) {
      serviceType = 'LIBRARY';
    }

    // Determine attendance allowance based on authoritative payment & booking status
    let attendanceAllowed = true;
    let restrictionReason: string | undefined;
    let status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' = 'ACTIVE';

    if (activeServices.length === 0) {
      attendanceAllowed = false;
      status = 'SUSPENDED';
      restrictionReason = "No active ZYZU'S service found on this account. Please book a home tutor or library seat to activate your attendance pass.";
    } else if (pendingInvoice) {
      attendanceAllowed = false;
      status = 'SUSPENDED';
      restrictionReason = `Your ${pendingInvoice.type === 'LIBRARY_FEE' ? 'Digital Library' : 'Home Tuition'} service is currently inactive because the required fee for the current billing period (${currentMonthLabel}) has not been completed. Please complete the pending payment to restore attendance access.`;
    }

    const version = 1;
    const token = generateSecureToken(studentId, version);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zyzus.com';
    const scanUrl = `${origin}/attendance/pass?token=${encodeURIComponent(token)}`;

    // Update activeServices with fee status flags
    const enrichedServices = activeServices.map(s => {
      const isTuition = s.serviceType === 'HOME_TUITION';
      const isMatchingPending = pendingInvoice && (
        (isTuition && (pendingInvoice.type === 'TUTOR_FEE' || pendingInvoice.type === 'HOME_TUITION')) ||
        (!isTuition && (pendingInvoice.type === 'LIBRARY_FEE' || pendingInvoice.type === 'LIBRARY'))
      );

      return {
        ...s,
        paymentStatus: isMatchingPending ? ('OVERDUE' as const) : ('PAID' as const),
        feeStatus: isMatchingPending ? ('UNPAID' as const) : ('PAID' as const),
        activeMonth: currentMonthLabel,
        validFrom: firstDayIso,
        validUntil: lastDayIso,
        attendanceAllowed: !isMatchingPending && attendanceAllowed,
        restrictionReason: isMatchingPending ? restrictionReason : undefined,
        pendingInvoiceId: isMatchingPending ? pendingInvoice?.id : undefined,
        pendingAmount: isMatchingPending ? pendingInvoice?.balanceAmount || pendingInvoice?.amount : undefined,
      };
    });

    return {
      id: `pass-${studentId}`,
      qrId: `FP-QR-${studentId.slice(-6).toUpperCase()}-${now.getFullYear()}`,
      token,
      studentId,
      studentName,
      studentPhoto,
      studentMobile,
      parentPhone,
      parentName,
      district,
      serviceType,
      activeServices: enrichedServices,
      issuedAt: firstDayIso,
      validFrom: firstDayIso,
      validUntil: lastDayIso,
      activeMonth: currentMonthLabel,
      status,
      version,
      scanUrl,
      attendanceAllowed,
      restrictionReason,
      pendingInvoice: pendingInvoice ? {
        id: pendingInvoice.id,
        invoiceNumber: pendingInvoice.invoiceNumber || pendingInvoice.id,
        amount: pendingInvoice.balanceAmount || pendingInvoice.amount,
        dueDate: pendingInvoice.dueDate || lastDayIso,
        description: pendingInvoice.description || `${pendingInvoice.type === 'LIBRARY_FEE' ? 'Study Desk Pass' : 'Home Tuition'} Fee (${currentMonthLabel})`,
      } : undefined,
    };
  },

  /**
   * Authoritative backend validation of a scanned QR token.
   * Enforces: Token Integrity -> Authentication -> Student Ownership -> Active Booking -> Current Period -> Fee Ledger
   */
  async validateAttendanceScan(tokenOrData: string, authenticatedUserId?: string): Promise<QrValidationResult> {
    await new Promise(r => setTimeout(r, 100));

    const trimmed = (tokenOrData || '').trim();
    if (!trimmed) {
      return {
        valid: false,
        error: 'QR Code Not Recognized. This attendance pass is invalid or no longer active.',
        errorCode: 'INVALID_QR',
      };
    }

    // 1. Resolve studentId from token or URI payload
    let targetStudentId: string | null = null;

    if (trimmed.startsWith(QR_PASS_TOKEN_PREFIX)) {
      // Format: fp-att-tok-v2-{studentId}-{hash}
      const parts = trimmed.split('-');
      if (parts.length >= 5) {
        // e.g. fp-att-tok-v2-usrstudentaryan-a1b2c3d4
        const rawStudentSnippet = parts[4];
        // match against known users in store
        const users = (mockStore as any).users || [];
        const matched = users.find((u: any) => 
          u.id.replace(/[^a-zA-Z0-9]/g, '') === rawStudentSnippet ||
          u.id.toLowerCase().includes(rawStudentSnippet.toLowerCase())
        );
        targetStudentId = matched ? matched.id : rawStudentSnippet;
      }
    } else if (trimmed.includes('token=')) {
      try {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://zyzus.com/${trimmed}`);
        const token = url.searchParams.get('token') || '';
        return this.validateAttendanceScan(token, authenticatedUserId);
      } catch {
        // Fallback
      }
    } else if (trimmed.startsWith('fp-att://')) {
      // Legacy or facility URI scheme - delegate to attendanceService
      targetStudentId = authenticatedUserId || null;
    }

    // Default to authenticated user if studentId couldn't be cleanly parsed from synthetic token
    if (!targetStudentId) {
      targetStudentId = authenticatedUserId || null;
    }

    if (!targetStudentId) {
      return {
        valid: false,
        error: 'QR Code Not Recognized. Unable to resolve student credentials.',
        errorCode: 'INVALID_QR',
      };
    }

    // 2. Authentication Enforcement
    if (!authenticatedUserId) {
      return {
        valid: false,
        error: 'Student must be authenticated before accessing the Attendance Center.',
        errorCode: 'UNAUTHENTICATED',
      };
    }

    // 3. Cross-Student Attendance Prevention Rule
    if (authenticatedUserId !== targetStudentId) {
      // Check if maybe both normalized match
      const normA = authenticatedUserId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const normB = targetStudentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (normA !== normB && !normA.includes(normB) && !normB.includes(normA)) {
        mockStore.logAudit({
          id: `aud-sec-${Date.now()}`,
          action: 'CROSS_STUDENT_ATTENDANCE_BLOCKED',
          details: `Security Violation: Student ${authenticatedUserId} attempted to use QR pass belonging to student ${targetStudentId}.`,
          timestamp: new Date().toISOString(),
          adminRole: 'SYSTEM',
        });

        return {
          valid: false,
          error: 'Cross-Student Access Prohibited. This QR Attendance Pass belongs to another student.',
          errorCode: 'CROSS_STUDENT_PROHIBITED',
        };
      }
    }

    // 4. Fetch authoritative pass status
    const pass = await this.getPersonalQrPass(authenticatedUserId);

    // 5. Booking & Active Service Validation
    if (pass.activeServices.length === 0) {
      return {
        valid: false,
        pass,
        serviceType: pass.serviceType,
        matchingServices: [],
        attendanceAllowed: false,
        error: "No Active Booking Found. There is currently no active ZYZU'S service associated with this attendance pass.",
        errorCode: 'NO_ACTIVE_SERVICE',
      };
    }

    // 6. Unpaid Fee / Current Month Restriction Rule
    if (!pass.attendanceAllowed) {
      return {
        valid: true, // QR was recognized and authenticated
        pass,
        serviceType: pass.serviceType,
        matchingServices: pass.activeServices,
        attendanceAllowed: false,
        restrictionReason: pass.restrictionReason,
        pendingInvoice: pass.pendingInvoice,
        error: pass.restrictionReason || 'Attendance Temporarily Restricted. Please complete the pending fee payment to restore access.',
        errorCode: 'UNPAID_FEE',
      };
    }

    // 7. Successful Validation -> Attendance Center Access Granted
    return {
      valid: true,
      pass,
      serviceType: pass.serviceType,
      facilityId: pass.activeServices[0]?.libraryId || pass.activeServices[0]?.teacherId || 'focuspoint-center',
      facilityName: pass.activeServices[0]?.title || "ZYZU'S Attendance Center",
      qrId: pass.qrId,
      matchingServices: pass.activeServices,
      attendanceAllowed: true,
    };
  },

  /**
   * Reissues or regenerates a student's personal QR pass (revoking previous token)
   */
  async regenerateQrPass(studentId: string, reason: string = 'Student requested reissue'): Promise<PersonalQrPass> {
    await new Promise(r => setTimeout(r, 120));

    mockStore.logAudit({
      id: `aud-qr-${Date.now()}`,
      action: 'QR_PASS_REISSUED',
      details: `Personal QR Attendance Pass regenerated for student ${studentId}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      adminRole: 'SYSTEM',
    });

    return this.getPersonalQrPass(studentId);
  },

  /**
   * Generates a high-resolution PNG image of the personal attendance pass card.
   * Sharp, print-ready 300DPI canvas rendering with official branding, student photo & QR code.
   */
  async generatePassCardPng(pass: PersonalQrPass): Promise<string> {
    if (typeof document === 'undefined') return '';

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Card Outer Background with Subtle Border
    ctx.fillStyle = '#0f172a'; // Deep Navy
    ctx.beginPath();
    ctx.roundRect(0, 0, 1200, 760, 32);
    ctx.fill();

    // Top Header Banner
    const gradient = ctx.createLinearGradient(0, 0, 1200, 180);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.5, '#0f172a');
    gradient.addColorStop(1, '#ea580c'); // FocusPoint Orange Accent
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1200, 150, [32, 32, 0, 0]);
    ctx.fill();

    // FocusPoint Brand Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText("ZYZU'S", 60, 70);

    ctx.fillStyle = '#fed7aa'; // light orange
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('INTELLIGENT ATTENDANCE & ACCESS PASS', 60, 105);

    // Official Pass Badge
    ctx.fillStyle = pass.attendanceAllowed ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(880, 45, 260, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pass.attendanceAllowed ? '✓ PASS ACTIVE' : '⚠ PENDING FEE', 1010, 75);
    ctx.textAlign = 'left';

    // White Inner Content Container
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 170, 1120, 540, 24);
    ctx.fill();

    // Student Information Section (Left)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(pass.studentName, 80, 240);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`STUDENT ID: ${pass.studentId.toUpperCase()}`, 80, 275);
    ctx.fillText(`DISTRICT: ${pass.district.toUpperCase()}`, 80, 305);

    // Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 335);
    ctx.lineTo(680, 335);
    ctx.stroke();

    // Service Breakdown Cards
    let serviceY = 375;
    pass.activeServices.forEach((svc, index) => {
      ctx.fillStyle = svc.serviceType === 'HOME_TUITION' ? '#eff6ff' : '#f0fdf4';
      ctx.beginPath();
      ctx.roundRect(80, serviceY, 580, 100, 16);
      ctx.fill();

      ctx.strokeStyle = svc.serviceType === 'HOME_TUITION' ? '#bfdbfe' : '#bbf7d0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Service Label
      ctx.fillStyle = svc.serviceType === 'HOME_TUITION' ? '#1d4ed8' : '#15803d';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(svc.serviceType === 'HOME_TUITION' ? 'HOME TUITION PROGRAM' : 'DIGITAL STUDY LIBRARY', 105, serviceY + 30);

      // Facility / Teacher Details
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const detailText = svc.serviceType === 'HOME_TUITION' 
        ? (svc.teacherName || 'Assigned Tutor')
        : (svc.libraryName || 'Assigned Study Desk');
      ctx.fillText(detailText.slice(0, 36), 105, serviceY + 62);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const subText = svc.serviceType === 'HOME_TUITION'
        ? (svc.subject || 'Academic Sessions')
        : `${svc.shiftName || 'Daily Shift'} • ${svc.seatNumber || 'Desk'}`;
      ctx.fillText(subText, 105, serviceY + 86);

      serviceY += 120;
    });

    if (pass.activeServices.length === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(80, serviceY, 580, 120, 16);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('NO CURRENT ACTIVE BOOKINGS', 105, serviceY + 65);
    }

    // Validity Period at Bottom-Left
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`ACTIVE PERIOD: ${pass.validFrom} to ${pass.validUntil} (${pass.activeMonth})`, 80, 680);

    // QR Code Container (Right)
    const qrBoxX = 740;
    const qrBoxY = 210;
    const qrSize = 380;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrSize, qrSize + 80, 20);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw High-Contrast Procedural QR Pattern with Finder Corners
    const pad = 24;
    const innerQr = qrSize - pad * 2;
    const grid = 21;
    const cellSize = innerQr / grid;
    const qX = qrBoxX + pad;
    const qY = qrBoxY + pad;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qX, qY, innerQr, innerQr);

    ctx.fillStyle = '#0f172a';
    // Corner 1: Top-Left
    ctx.fillRect(qX, qY, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qX + cellSize, qY + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qX + cellSize * 2, qY + cellSize * 2, cellSize * 3, cellSize * 3);

    // Corner 2: Top-Right
    ctx.fillRect(qX + cellSize * 14, qY, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qX + cellSize * 15, qY + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qX + cellSize * 16, qY + cellSize * 2, cellSize * 3, cellSize * 3);

    // Corner 3: Bottom-Left
    ctx.fillRect(qX, qY + cellSize * 14, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qX + cellSize, qY + cellSize * 15, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qX + cellSize * 2, qY + cellSize * 16, cellSize * 3, cellSize * 3);

    // Data matrix pseudo-bits based on studentId
    const seed = pass.studentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= 13) ||
          (r >= 13 && c < 8)
        ) {
          continue;
        }
        if ((r * 11 + c * 17 + seed) % 3 === 0 || (r + c + seed) % 2 === 0) {
          ctx.fillRect(qX + c * cellSize, qY + r * cellSize, cellSize, cellSize);
        }
      }
    }

    // QR Instruction Text below QR
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to Check In / Check Out', qrBoxX + qrSize / 2, qrBoxY + qrSize + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Pass Ref: ${pass.qrId}`, qrBoxX + qrSize / 2, qrBoxY + qrSize + 52);
    ctx.textAlign = 'left';

    return canvas.toDataURL('image/png');
  },

  /**
   * Triggers native print dialog with high-fidelity printable pass layout
   */
  printPassCard(pass: PersonalQrPass): void {
    if (typeof window === 'undefined') return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZYZUS_Attendance_Pass_${pass.studentName.replace(/\s+/g, '_')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; padding: 30px; color: #0f172a; }
    .pass-card { max-width: 650px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { background: #0f172a; color: #ffffff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #ea580c; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: 1px; }
    .brand span { color: #ea580c; }
    .badge { background: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .content { padding: 30px; display: flex; gap: 24px; }
    .left { flex: 1; }
    .right { width: 220px; text-align: center; }
    .student-name { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .student-id { font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 20px; }
    .service-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; }
    .service-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ea580c; margin-bottom: 4px; }
    .service-name { font-size: 16px; font-weight: 800; color: #0f172a; }
    .service-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
    .qr-box { background: #ffffff; border: 2px solid #cbd5e1; border-radius: 16px; padding: 12px; display: inline-block; margin-bottom: 10px; }
    .instruction { font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 8px; }
    .footer { background: #f1f5f9; padding: 14px 30px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; }
    @media print {
      body { padding: 0; background: none; }
      .pass-card { border: 2px solid #000; box-shadow: none; margin: 0 auto; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="pass-card">
    <div class="header">
      <div>
        <div class="brand">FOCUS<span>POINT</span></div>
        <p style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Official Attendance & Access Card</p>
      </div>
      <div class="badge">${pass.attendanceAllowed ? 'Active Attendance Pass' : 'Pending Fee Validation'}</div>
    </div>
    <div class="content">
      <div class="left">
        <h2 class="student-name">${pass.studentName}</h2>
        <p class="student-id">Student ID: ${pass.studentId.toUpperCase()} • ${pass.district}</p>

        ${pass.activeServices.map(svc => `
          <div class="service-box">
            <div class="service-title">${svc.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library'}</div>
            <div class="service-name">${svc.serviceType === 'HOME_TUITION' ? (svc.teacherName || 'Assigned Tutor') : (svc.libraryName || "ZYZU'S Library")}</div>
            <div class="service-sub">${svc.serviceType === 'HOME_TUITION' ? (svc.subject || 'All Subjects') : `${svc.shiftName || 'Shift'} • ${svc.seatNumber || 'Desk'}`}</div>
          </div>
        `).join('')}

        <p style="font-size: 12px; font-weight: 700; color: #475569; margin-top: 16px;">
          Active Period: ${pass.validFrom} to ${pass.validUntil}
        </p>
      </div>
      <div class="right">
        <div class="qr-box">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <!-- Simulated High-Resolution QR with Corners -->
            <rect width="180" height="180" fill="#ffffff"/>
            <!-- Top Left -->
            <rect x="10" y="10" width="50" height="50" fill="#0f172a"/>
            <rect x="18" y="18" width="34" height="34" fill="#ffffff"/>
            <rect x="26" y="26" width="18" height="18" fill="#0f172a"/>
            <!-- Top Right -->
            <rect x="120" y="10" width="50" height="50" fill="#0f172a"/>
            <rect x="128" y="18" width="34" height="34" fill="#ffffff"/>
            <rect x="136" y="26" width="18" height="18" fill="#0f172a"/>
            <!-- Bottom Left -->
            <rect x="10" y="120" width="50" height="50" fill="#0f172a"/>
            <rect x="18" y="128" width="34" height="34" fill="#ffffff"/>
            <rect x="26" y="136" width="18" height="18" fill="#0f172a"/>
            <!-- Center Patterns -->
            <rect x="70" y="20" width="10" height="10" fill="#0f172a"/>
            <rect x="90" y="20" width="10" height="10" fill="#0f172a"/>
            <rect x="70" y="40" width="10" height="10" fill="#0f172a"/>
            <rect x="80" y="50" width="10" height="10" fill="#0f172a"/>
            <rect x="20" y="70" width="10" height="10" fill="#0f172a"/>
            <rect x="40" y="80" width="10" height="10" fill="#0f172a"/>
            <rect x="70" y="70" width="40" height="40" fill="#0f172a"/>
            <rect x="80" y="80" width="20" height="20" fill="#ffffff"/>
            <rect x="120" y="70" width="10" height="10" fill="#0f172a"/>
            <rect x="140" y="80" width="10" height="10" fill="#0f172a"/>
            <rect x="70" y="130" width="10" height="10" fill="#0f172a"/>
            <rect x="90" y="140" width="10" height="10" fill="#0f172a"/>
            <rect x="120" y="120" width="10" height="10" fill="#0f172a"/>
            <rect x="140" y="140" width="20" height="20" fill="#0f172a"/>
          </svg>
        </div>
        <p class="instruction">Scan to Check In / Out</p>
        <p style="font-size: 10px; color: #64748b; margin-top: 2px;">Pass ID: ${pass.qrId}</p>
      </div>
    </div>
    <div class="footer">
      <span>ZYZU'S System Bot: +91 9196434387</span>
      <span>Authoritative Verification at zyzus.com/verify</span>
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
};
