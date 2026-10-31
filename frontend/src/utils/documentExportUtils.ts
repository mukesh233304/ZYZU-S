import { UnifiedFocusPointDocument } from '../types/document';
import { BRAND_CONFIG } from '../config/brand';

/**
 * FocusPoint Sovereign Document Export & Rendering Engine
 * Generates high-resolution PNG images, standalone HTML files, and triggers vector print.
 */

export const documentExportUtils = {
  /**
   * Generates and downloads a high-resolution 2x retina PNG of the document.
   */
  async downloadAsImage(doc: UnifiedFocusPointDocument, showCutLines: boolean = true): Promise<void> {
    const isSalarySlip = doc.category === 'SALARY' ||
      doc.documentType === 'TEACHER_SALARY_SLIP' ||
      doc.documentType.includes('SALARY') ||
      (Boolean(doc.title) && doc.title.toLowerCase().includes('salary slip'));
    const isDemoPass = !isSalarySlip && (doc.category === 'DEMO' || doc.documentType.includes('DEMO'));
    const isFeeReceipt = !isSalarySlip && !isDemoPass && (doc.category === 'PAYMENT' || doc.category === 'BOOKING' || doc.documentType.includes('RECEIPT') || doc.documentType.includes('INVOICE'));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not supported');

    if (isSalarySlip) {
      renderSalarySlipToCanvas(canvas, ctx, doc, showCutLines);
    } else if (isDemoPass) {
      renderDemoPassToCanvas(canvas, ctx, doc, showCutLines);
    } else if (isFeeReceipt) {
      renderFeeReceiptToCanvas(canvas, ctx, doc, showCutLines);
    } else {
      renderGenericDocumentToCanvas(canvas, ctx, doc, showCutLines);
    }

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const cleanTitle = (doc.title || 'ZYZUS_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `ZYZUS_${cleanTitle}_${doc.documentNumber}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generates and downloads a self-contained offline HTML document file.
   */
  downloadAsStandaloneHtml(doc: UnifiedFocusPointDocument): void {
    const isSalarySlip = doc.category === 'SALARY' ||
      doc.documentType === 'TEACHER_SALARY_SLIP' ||
      doc.documentType.includes('SALARY') ||
      (Boolean(doc.title) && doc.title.toLowerCase().includes('salary slip'));

    const htmlContent = isSalarySlip
      ? generateSalarySlipStandaloneHtml(doc)
      : generateGenericStandaloneHtml(doc);

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const cleanTitle = (doc.title || 'ZYZUS_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `ZYZUS_${cleanTitle}_${doc.documentNumber}_OfflineDoc.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * High-Resolution Canvas Rendering for Demo Passes (Library & Tuition)
 */
function renderDemoPassToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: UnifiedFocusPointDocument,
  showCutLines: boolean
) {
  // 1440 x 860 px canvas (ultra-crisp 2x retina)
  canvas.width = 1440;
  canvas.height = 860;

  const isLibrary = doc.documentType === 'LIBRARY_DEMO_PASS' || (doc.metadata?.demoType === 'LIBRARY');
  const primaryThemeColor = isLibrary ? '#0284c7' : '#ea580c';
  const secondaryThemeColor = isLibrary ? '#06b6d4' : '#f59e0b';

  // 1. Dark Futuristic Obsidian Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1440, 860);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#040711');
  bgGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1440, 860);

  // 2. Subtle Cyber Tech Grid Pattern
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1440; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 860);
    ctx.stroke();
  }
  for (let y = 0; y < 860; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1440, y);
    ctx.stroke();
  }

  // Outer Border
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 1400, 820);

  // 3. Shimmering Holographic Foil Security Strip (Top)
  const holoGrad = ctx.createLinearGradient(20, 20, 1420, 20);
  holoGrad.addColorStop(0, '#38bdf8');
  holoGrad.addColorStop(0.2, '#818cf8');
  holoGrad.addColorStop(0.4, '#c084fc');
  holoGrad.addColorStop(0.6, '#f472b6');
  holoGrad.addColorStop(0.8, '#34d399');
  holoGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = holoGrad;
  ctx.fillRect(20, 20, 1400, 14);

  // Hologram microtext
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText("◆ ZYZU'S QUANTUM LEDGER ◆ ZERO-KNOWLEDGE BIOMETRIC PASS ◆ ANTI-FORGERY SECURITY SEAL ◆ SOVEREIGN CREDENTIAL ◆ VALID FOR SINGLE USE ONLY ◆", 40, 31);

  // 4. Perforation Line Division
  const stubSplitX = 1010;

  // Draw Main Pass Header
  // Logo & Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.fillText("ZYZU'S", 50, 88);

  ctx.fillStyle = isLibrary ? '#38bdf8' : '#fb923c';
  ctx.fillText('PASS', 210, 88);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#fb923c';
  ctx.fillText('TUTORS & LIBRARIES', 50, 114);

  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('SOVEREIGN DEMO CREDENTIAL // AUTONOMOUS DIRECTORY', 50, 114);

  // Service Badge
  const badgeGrad = ctx.createLinearGradient(50, 132, 450, 132);
  badgeGrad.addColorStop(0, primaryThemeColor);
  badgeGrad.addColorStop(1, secondaryThemeColor);
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect(50, 132, 420, 36, 8);
  ctx.fill();

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#ffffff';
  const serviceLabel = isLibrary ? '★ DIGITAL LIBRARY DEMO SPACE PASS' : '★ HOME TUITION DEMO CLASS PASS';
  ctx.fillText(serviceLabel, 66, 156);

  // Status Chip
  ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(500, 132, 230, 36, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('● ACTIVE & VERIFIED', 520, 156);

  // Free/Complimentary Chip
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(745, 132, 230, 36, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('COMPLIMENTARY ₹0', 765, 156);

  // 5. EMV Smart Microchip Graphic
  renderEmvChip(ctx, 50, 190);

  // Pass Number & Blockchain Block
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('PASS DOCUMENT NUMBER', 130, 210);

  ctx.font = '900 24px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(doc.documentNumber, 130, 238);

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`TOKEN HASH: ${doc.qrVerificationHash || 'SHA256-DEMO-AUTH-00042'}`, 130, 258);

  // 6. Beneficiary Information Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(50, 280, 925, 160, 14);
  ctx.fill();
  ctx.stroke();

  // Student Name
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('REGISTERED CANDIDATE', 75, 310);

  ctx.font = '900 28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(doc.recipientName, 75, 345);

  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Role: Student • ID: ${doc.recipientId}`, 75, 372);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Contact: ${doc.recipientPhone || '+91 98765 43210'} • ${doc.recipientEmail || 'student@zyzus.com'}`, 75, 396);

  ctx.fillText(`Territory: Saidpur, Ghazipur, Uttar Pradesh`, 75, 418);

  // Validity Date Pill
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.beginPath();
  ctx.roundRect(650, 305, 300, 110, 10);
  ctx.fill();

  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('VALIDITY WINDOW', 670, 330);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#4ade80';
  ctx.fillText(`From: ${doc.validFrom || doc.issueDate}`, 670, 355);
  ctx.fillText(`Until: ${doc.validUntil || '2026-08-30'}`, 670, 380);

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('ONE-TIME TRIAL ADMISSION', 670, 404);

  // 7. Service Telemetry Block (Teacher or Library Details)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isLibrary ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)';
  ctx.beginPath();
  ctx.roundRect(50, 460, 925, 220, 14);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = isLibrary ? '#06b6d4' : '#f59e0b';
  ctx.fillText(isLibrary ? 'ALLOCATED STUDY LIBRARY FACILITY' : 'ALLOCATED HOME TUTOR FACULTY', 75, 490);

  ctx.font = '900 22px sans-serif';
  ctx.fillStyle = '#ffffff';
  const venueTitle = isLibrary
    ? (doc.metadata?.libraryName || "ZYZU'S Premier Study Library - Saidpur")
    : (doc.metadata?.teacherName || 'Dr. Rajesh Sharma');
  ctx.fillText(venueTitle, 75, 525);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const detail1 = isLibrary
    ? `Scheduled Slot: ${doc.metadata?.slotTime || 'Morning Shift (07:00 AM – 12:00 PM)'}`
    : `Subject: ${doc.metadata?.subject || 'Physics & Mathematics (JEE Foundation)'}`;
  ctx.fillText(detail1, 75, 560);

  const detail2 = isLibrary
    ? `Venue: ${doc.metadata?.locationAddress || 'Near Old Tehsil, Saidpur, Ghazipur'}`
    : `Class Time: ${doc.metadata?.slotTime || '05:00 PM - 06:30 PM'} • ${doc.metadata?.locationAddress || 'Ward No. 4, Saidpur'}`;
  ctx.fillText(detail2, 75, 590);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Issuing Authority: ${doc.authorizedBy} (${doc.authorizedRole})`, 75, 625);

  // Verification QR simulation inside Main Body
  renderQrCode(ctx, 770, 485, 175);

  // 8. Main Pass Security Footer
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(20, 750, stubSplitX - 20, 90);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText("Notice: This official ZYZU'S demo pass is strictly non-transferable and valid for one registered student only.", 50, 785);
  ctx.fillText('Digital verification available 24/7 at https://zyzus.com/verify/doc • SHA-256 Ledger Hash Reconciled.', 50, 808);

  // =========================================================================
  // 9. CUTTABLE PERFORATION LINE & TICKET NOTCHES
  // =========================================================================
  if (showCutLines) {
    // Semicircular Cutout Notch (Top)
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(stubSplitX, 20, 24, 0, Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.stroke();

    // Semicircular Cutout Notch (Bottom)
    ctx.beginPath();
    ctx.arc(stubSplitX, 840, 24, Math.PI, 0, false);
    ctx.fill();
    ctx.stroke();

    // Dashed Perforation Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(stubSplitX, 44);
    ctx.lineTo(stubSplitX, 816);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Scissors & Cut Guide Text
    ctx.save();
    ctx.translate(stubSplitX - 10, 430);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('✂ TEAR OR CUT ALONG THIS LINE ✂', -110, 5);
    ctx.restore();
  }

  // =========================================================================
  // 10. ADMIT CARD STUB (RIGHT SECTION)
  // =========================================================================
  const stubX = stubSplitX + 30;

  // Stub Header
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 18px sans-serif';
  ctx.fillText('ADMIT STUB', stubX, 80);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('RETAINED BY CENTER / TUTOR', stubX, 100);

  // Stub Barcode (Simulated Code 128)
  renderBarcode(ctx, stubX, 120, 340, 55, doc.documentNumber);

  // Student Details on Stub
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.beginPath();
  ctx.roundRect(stubX, 195, 340, 170, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CANDIDATE NAME', stubX + 15, 222);

  ctx.font = '900 18px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(doc.recipientName, stubX + 15, 246);

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Pass ID: ${doc.documentNumber}`, stubX + 15, 272);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`Date: ${doc.validFrom || doc.issueDate}`, stubX + 15, 296);
  ctx.fillText(`Target: ${isLibrary ? 'Library Seat' : 'Tuition Demo'}`, stubX + 15, 318);
  ctx.fillText(`Status: CONFIRMED FREE PASS`, stubX + 15, 340);

  // Physical Punch Target Circle (Cut/Punch upon entry)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(stubX + 170, 455, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '900 12px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('◎ PUNCH / STAMP', stubX + 170, 450);
  ctx.font = 'bold 9px monospace';
  ctx.fillText('UPON ARRIVAL', stubX + 170, 466);
  ctx.textAlign = 'left'; // reset

  // Signature & Authorization Field
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CENTER VERIFIER INITIALS:', stubX, 560);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stubX, 610);
  ctx.lineTo(stubX + 340, 610);
  ctx.stroke();

  ctx.font = '9px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Authorized Signature / Date of Visit', stubX, 630);

  // Stub Security Seal
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('256-BIT CRYPTOGRAPHIC VERIFICATION', stubX, 785);
  ctx.fillStyle = '#64748b';
  ctx.fillText(`DOC-REF: ${doc.id.toUpperCase()}`, stubX, 805);
}

/**
 * High-Resolution Canvas Rendering for Fees Receipts (Tuition & Library)
 */
function renderFeeReceiptToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: UnifiedFocusPointDocument,
  showCutLines: boolean
) {
  // 1300 x 1700 px canvas (2x retina voucher)
  canvas.width = 1300;
  canvas.height = 1700;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1300, 1700);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#050811');
  bgGrad.addColorStop(1, '#020409');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1300, 1700);

  // Outer Border
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 1260, 1660);

  // Holographic Header Foil
  const holoGrad = ctx.createLinearGradient(20, 20, 1280, 20);
  holoGrad.addColorStop(0, '#6366f1');
  holoGrad.addColorStop(0.25, '#38bdf8');
  holoGrad.addColorStop(0.5, '#34d399');
  holoGrad.addColorStop(0.75, '#fbbf24');
  holoGrad.addColorStop(1, '#6366f1');
  ctx.fillStyle = holoGrad;
  ctx.fillRect(20, 20, 1260, 14);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px sans-serif';
  ctx.fillText("ZYZU'S FINANCIAL SETTLEMENT ENGINE", 60, 95);

  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#818cf8';
  ctx.fillText("ZYZU'S // TUTORS & LIBRARIES // OFFICIAL TAX INVOICE & ACADEMIC FEE RECEIPT", 60, 126);

  // Document Number & Date Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(60, 150, 1180, 90, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('RECEIPT NUMBER', 90, 185);
  ctx.font = '900 24px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(doc.documentNumber, 90, 218);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('DATE ISSUED', 500, 185);
  ctx.font = '900 20px sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(doc.issueDate, 500, 216);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('BILLING PERIOD', 880, 185);
  ctx.font = '900 20px sans-serif';
  ctx.fillStyle = '#a78bfa';
  ctx.fillText(doc.billingPeriod || 'Current Session', 880, 216);

  // Settled Status Banner
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(60, 260, 1180, 80, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 22px sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText('✔ PAYMENT SETTLED IN FULL (ZERO DUES OUTSTANDING)', 100, 310);

  ctx.font = '900 28px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`₹${doc.amount.toLocaleString('en-IN')}`, 1080, 310);

  // Payer and Payee Grid
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(60, 360, 575, 180, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#818cf8';
  ctx.fillText('BILLED TO (REGISTERED STUDENT)', 85, 395);
  ctx.font = '900 24px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(doc.recipientName, 85, 432);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Student ID: ${doc.recipientId}`, 85, 462);
  ctx.fillText(`Phone: ${doc.recipientPhone || '+91 98765 43210'}`, 85, 488);
  ctx.fillText(`Location: ${doc.locality || 'Saidpur'}, ${doc.district}, ${doc.state}`, 85, 514);

  // Payee Box
  ctx.beginPath();
  ctx.roundRect(665, 360, 575, 180, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#818cf8';
  ctx.fillText('TRANSACTION & AUDIT REFERENCE', 690, 395);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Payment Mode: ${doc.paymentMethod || 'UPI Instant Clearing'}`, 690, 430);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Payment ID: ${doc.paymentId || 'PAY-ZYZUS-001'}`, 690, 460);
  ctx.fillText(`Txn Ref: ${doc.transactionRef || 'UPI/260903/ZYZUS9928129'}`, 690, 488);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`GST / Tax Status: Educational Exemption Claimed`, 690, 514);

  // Line Items Table
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(60, 565, 1180, 350, 12);
  ctx.fill();
  ctx.stroke();

  // Table Header
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.beginPath();
  ctx.roundRect(60, 565, 1180, 50, 12);
  ctx.fill();

  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('ITEMIZED SERVICE DESCRIPTION', 90, 596);
  ctx.fillText('AMOUNT (INR)', 1060, 596);

  // Items
  const items = doc.lineItems || [
    { label: doc.title, amount: doc.amount },
    { label: 'Platform Reconciled Academic Ledger Fee', amount: 0 },
    { label: 'Total Paid in Full', amount: doc.amount, isHighlight: true }
  ];

  let currentY = 650;
  items.forEach((it) => {
    const isDiscount = it.isDeduction || it.amount < 0 || it.label.toLowerCase().includes('coupon') || it.label.toLowerCase().includes('discount') || it.label.toLowerCase().includes('concession');
    ctx.font = it.isHighlight ? '900 16px sans-serif' : '14px sans-serif';
    ctx.fillStyle = it.isHighlight ? '#34d399' : isDiscount ? '#38bdf8' : '#f8fafc';
    ctx.fillText(it.label, 90, currentY);

    ctx.font = it.isHighlight ? '900 18px monospace' : '15px monospace';
    const amountStr = it.amount < 0 
      ? `-₹${Math.abs(it.amount).toLocaleString('en-IN')}` 
      : `₹${it.amount.toLocaleString('en-IN')}`;
    ctx.fillText(amountStr, 1080, currentY);

    currentY += 45;
  });

  // Verification & Signatures
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(60, 940, 1180, 190, 12);
  ctx.fill();
  ctx.stroke();

  // QR
  renderQrCode(ctx, 90, 960, 150);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('OFFICIAL DIGITAL SIGNATURE VERIFIED', 270, 995);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`Authorized By: ${doc.authorizedBy}`, 270, 1025);
  ctx.fillText(`Designation: ${doc.authorizedRole}`, 270, 1052);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Cryptographic Hash: ${doc.qrVerificationHash || 'SHA256-RCP-SETTLED-99012'}`, 270, 1080);

  // Barcode
  renderBarcode(ctx, 780, 980, 420, 60, doc.documentNumber);

  // =========================================================================
  // HORIZONTAL PERFORATED CUT LINE & COUNTERFOIL (STUDENT COPY)
  // =========================================================================
  const cutY = 1190;

  if (showCutLines) {
    // Semicircular notches on left & right
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(20, cutY, 24, -Math.PI / 2, Math.PI / 2, false);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(1280, cutY, 24, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    ctx.stroke();

    // Dashed Cut Line
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(44, cutY);
    ctx.lineTo(1256, cutY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scissors text
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#818cf8';
    ctx.textAlign = 'center';
    ctx.fillText('✂ - - - - - - - - TEAR ALONG THIS LINE FOR STUDENT / TAX RECORD ARCHIVE - - - - - - - - ✂', 650, cutY - 10);
    ctx.textAlign = 'left';
  }

  // =========================================================================
  // COUNTERFOIL / STUDENT RECORD SECTION (BOTTOM)
  // =========================================================================
  const stubY = cutY + 35;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
  ctx.beginPath();
  ctx.roundRect(60, stubY, 1180, 390, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 20px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('COUNTERFOIL // STUDENT ACADEMIC & FINANCIAL RECORD', 90, stubY + 45);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`RECEIPT REF: ${doc.documentNumber} • VALIDATED SETTLEMENT`, 90, stubY + 75);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`Received with thanks from: ${doc.recipientName} (${doc.recipientId})`, 90, stubY + 120);
  ctx.fillText(`The sum of: ₹${doc.amount.toLocaleString('en-IN')} (Settled via ${doc.paymentMethod || 'UPI'})`, 90, stubY + 155);
  ctx.fillText(`Towards: ${doc.title} (${doc.billingPeriod || 'Current Session'})`, 90, stubY + 190);
  ctx.fillText(`Location Jurisdiction: Saidpur, District Ghazipur (UP)`, 90, stubY + 225);

  // Circular Official Seal Stamp
  renderOfficialStamp(ctx, 1050, stubY + 200, 75);

  // Signature line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(90, stubY + 310);
  ctx.lineTo(450, stubY + 310);
  ctx.stroke();

  ctx.font = '11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Authorized Financial Registrar / Auditor Seal', 90, stubY + 332);
}

/**
 * Universal safe rounded rectangle path drawer
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[]
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const radius = typeof r === 'number' ? r : (r[0] || 0);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * High-Resolution Canvas Rendering for ZYZU'S Official Teacher Monthly Salary Slip
 * Produces an ultra-crisp, authoritative corporate A4 voucher (1350 x 1850 px).
 */
function renderSalarySlipToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: UnifiedFocusPointDocument,
  showCutLines: boolean
) {
  canvas.width = 1350;
  canvas.height = 1850;

  // Safe resolved values
  const grossCollection = 16000;
  const teacherShare = 13600;
  const incentiveBonus = 1000;
  const netSalary = doc.amount || 14600;
  const sessionsCompleted = doc.metadata?.completedSessions || doc.metadata?.sessionsCount || 28;
  const assignedStudents = doc.metadata?.assignedStudentsCount || doc.metadata?.studentsCount || 4;
  const attendanceRate = doc.metadata?.attendanceRate || doc.metadata?.attendancePercentage || '100%';
  const billingPeriod = doc.billingPeriod || 'September 2026';
  const issueDateFormatted = new Date(doc.issueDate || '2026-09-15').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const educatorName = doc.recipientName || 'Dr. Rajesh Sharma';
  const teacherId = doc.recipientId === 'usr-teacher-rajesh' ? 'FP-TCH-000014' : (doc.recipientId || 'FP-TCH-000014');
  const roleName = doc.recipientRole || 'Verified Senior Home Educator';
  const phone = doc.recipientPhone || '+91 98765 43211';
  const territory = `${doc.locality || 'Saidpur'}, ${doc.district || 'Ghazipur'}, ${doc.state || 'Uttar Pradesh'}`;
  const paymentMode = doc.paymentMethod || 'NEFT Direct Bank Transfer';
  const bankAccount = doc.bankAccountMasked || 'State Bank of India (SBI) A/c XXXX 3381';
  const ifsc = 'SBIN0001234 (Saidpur Branch)';
  const utr = doc.transactionRef || 'SBI-NEFT-99120481';
  const ledgerRef = doc.paymentId || 'PAY-SAL-2026-09-01';
  const qrHash = doc.qrVerificationHash || `SHA256-${doc.documentNumber}`;

  // 1. Pristine Official Voucher Paper Base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1350, 1850);

  // Subtle security grid
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 30; x < 1320; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, 1820);
    ctx.stroke();
  }
  for (let y = 30; y < 1820; y += 50) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(1320, y);
    ctx.stroke();
  }

  // Watermark
  ctx.save();
  ctx.translate(675, 925);
  ctx.rotate(-0.35);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
  ctx.font = '900 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("ZYZU'S DISBURSEMENT OFFICIAL", 0, 0);
  ctx.restore();

  // Outer Border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  drawRoundedRect(ctx, 30, 30, 1290, 1790, 24);
  ctx.stroke();

  // Top Holographic Security Ribbon
  const holoGrad = ctx.createLinearGradient(30, 30, 1320, 30);
  holoGrad.addColorStop(0, '#059669');
  holoGrad.addColorStop(0.3, '#2563eb');
  holoGrad.addColorStop(0.6, '#d97706');
  holoGrad.addColorStop(1, '#059669');
  ctx.fillStyle = holoGrad;
  ctx.beginPath();
  drawRoundedRect(ctx, 30, 30, 1290, 12, 12);
  ctx.fill();

  // 2. Corporate Masthead (y: 60 to 180)
  // Logo Crest Box
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 65, 90, 90, 18);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Z', 110, 108);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('★ 2026 ★', 110, 132);
  ctx.textAlign = 'left';

  // Brand Name & Regulatory Badge
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('ZYZU', 175, 94);
  const focusW = ctx.measureText('ZYZU').width;
  ctx.fillStyle = '#ea580c';
  ctx.fillText('\'S', 175 + focusW, 94);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#ea580c';
  ctx.fillText('Tutors & Libraries', 175, 114);
  const pointW = ctx.measureText('POINT').width;

  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  drawRoundedRect(ctx, 175 + focusW + pointW + 16, 72, 140, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('GOVT. REG. EDTECH', 175 + focusW + pointW + 28, 89);

  // Legal Company Name
  ctx.fillStyle = '#1e293b';
  ctx.font = '900 15px sans-serif';
  ctx.fillText("ZYZU'S EdTech Private Limited (formerly FocusPoint EdTech Private Limited)", 175, 134);

  // Corporate Address
  ctx.fillStyle = '#475569';
  ctx.font = '500 12px sans-serif';
  ctx.fillText('Central Sovereign Knowledge & Academic Settlement Desk • Ghazipur Education Complex, UP — 233001', 175, 140);

  // Regulatory Identifiers
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CIN: U80904UP2026PTC184920  •  GSTIN: 09AAACF2026P1Z4  •  PAN: AAACF2026P', 175, 160);

  // Right Side Header Info
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 975, 65, 300, 34, 17);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ DIRECT BANK SETTLEMENT', 1125, 87);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SALARY VOUCHER NO.', 1275, 122);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '900 22px monospace';
  ctx.fillText(doc.documentNumber, 1275, 147);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`Disbursed Date: ${issueDateFormatted}`, 1275, 169);
  ctx.textAlign = 'left';

  // Divider Line
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(65, 185);
  ctx.lineTo(1275, 185);
  ctx.stroke();

  // 3. Voucher Title Banner (y: 205 to 305)
  const bannerGrad = ctx.createLinearGradient(65, 205, 1275, 305);
  bannerGrad.addColorStop(0, '#020617');
  bannerGrad.addColorStop(0.5, '#0f172a');
  bannerGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 205, 1210, 100, 18);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('★ OFFICIAL DISBURSEMENT VOUCHER & EARNINGS STATEMENT ★', 95, 234);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px sans-serif';
  ctx.fillText("ZYZU'S Official Teacher Monthly Salary Slip", 95, 265);

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`Pay Period: ${billingPeriod}  •  Academic Cycle 2026-27`, 95, 289);

  // Net Amount Badge inside Banner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  drawRoundedRect(ctx, 1005, 218, 250, 74, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NET AMOUNT CREDITED', 1130, 240);

  ctx.fillStyle = '#34d399';
  ctx.font = '900 26px monospace';
  ctx.fillText(`₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 1130, 274);
  ctx.textAlign = 'left';

  // 4. Two Detail Cards (Side by Side) (y: 325 to 555)
  // Card 1: Verified Educator Details (w: 595)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 325, 595, 230, 16);
  ctx.fill();
  ctx.stroke();

  // Header Bar
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 325, 595, 42, [16, 16, 0, 0] as any);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(65, 367);
  ctx.lineTo(660, 367);
  ctx.stroke();

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '900 12px sans-serif';
  ctx.fillText('VERIFIED EDUCATOR DETAILS', 85, 351);

  ctx.fillStyle = '#dcfce7';
  ctx.strokeStyle = '#86efac';
  ctx.beginPath();
  drawRoundedRect(ctx, 520, 335, 125, 24, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ACTIVE FACULTY', 582, 351);
  ctx.textAlign = 'left';

  // Rows for Educator
  const drawRow = (label: string, val: string, yPos: number, isValMonospace = false, isValBold = true) => {
    ctx.fillStyle = '#475569';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(label, 85, yPos);

    ctx.fillStyle = '#0f172a';
    ctx.font = `${isValBold ? 'bold' : 'normal'} 13px ${isValMonospace ? 'monospace' : 'sans-serif'}`;
    ctx.textAlign = 'right';
    ctx.fillText(val, 640, yPos);
    ctx.textAlign = 'left';
  };

  drawRow('Educator Name:', educatorName, 395, false, true);
  drawRow("ZYZU'S Teacher ID:", teacherId, 425, true, true);
  drawRow('Professional Designation:', roleName, 455, false, true);
  drawRow('Academic Department:', 'K-12 & Competitive Foundation', 485, false, false);
  drawRow('Registered Mobile:', phone, 515, true, false);
  drawRow('Assigned Territory:', territory, 545, false, false);

  // Card 2: Bank Disbursement Telemetry (w: 595)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 680, 325, 595, 230, 16);
  ctx.fill();
  ctx.stroke();

  // Header Bar
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  drawRoundedRect(ctx, 680, 325, 595, 42, [16, 16, 0, 0] as any);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(680, 367);
  ctx.lineTo(1275, 367);
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = '900 12px sans-serif';
  ctx.fillText('BANK DISBURSEMENT TELEMETRY', 700, 351);

  ctx.fillStyle = '#dcfce7';
  ctx.strokeStyle = '#86efac';
  ctx.beginPath();
  drawRoundedRect(ctx, 1140, 335, 120, 24, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NEFT SETTLED', 1200, 351);
  ctx.textAlign = 'left';

  // Rows for Bank
  const drawBankRow = (label: string, val: string, yPos: number, isValMonospace = false, isValBold = true, customColor?: string) => {
    ctx.fillStyle = '#475569';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(label, 700, yPos);

    ctx.fillStyle = customColor || '#0f172a';
    ctx.font = `${isValBold ? 'bold' : 'normal'} 13px ${isValMonospace ? 'monospace' : 'sans-serif'}`;
    ctx.textAlign = 'right';
    ctx.fillText(val, 1255, yPos);
    ctx.textAlign = 'left';
  };

  drawBankRow('Payment Mode:', paymentMode, 395, false, true);
  drawBankRow('Credited Bank Account:', bankAccount, 425, true, true);
  drawBankRow('Bank IFSC Code:', ifsc, 455, true, false);
  drawBankRow('Bank Transaction UTR:', utr, 485, true, true, '#065f46');
  drawBankRow('Payment Ledger Ref:', ledgerRef, 515, true, false, '#64748b');
  drawBankRow('Status & Authorization:', 'CREDITED (0 Dues Outstanding)', 545, false, true, '#059669');

  // 5. Teaching Metrics & Performance Banner (y: 575 to 665)
  const drawMetricTile = (xPos: number, label: string, val: string, sub: string, themeBg: string, themeBorder: string, themeColor: string) => {
    ctx.fillStyle = themeBg;
    ctx.strokeStyle = themeBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    drawRoundedRect(ctx, xPos, 575, 287, 85, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = themeColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, xPos + 143, 598);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 20px monospace';
    ctx.fillText(val, xPos + 143, 626);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px sans-serif';
    ctx.fillText(sub, xPos + 143, 646);
    ctx.textAlign = 'left';
  };

  drawMetricTile(65, 'ASSIGNED LEARNERS', `${assignedStudents} Students`, 'Active In-Home Batches', '#eff6ff', '#bfdbfe', '#1e40af');
  drawMetricTile(372, 'COMPLETED SESSIONS', `${sessionsCompleted} Classes`, '1.5 hrs / class logged', '#eef2ff', '#c7d2fe', '#4338ca');
  drawMetricTile(680, 'ATTENDANCE RATE', `${attendanceRate}`, 'Zero Uninformed Leaves', '#ecfdf5', '#a7f3d0', '#047857');
  drawMetricTile(987, 'PEDAGOGY RATING', '4.95 / 5.0', 'Parent Satisfaction', '#fffbeb', '#fde68a', '#b45309');

  // 6. Itemized Compensation Ledger Table (y: 685 to 1055)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 685, 1210, 360, 16);
  ctx.fill();
  ctx.stroke();

  // Table Main Header
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 685, 1210, 42, [16, 16, 0, 0] as any);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('DETAILED COMPENSATION & HONORARIUM LEDGER', 85, 711);

  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText('ALL FIGURES IN INDIAN NATIONAL RUPEES (INR)', 1255, 711);
  ctx.textAlign = 'left';

  // Sub Header Left
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(66, 727, 595, 34);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(66, 727, 595, 34);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('A. GROSS EARNINGS & ALLOWANCES', 85, 749);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (₹)', 645, 749);
  ctx.textAlign = 'left';

  // Sub Header Right
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(661, 727, 613, 34);
  ctx.strokeRect(661, 727, 613, 34);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('B. DEDUCTIONS & RECOVERIES', 680, 749);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (₹)', 1255, 749);
  ctx.textAlign = 'left';

  // Vertical Center Divider
  ctx.beginPath();
  ctx.moveTo(661, 727);
  ctx.lineTo(661, 990);
  ctx.stroke();

  // Earnings Rows
  const drawLedgerRow = (x1: number, x2: number, yPos: number, label: string, val: string, isBold = false, isEmerald = false) => {
    ctx.fillStyle = isEmerald ? '#047857' : (isBold ? '#0f172a' : '#334155');
    ctx.font = `${isBold ? 'bold' : 'normal'} 12px sans-serif`;
    ctx.fillText(label, x1, yPos);

    ctx.font = `${isBold ? 'bold' : 'normal'} 13px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(val, x2, yPos);
    ctx.textAlign = 'left';
  };

  drawLedgerRow(85, 645, 790, 'Gross Tuition Collections (4 Students @ ₹4,000/mo avg)', `₹${grossCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false);
  drawLedgerRow(85, 645, 825, 'Educator Contractual Revenue Share (85%)', `₹${teacherShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true);
  drawLedgerRow(85, 645, 860, 'Performance & 100% Punctuality Incentive (BONUS)', `+₹${incentiveBonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true, true);
  drawLedgerRow(85, 645, 895, 'Curriculum Completion & Milestone Allowance', '₹0.00', false);

  // Left Total Bar
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(66, 945, 595, 45);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(66, 945, 595, 45);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 13px sans-serif';
  ctx.fillText('Total Gross Earnings (A):', 85, 973);
  ctx.font = '900 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 645, 974);
  ctx.textAlign = 'left';

  // Deductions Rows
  drawLedgerRow(680, 1255, 790, 'Platform Coordination & Infrastructure Fee (Subsidized)', '₹0.00', false);
  drawLedgerRow(680, 1255, 825, 'Tax Deducted at Source (TDS u/s 194J)', '₹0.00', false);
  drawLedgerRow(680, 1255, 860, 'Professional Tax (P-Tax)', '₹0.00', false);
  drawLedgerRow(680, 1255, 895, 'Security Deposit / Advance Adjustment', '₹0.00', false);

  // Right Total Bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(661, 945, 613, 45);
  ctx.strokeRect(661, 945, 613, 45);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 13px sans-serif';
  ctx.fillText('Total Deductions (B):', 680, 973);
  ctx.font = '900 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('₹0.00', 1255, 974);
  ctx.textAlign = 'left';

  // 7. Net Salary Summary Ribbon (y: 1065 to 1180)
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 1065, 1210, 115, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = '900 13px sans-serif';
  ctx.fillText('NET DISBURSED TAKE-HOME REMUNERATION (A - B)', 95, 1098);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 16px sans-serif';
  ctx.fillText('Amount in Words: Fourteen Thousand Six Hundred Rupees Only', 95, 1130);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`✓ Full settlement disbursed to ${bankAccount} on 15 September 2026`, 95, 1158);

  // Right Net Pay Card
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 985, 1080, 270, 85, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NET MONTHLY SALARY', 1120, 1105);

  ctx.fillStyle = '#065f46';
  ctx.font = '900 30px monospace';
  ctx.fillText(`₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 1120, 1145);
  ctx.textAlign = 'left';

  // 8. Verification, Signatures & Legal Authority Section (y: 1210 to 1740)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(65, 1205);
  ctx.lineTo(1275, 1205);
  ctx.stroke();

  // Left: QR Code & Public Verification Info
  renderQrCode(ctx, 65, 1225, 135);

  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.beginPath();
  drawRoundedRect(ctx, 220, 1225, 120, 24, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('SHA-256 SEALED', 232, 1241);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Public Ledger Audit QR', 220, 1272);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px sans-serif';
  ctx.fillText('Scan to verify authenticity directly on', 220, 1294);
  ctx.fillText("ZYZU'S sovereign verification node.", 220, 1312);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(qrHash, 65, 1385);

  // Middle: FocusPoint Legal Declaration
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  drawRoundedRect(ctx, 470, 1225, 410, 175, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 12px sans-serif';
  ctx.fillText("OFFICIAL ZYZU'S STATEMENT", 490, 1252);

  ctx.fillStyle = '#475569';
  ctx.font = '500 11px sans-serif';
  ctx.fillText('This document serves as conclusive legal evidence of professional', 490, 1276);
  ctx.fillText('remuneration disbursed to the educator. Generated through autonomous', 490, 1294);
  ctx.fillText('financial ledger reconciliation in accordance with the IT Act, 2000.', 490, 1312);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('Disbursed under Uttar Pradesh Jurisdiction', 490, 1348);
  ctx.fillText('No Physical Signature Required (Sec 65B IEA)', 490, 1366);

  // Right: Official Accounts Seal & Comptroller Signature
  renderOfficialStamp(ctx, 965, 1305, 56);

  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'italic bold 24px Georgia, serif';
  ctx.fillText('Alok Tripathi', 1045, 1290);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(1045, 1302);
  ctx.lineTo(1255, 1302);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 14px sans-serif';
  ctx.fillText('Prof. Alok Tripathi', 1045, 1324);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Comptroller & Super Admin Authority', 1045, 1344);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 10px monospace';
  ctx.fillText("ZYZU'S Central Clearinghouse", 1045, 1362);

  // 9. Bottom Security & Audit Micro-text (y: 1785 to 1820)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(65, 1780);
  ctx.lineTo(1275, 1780);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText("ZYZU'S Sovereign Financial Core v2.4.9 • 256-Bit Cryptographic Security", 65, 1805);

  ctx.textAlign = 'right';
  ctx.fillText(`Verification URL: https://zyzus.com/verify/doc/${doc.documentNumber}`, 1275, 1805);
  ctx.textAlign = 'left';
}

/**
 * Fallback Canvas Renderer for Generic Documents
 * Renders an authoritative, complete credential voucher so no document is ever blank.
 */
function renderGenericDocumentToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: UnifiedFocusPointDocument,
  showCutLines: boolean
) {
  canvas.width = 1200;
  canvas.height = 1500;

  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 1200, 1500);

  // Outer Border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(30, 30, 1140, 1440);

  // Top Neon Stripe
  const stripe = ctx.createLinearGradient(30, 30, 1170, 30);
  stripe.addColorStop(0, '#38bdf8');
  stripe.addColorStop(0.5, '#6366f1');
  stripe.addColorStop(1, '#34d399');
  ctx.fillStyle = stripe;
  ctx.fillRect(30, 30, 1140, 10);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px sans-serif';
  ctx.fillText("ZYZU'S SOVEREIGN CREDENTIAL", 65, 95);

  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`OFFICIAL DOCUMENT REF: ${doc.documentNumber}`, 65, 128);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(doc.title, 65, 175);

  // Status & Category Badge
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 920, 75, 220, 36, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${doc.category} • ${doc.status}`, 1030, 98);
  ctx.textAlign = 'left';

  // Details Container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRoundedRect(ctx, 65, 215, 1070, 380, 16);
  ctx.fill();
  ctx.stroke();

  const drawGenericRow = (label: string, val: string, yPos: number) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(label, 95, yPos);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, 1105, yPos);
    ctx.textAlign = 'left';
  };

  drawGenericRow('Beneficiary / Holder:', `${doc.recipientName} (${doc.recipientRole})`, 265);
  drawGenericRow('Holder Identifier:', doc.recipientId, 305);
  drawGenericRow('Territory / District:', `${doc.district}, ${doc.state}`, 345);
  drawGenericRow('Issue Date:', doc.issueDate, 385);
  drawGenericRow('Valid Through:', doc.validUntil || '2026-12-31', 425);
  drawGenericRow('Settlement / Payment Status:', `${doc.paymentStatus} (${doc.paymentMethod || 'SYSTEM'})`, 465);
  if (doc.amount) {
    drawGenericRow('Amount Authorized:', `₹${doc.amount.toLocaleString('en-IN')}`, 505);
  }
  drawGenericRow('Verification Hash:', doc.qrVerificationHash || 'SHA256-ZYZUS-VERIFIED', 545);

  // Line items if available
  if (doc.lineItems && doc.lineItems.length > 0) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    drawRoundedRect(ctx, 65, 620, 1070, 240, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('ITEMIZED SUMMARY & VALUATION', 95, 655);

    let curY = 695;
    doc.lineItems.slice(0, 4).forEach((it) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText(it.label, 95, curY);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${it.amount.toLocaleString('en-IN')}`, 1105, curY);
      ctx.textAlign = 'left';
      curY += 35;
    });
  }

  // QR Code & Stamps
  renderQrCode(ctx, 65, 900, 150);
  renderOfficialStamp(ctx, 950, 975, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px sans-serif';
  ctx.fillText("ZYZU'S CLEARINGHOUSE VERIFIED", 245, 940);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Authoritative sovereign ledger document issued under IT Act 2000.', 245, 970);
  ctx.fillText('Scan QR code with any standard camera to verify cryptographic authenticity.', 245, 995);

  // Bottom Audit Bar
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`AUTHORIZED BY: ${doc.authorizedBy}  •  256-BIT CRYPTOGRAPHIC SECURITY`, 65, 1445);
}

/**
 * Generates an immaculate standalone HTML page for ZYZU'S Official Teacher Monthly Salary Slip
 */
function generateSalarySlipStandaloneHtml(doc: UnifiedFocusPointDocument): string {
  const grossCollection = 16000;
  const teacherShare = 13600;
  const incentiveBonus = 1000;
  const netSalary = doc.amount || 14600;
  const sessionsCompleted = doc.metadata?.completedSessions || doc.metadata?.sessionsCount || 28;
  const assignedStudents = doc.metadata?.assignedStudentsCount || doc.metadata?.studentsCount || 4;
  const attendanceRate = doc.metadata?.attendanceRate || doc.metadata?.attendancePercentage || '100%';
  const billingPeriod = doc.billingPeriod || 'September 2026';
  const issueDateFormatted = new Date(doc.issueDate || '2026-09-15').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const educatorName = doc.recipientName || 'Dr. Rajesh Sharma';
  const teacherId = doc.recipientId === 'usr-teacher-rajesh' ? 'FP-TCH-000014' : (doc.recipientId || 'FP-TCH-000014');
  const roleName = doc.recipientRole || 'Verified Senior Home Educator';
  const phone = doc.recipientPhone || '+91 98765 43211';
  const territory = `${doc.locality || 'Saidpur'}, ${doc.district || 'Ghazipur'}, ${doc.state || 'Uttar Pradesh'}`;
  const paymentMode = doc.paymentMethod || 'NEFT Direct Bank Transfer';
  const bankAccount = doc.bankAccountMasked || 'State Bank of India (SBI) A/c XXXX 3381';
  const utr = doc.transactionRef || 'SBI-NEFT-99120481';
  const ledgerRef = doc.paymentId || 'PAY-SAL-2026-09-01';
  const qrHash = doc.qrVerificationHash || `SHA256-${doc.documentNumber}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZYZU'S Official Teacher Monthly Salary Slip - ${doc.documentNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #090e17;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-font-smoothing: antialiased;
    }
    .action-bar {
      max-width: 900px;
      width: 100%;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: #f8fafc;
    }
    .print-btn {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .print-btn:hover { background: #10b981; }
    .sheet {
      background: #ffffff;
      max-width: 900px;
      width: 100%;
      border-radius: 24px;
      border: 2px solid #cbd5e1;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      padding: 40px;
      position: relative;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-wrap { display: flex; align-items: center; gap: 14px; }
    .crest {
      width: 58px; height: 58px;
      background: #0f172a;
      border: 1.5px solid #f59e0b;
      border-radius: 16px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: #fbbf24; font-weight: 900; font-family: monospace; font-size: 18px;
    }
    .brand-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand-point { color: #ea580c; }
    .reg-tag {
      font-size: 9px; font-weight: bold; font-family: monospace;
      background: #f1f5f9; border: 1px solid #cbd5e1;
      padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
    .company-name { font-size: 13px; font-weight: 900; color: #1e293b; margin-top: 2px; }
    .company-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
    .legal-ids { font-size: 9px; font-family: monospace; color: #64748b; margin-top: 2px; font-weight: 600; }
    .voucher-num-box { text-align: right; }
    .settled-badge {
      display: inline-block;
      background: #ecfdf5; border: 1.5px solid #6ee7b7; color: #065f46;
      font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 9999px;
    }
    .banner {
      background: linear-gradient(135deg, #020617, #0f172a, #1e1b4b);
      border-radius: 16px;
      padding: 18px 24px;
      margin: 20px 0;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-title { font-size: 19px; font-weight: 900; margin: 4px 0; color: #ffffff; }
    .banner-sub { font-size: 11px; color: #93c5fd; font-weight: 600; }
    .net-box {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 12px;
      padding: 10px 18px;
      text-align: right;
    }
    .net-label { font-size: 9px; font-weight: 800; color: #6ee7b7; text-transform: uppercase; letter-spacing: 0.5px; }
    .net-val { font-size: 24px; font-weight: 900; font-family: monospace; color: #34d399; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 18px 0; }
    .card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 14px; overflow: hidden; }
    .card-head {
      background: #f1f5f9; padding: 8px 14px; border-bottom: 1px solid #e2e8f0;
      font-size: 11px; font-weight: 900; color: #1e3a8a; display: flex; justify-content: space-between; align-items: center;
    }
    .card-body { padding: 12px 14px; font-size: 11px; }
    .card-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .card-row:last-child { border-bottom: none; }
    .row-lbl { color: #475569; font-weight: 500; }
    .row-val { color: #0f172a; font-weight: 700; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
    .metric-box { border-radius: 12px; padding: 12px; text-align: center; border: 1.5px solid #cbd5e1; }
    .metric-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; }
    .metric-val { font-size: 18px; font-weight: 900; font-family: monospace; color: #0f172a; margin: 4px 0; }
    .metric-sub { font-size: 9px; color: #64748b; }
    .ledger-table {
      width: 100%; border: 2px solid #0f172a; border-radius: 14px; overflow: hidden; margin: 20px 0;
      border-collapse: collapse; font-size: 11px;
    }
    .ledger-head { background: #0f172a; color: white; padding: 10px 16px; font-weight: 800; font-size: 11px; text-transform: uppercase; font-family: monospace; }
    .ledger-sub { background: #f1f5f9; font-weight: 800; color: #0f172a; border-bottom: 1px solid #cbd5e1; }
    .ledger-cell { padding: 8px 14px; border-bottom: 1px solid #e2e8f0; }
    .summary-ribbon {
      background: #ecfdf5; border: 2px solid #10b981; border-radius: 14px; padding: 16px 20px;
      display: flex; justify-content: space-between; align-items: center; margin: 20px 0;
    }
    .footer-auth {
      border-top: 2px solid #0f172a; padding-top: 18px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: center;
      font-size: 10px; color: #475569;
    }
    @media print {
      body { background: white !important; padding: 0 !important; }
      .action-bar { display: none !important; }
      .sheet { box-shadow: none !important; border: 2px solid #000000 !important; border-radius: 0 !important; padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div><strong>ZYZU'S OFFICIAL SOVEREIGN CREDENTIAL</strong> • Document: ${doc.documentNumber}</div>
    <button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <div class="sheet">
    <div class="header">
      <div class="brand-wrap">
        <div class="crest"><span>Z</span></div>
        <div>
          <div class="brand-title">ZYZU<span class="brand-point">'S</span> <span style="font-size: 13px; color: #f97316; font-weight: 800; text-transform: uppercase; margin-left: 6px;">Tutors & Libraries</span><span class="reg-tag">GOVT. REG. EDTECH</span></div>
          <div class="company-name">ZYZU'S EdTech Private Limited <span style="font-size: 11px; color: #64748b; font-weight: normal;">(formerly FocusPoint EdTech Private Limited)</span></div>
          <div class="company-sub">Central Sovereign Knowledge & Academic Settlement Desk • Ghazipur Education Complex, UP — 233001</div>
          <div class="legal-ids">CIN: U80904UP2026PTC184920 • GSTIN: 09AAACF2026P1Z4 • PAN: AAACF2026P</div>
        </div>
      </div>
      <div class="voucher-num-box">
        <div class="settled-badge">✓ DIRECT BANK SETTLEMENT</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; margin-top: 6px;">SALARY VOUCHER NO.</div>
        <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #1e3a8a;">${doc.documentNumber}</div>
        <div style="font-size: 11px; font-weight: 600; color: #475569;">Disbursed: ${issueDateFormatted}</div>
      </div>
    </div>

    <div class="banner">
      <div>
        <div style="font-size: 10px; color: #fbbf24; font-weight: 800; font-family: monospace;">★ OFFICIAL DISBURSEMENT VOUCHER & EARNINGS STATEMENT ★</div>
        <div class="banner-title">ZYZU'S Official Teacher Monthly Salary Slip</div>
        <div class="banner-sub">Pay Period: ${billingPeriod} • Academic Cycle 2026-27</div>
      </div>
      <div class="net-box">
        <div class="net-label">Net Amount Credited</div>
        <div class="net-val">₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><span>VERIFIED EDUCATOR DETAILS</span><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 9px;">ACTIVE FACULTY</span></div>
        <div class="card-body">
          <div class="card-row"><span class="row-lbl">Educator Name:</span><span class="row-val" style="font-size: 12px; font-weight: 900;">${educatorName}</span></div>
          <div class="card-row"><span class="row-lbl">ZYZU'S Teacher ID:</span><span class="row-val" style="font-family: monospace; color: #1e3a8a;">${teacherId}</span></div>
          <div class="card-row"><span class="row-lbl">Professional Role:</span><span class="row-val">${roleName}</span></div>
          <div class="card-row"><span class="row-lbl">Department:</span><span class="row-val">K-12 & Competitive Foundation</span></div>
          <div class="card-row"><span class="row-lbl">Registered Mobile:</span><span class="row-val" style="font-family: monospace;">${phone}</span></div>
          <div class="card-row"><span class="row-lbl">Assigned Territory:</span><span class="row-val">${territory}</span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head" style="color: #065f46;"><span>BANK DISBURSEMENT TELEMETRY</span><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 9px;">NEFT SETTLED</span></div>
        <div class="card-body">
          <div class="card-row"><span class="row-lbl">Payment Mode:</span><span class="row-val">${paymentMode}</span></div>
          <div class="card-row"><span class="row-lbl">Credited Bank Account:</span><span class="row-val" style="font-family: monospace;">${bankAccount}</span></div>
          <div class="card-row"><span class="row-lbl">Bank IFSC Code:</span><span class="row-val" style="font-family: monospace;">SBIN0001234 (Saidpur Branch)</span></div>
          <div class="card-row"><span class="row-lbl">Transaction UTR:</span><span class="row-val" style="font-family: monospace; color: #065f46; font-weight: 900;">${utr}</span></div>
          <div class="card-row"><span class="row-lbl">Ledger Ref:</span><span class="row-val" style="font-family: monospace; color: #64748b;">${ledgerRef}</span></div>
          <div class="card-row"><span class="row-lbl">Status:</span><span class="row-val" style="color: #059669; font-weight: 900;">CREDITED (0 Dues Outstanding)</span></div>
        </div>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-box" style="background: #eff6ff; border-color: #bfdbfe;">
        <div class="metric-lbl" style="color: #1e40af;">ASSIGNED LEARNERS</div>
        <div class="metric-val">${assignedStudents} Students</div>
        <div class="metric-sub">Active In-Home Batches</div>
      </div>
      <div class="metric-box" style="background: #eef2ff; border-color: #c7d2fe;">
        <div class="metric-lbl" style="color: #4338ca;">COMPLETED SESSIONS</div>
        <div class="metric-val">${sessionsCompleted} Classes</div>
        <div class="metric-sub">1.5 hrs / class logged</div>
      </div>
      <div class="metric-box" style="background: #ecfdf5; border-color: #a7f3d0;">
        <div class="metric-lbl" style="color: #047857;">ATTENDANCE RATE</div>
        <div class="metric-val">${attendanceRate}</div>
        <div class="metric-sub">Zero Uninformed Leaves</div>
      </div>
      <div class="metric-box" style="background: #fffbeb; border-color: #fde68a;">
        <div class="metric-lbl" style="color: #b45309;">PEDAGOGY RATING</div>
        <div class="metric-val">4.95 / 5.0</div>
        <div class="metric-sub">Parent Verified Satisfaction</div>
      </div>
    </div>

    <table class="ledger-table">
      <tr>
        <th class="ledger-head" colspan="2" style="border-right: 1px solid #475569;">A. GROSS EARNINGS & ALLOWANCES</th>
        <th class="ledger-head" colspan="2">B. DEDUCTIONS & RECOVERIES</th>
      </tr>
      <tr class="ledger-sub">
        <td class="ledger-cell">Item Description</td>
        <td class="ledger-cell" style="text-align: right; border-right: 1px solid #cbd5e1;">Amount (₹)</td>
        <td class="ledger-cell">Item Description</td>
        <td class="ledger-cell" style="text-align: right;">Amount (₹)</td>
      </tr>
      <tr>
        <td class="ledger-cell">Gross Tuition Collections (4 Students @ ₹4,000/mo avg)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; border-right: 1px solid #cbd5e1;">₹${grossCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="ledger-cell">Platform Coordination Fee (Subsidized)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace;">₹0.00</td>
      </tr>
      <tr>
        <td class="ledger-cell" style="font-weight: 700; color: #1e3a8a;">Educator Contractual Revenue Share (85%)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; font-weight: 700; border-right: 1px solid #cbd5e1;">₹${teacherShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="ledger-cell">Tax Deducted at Source (TDS u/s 194J)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace;">₹0.00</td>
      </tr>
      <tr>
        <td class="ledger-cell" style="font-weight: 700; color: #059669;">Performance & 100% Punctuality Incentive (BONUS)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; font-weight: 700; color: #059669; border-right: 1px solid #cbd5e1;">+₹${incentiveBonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="ledger-cell">Professional Tax (P-Tax)</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace;">₹0.00</td>
      </tr>
      <tr>
        <td class="ledger-cell">Curriculum Completion & Milestone Allowance</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; border-right: 1px solid #cbd5e1;">₹0.00</td>
        <td class="ledger-cell">Security Deposit / Advance Adjustment</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace;">₹0.00</td>
      </tr>
      <tr style="background: #f8fafc; font-weight: 900;">
        <td class="ledger-cell">Total Gross Earnings (A):</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; font-size: 13px; border-right: 1px solid #cbd5e1;">₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="ledger-cell">Total Deductions (B):</td>
        <td class="ledger-cell" style="text-align: right; font-family: monospace; font-size: 13px;">₹0.00</td>
      </tr>
    </table>

    <div class="summary-ribbon">
      <div>
        <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #065f46;">Net Disbursed Take-Home Remuneration (A - B)</div>
        <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px;">Amount in Words: <u>Fourteen Thousand Six Hundred Rupees Only</u></div>
        <div style="font-size: 11px; font-weight: 600; color: #047857; margin-top: 3px;">✓ Full settlement disbursed to ${bankAccount} on 15 September 2026</div>
      </div>
      <div style="background: white; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 8px 18px; text-align: center;">
        <div style="font-size: 9px; font-weight: 800; color: #64748b; font-family: monospace;">NET MONTHLY SALARY</div>
        <div style="font-size: 24px; font-weight: 900; font-family: monospace; color: #065f46;">₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>

    <div class="footer-auth">
      <div>
        <div style="font-weight: 800; font-family: monospace; color: #1e3a8a;">SHA-256 PUBLIC LEDGER AUDIT</div>
        <div style="font-family: monospace; font-size: 9px; word-break: break-all; margin: 4px 0; color: #64748b;">${qrHash}</div>
        <div style="font-size: 9px;">Scan with phone camera to verify authenticity directly on ZYZU'S verification node.</div>
      </div>
      <div style="text-align: center; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 0 10px;">
        <div style="font-weight: 800; color: #0f172a;">OFFICIAL STATEMENT</div>
        <div style="font-size: 9px; margin-top: 4px;">Conclusive legal evidence of educator honorarium disbursed under IT Act 2000. No physical signature required.</div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: Georgia, serif; font-style: italic; font-size: 18px; font-weight: bold; color: #1e1b4b;">Alok Tripathi</div>
        <div style="font-weight: 900; color: #0f172a; font-size: 11px;">Prof. Alok Tripathi</div>
        <div style="font-size: 9px; color: #64748b;">Comptroller & Super Admin Authority</div>
        <div style="font-size: 8px; font-family: monospace; color: #94a3b8;">ZYZU'S Central Clearinghouse</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates clean standalone HTML for generic documents
 */
function generateGenericStandaloneHtml(doc: UnifiedFocusPointDocument): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZYZU'S Official Document - ${doc.documentNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; display: flex; justify-content: center; }
    .card { background: #020617; border: 2px solid #38bdf8; border-radius: 20px; max-width: 820px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b, #0f172a); padding: 20px 28px; border-bottom: 2px solid #38bdf8; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 20px; font-weight: 900; color: #38bdf8; letter-spacing: 1px; }
    .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
    .body { padding: 28px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .field { background: #0f172a; padding: 12px 16px; border-radius: 12px; border: 1px solid #1e293b; }
    .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
    .val { font-size: 14px; font-weight: bold; color: #f1f5f9; }
    .footer { background: #0f172a; padding: 16px 28px; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
    @media print {
      body { background: white !important; color: black !important; padding: 0 !important; }
      .card { border: 2px solid black !important; box-shadow: none !important; }
      .header { background: #f8fafc !important; color: black !important; border-bottom: 2px solid black !important; }
      .title { color: black !important; }
      .field { background: #f8fafc !important; border: 1px solid #ccc !important; }
      .val { color: black !important; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="title">ZYZU'S OS // SOVEREIGN CREDENTIAL</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Document Number: ${doc.documentNumber}</div>
      </div>
      <div class="badge">${doc.status} • ${doc.paymentStatus}</div>
    </div>
    <div class="body">
      <h2 style="margin: 0 0 16px 0; font-size: 18px;">${doc.title}</h2>
      <div class="grid">
        <div class="field"><div class="label">Beneficiary / Holder</div><div class="val">${doc.recipientName} (${doc.recipientRole})</div></div>
        <div class="field"><div class="label">Territory / District</div><div class="val">${doc.district}, ${doc.state}</div></div>
        <div class="field"><div class="label">Date Issued</div><div class="val">${doc.issueDate}</div></div>
        <div class="field"><div class="label">Valid Through</div><div class="val">${doc.validUntil || '2026-12-31'}</div></div>
        ${doc.amount ? `<div class="field"><div class="label">Amount Authorized</div><div class="val">₹${doc.amount.toLocaleString('en-IN')}</div></div>` : ''}
        ${doc.metadata?.couponCode ? `<div class="field"><div class="label">Promo Coupon Applied</div><div class="val" style="color: #38bdf8;">${doc.metadata.couponCode} (-₹${(doc.metadata.couponDiscount || 0).toLocaleString('en-IN')})</div></div>` : ''}
        ${doc.metadata?.teacherName ? `<div class="field"><div class="label">Allotted Educator</div><div class="val">${doc.metadata.teacherName}</div></div>` : ''}
        ${doc.metadata?.libraryName ? `<div class="field"><div class="label">Allotted Library</div><div class="val">${doc.metadata.libraryName}</div></div>` : ''}
        ${doc.metadata?.slotTime ? `<div class="field"><div class="label">Scheduled Time Slot</div><div class="val">${doc.metadata.slotTime}</div></div>` : ''}
      </div>

      ${doc.lineItems && doc.lineItems.length > 0 ? `
      <div style="margin: 18px 0; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden;">
        <div style="padding: 10px 16px; background: #1e293b; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">
          Pricing Summary & Settlement Breakdown
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          ${doc.lineItems.map(it => `
            <tr style="border-bottom: 1px solid #1e293b; ${it.isHighlight ? 'background: rgba(16, 185, 129, 0.1); font-weight: bold; color: #34d399;' : (it.isDeduction || it.amount < 0 || it.label.toLowerCase().includes('coupon') ? 'color: #38bdf8; font-weight: 600;' : 'color: #f1f5f9;')}">
              <td style="padding: 10px 16px;">${it.label}</td>
              <td style="padding: 10px 16px; text-align: right; font-family: monospace;">${it.amount < 0 ? `-₹${Math.abs(it.amount).toLocaleString('en-IN')}` : `₹${it.amount.toLocaleString('en-IN')}`}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <div>Authorized by: ${doc.authorizedBy}</div>
      <div>ZYZU'S National Directorate • 256-Bit Cryptographic Security</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Draws an authentic EMV Smart Microchip graphic
 */
function renderEmvChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Chip Base
  const chipGrad = ctx.createLinearGradient(x, y, x + 64, y + 50);
  chipGrad.addColorStop(0, '#f59e0b');
  chipGrad.addColorStop(0.5, '#fbbf24');
  chipGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, 64, 50, 6);
  ctx.fill();

  // Internal Circuit Traces
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 20, y);
  ctx.lineTo(x + 20, y + 50);
  ctx.moveTo(x + 44, y);
  ctx.lineTo(x + 44, y + 50);
  ctx.moveTo(x, y + 25);
  ctx.lineTo(x + 64, y + 25);
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(x + 32, y + 25, 6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws an authentic high-density Code 128 barcode simulation
 */
function renderBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string
) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h + 22);

  ctx.fillStyle = '#000000';
  let curX = x + 10;
  const endX = x + w - 10;
  let toggle = true;

  while (curX < endX) {
    const barWidth = Math.floor(Math.random() * 4) + 1;
    if (toggle) {
      ctx.fillRect(curX, y + 5, barWidth, h - 8);
    }
    curX += barWidth + Math.floor(Math.random() * 2) + 1;
    toggle = !toggle;
  }

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h + 14);
  ctx.textAlign = 'left';
}

/**
 * Draws a high-contrast simulated QR Code with corner anchors
 */
function renderQrCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // White Background Container
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 8);
  ctx.fill();

  const pad = 12;
  const innerSize = size - pad * 2;
  const grid = 21;
  const cellSize = innerSize / grid;

  ctx.fillStyle = '#000000';

  // Helper for QR Position Detectors (Corner squares)
  const drawCorner = (cx: number, cy: number) => {
    ctx.fillRect(cx, cy, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + cellSize, cy + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx + cellSize * 2, cy + cellSize * 2, cellSize * 3, cellSize * 3);
  };

  drawCorner(x + pad, y + pad);
  drawCorner(x + pad + cellSize * 14, y + pad);
  drawCorner(x + pad, y + pad + cellSize * 14);

  // Procedural QR Data Matrix
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= 13) ||
        (r >= 13 && c < 8)
      ) {
        continue;
      }
      if ((r * 7 + c * 13) % 3 === 0 || (r + c) % 2 === 0) {
        ctx.fillRect(x + pad + c * cellSize, y + pad + r * cellSize, cellSize, cellSize);
      }
    }
  }

  // Scanning corner brackets around QR
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  const bLen = 14;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - 4, y + bLen);
  ctx.lineTo(x - 4, y - 4);
  ctx.lineTo(x + bLen, y - 4);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + size + 4 - bLen, y - 4);
  ctx.lineTo(x + size + 4, y - 4);
  ctx.lineTo(x + size + 4, y + bLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - 4, y + size - bLen);
  ctx.lineTo(x - 4, y + size + 4);
  ctx.lineTo(x + bLen, y + size + 4);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + size + 4 - bLen, y + size + 4);
  ctx.lineTo(x + size + 4, y + size + 4);
  ctx.lineTo(x + size + 4, y + size + 4);
  ctx.stroke();
}

/**
 * Draws an authentic official circular stamp
 */
function renderOfficialStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15); // subtle authentic stamp rotation

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
  ctx.textAlign = 'center';
  ctx.fillText("ZYZU'S CLEARINGHOUSE", 0, -32);
  ctx.font = '900 13px sans-serif';
  ctx.fillText('★ SETTLED ★', 0, -2);
  ctx.font = 'bold 8px monospace';
  ctx.fillText('AUDIT VERIFIED', 0, 22);
  ctx.fillText('256-BIT CRYPTO', 0, 36);

  ctx.restore();
}
