import { describe, it, expect, vi, beforeEach } from 'vitest';
import { documentExportUtils } from '../utils/documentExportUtils';
import { UnifiedFocusPointDocument } from '../types/document';

describe("ZYZU'S — Teacher Salary Slip Direct Download & Export Integrity Suite", () => {
  const sampleSalarySlip: UnifiedFocusPointDocument = {
    id: 'doc-sal-2026-09-000145',
    documentNumber: 'SAL-2026-09-000145',
    documentType: 'TEACHER_SALARY_SLIP',
    title: "ZYZU'S Official Teacher Monthly Salary Slip",
    category: 'SALARY',
    recipientId: 'usr-teacher-rajesh',
    recipientName: 'Dr. Rajesh Sharma',
    recipientRole: 'Verified Senior Home Educator',
    recipientPhone: '+91 98765 43211',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    locality: 'Saidpur',
    issueDate: '2026-09-15',
    amount: 14600,
    paymentStatus: 'PAID',
    paymentMethod: 'NEFT Direct Bank Transfer',
    bankAccountMasked: 'State Bank of India (SBI) A/c XXXX 3381',
    transactionRef: 'SBI-NEFT-99120481',
    paymentId: 'PAY-SAL-2026-09-01',
    billingPeriod: 'September 2026',
    status: 'READY',
    currency: 'INR',
    authorizedBy: 'Prof. Alok Tripathi, Comptroller & Super Admin Authority',
    authorizedRole: 'Super Admin Authority',
    qrVerificationHash: 'SHA256-SAL-2026-09-000145',
    qrVerificationUrl: 'https://focuspoint.app/verify/doc/SAL-2026-09-000145',
    version: 1,
    isCurrent: true,
    auditTrail: [],
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
    metadata: {
      completedSessions: 28,
      assignedStudentsCount: 4,
      attendanceRate: '100%',
      bonus: 1000,
      grossCollection: 16000,
      teacherShare: 13600
    }
  };

  let mockCanvas: any;
  let filledTextCalls: string[];
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    filledTextCalls = [];
    clickSpy = vi.fn();

    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
      fillText: vi.fn((text: string) => {
        filledTextCalls.push(text);
      })
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockPngBase64Data')
    };

    appendChildSpy = vi.fn((node: any) => {
      if (node) node.click = clickSpy;
      return node;
    });
    removeChildSpy = vi.fn((node: any) => node);

    (globalThis as any).document = {
      createElement: vi.fn((tagName: string) => {
        if (tagName.toLowerCase() === 'canvas') {
          return mockCanvas;
        }
        return {
          tagName: tagName.toUpperCase(),
          download: '',
          href: '',
          click: clickSpy
        };
      }),
      body: {
        appendChild: appendChildSpy,
        removeChild: removeChildSpy
      }
    };

    (globalThis as any).URL = {
      createObjectURL: vi.fn(() => 'blob:http://localhost:5173/mock-doc-blob'),
      revokeObjectURL: vi.fn()
    };
  });

  describe('1. High-Resolution Salary Slip Canvas Export', () => {
    it('initializes canvas with high-resolution A4 dimensions (1350 x 1850 px) and renders without error', async () => {
      await documentExportUtils.downloadAsImage(sampleSalarySlip, false);

      // Verify canvas dimensions
      expect(mockCanvas.width).toBe(1350);
      expect(mockCanvas.height).toBe(1850);

      // Verify download trigger
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      // Verify critical text rendered on the canvas
      const allRendered = filledTextCalls.join(' ');
      expect(allRendered).toContain("ZYZU'S Official Teacher Monthly Salary Slip");
      expect(allRendered).toContain('FocusPoint EdTech Private Limited');
      expect(allRendered).toContain('Dr. Rajesh Sharma');
      expect(allRendered).toContain('FP-TCH-000014');
      expect(allRendered).toContain('State Bank of India (SBI) A/c XXXX 3381');
      expect(allRendered).toContain('SBI-NEFT-99120481');
      expect(allRendered).toContain('Fourteen Thousand Six Hundred Rupees Only');
      expect(allRendered).toContain('Prof. Alok Tripathi');
    });
  });

  describe('2. Standalone Offline HTML Export', () => {
    it('generates a complete, authoritative standalone HTML file with all voucher details', () => {
      let createdBlob: any = null;

      vi.spyOn(globalThis, 'Blob').mockImplementation(function (this: any, parts: any, options: any) {
        createdBlob = {
          parts,
          options,
          type: options?.type || ''
        };
        return createdBlob as any;
      } as any);

      documentExportUtils.downloadAsStandaloneHtml(sampleSalarySlip);

      expect(clickSpy).toHaveBeenCalled();

      // Verify the generated HTML content
      expect(createdBlob).not.toBeNull();
      const htmlContent = createdBlob.parts[0];
      expect(typeof htmlContent).toBe('string');
      expect(htmlContent).toContain("ZYZU'S Official Teacher Monthly Salary Slip");
      expect(htmlContent).toContain('FocusPoint EdTech Private Limited');
      expect(htmlContent).toContain('CIN: U80904UP2026PTC184920');
      expect(htmlContent).toContain('GSTIN: 09AAACF2026P1Z4');
      expect(htmlContent).toContain('PAN: AAACF2026P');
      expect(htmlContent).toContain('DIRECT BANK SETTLEMENT');
      expect(htmlContent).toContain('Dr. Rajesh Sharma');
      expect(htmlContent).toContain('FP-TCH-000014');
      expect(htmlContent).toContain('State Bank of India (SBI) A/c XXXX 3381');
      expect(htmlContent).toContain('SBI-NEFT-99120481');
      expect(htmlContent).toContain('4 Students');
      expect(htmlContent).toContain('28 Classes');
      expect(htmlContent).toContain('100%');
      expect(htmlContent).toContain('14,600');
      expect(htmlContent).toContain('Fourteen Thousand Six Hundred Rupees Only');
      expect(htmlContent).toContain('Prof. Alok Tripathi');
    });
  });

  describe('3. Generic Document Fallback Non-Empty Guarantee', () => {
    it('ensures generic documents are rendered completely without blank screens', async () => {
      const genericDoc: UnifiedFocusPointDocument = {
        id: 'doc-misc-001',
        documentNumber: 'DOC-MISC-998811',
        documentType: 'TEACHER_EARNINGS_STATEMENT',
        title: 'Academic Notice & Regulatory Order',
        category: 'FINANCIAL',
        recipientId: 'usr-misc-1',
        recipientName: 'Vikas Dubey',
        recipientRole: 'Student',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        issueDate: '2026-09-10',
        amount: 2500,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        status: 'READY',
        authorizedBy: 'District Registrar',
        authorizedRole: 'District Admin',
        qrVerificationUrl: 'https://focuspoint.app/verify/doc/DOC-MISC-998811',
        qrVerificationHash: 'SHA256-DOC-MISC-998811',
        version: 1,
        isCurrent: true,
        auditTrail: [],
        createdAt: '2026-09-10T10:00:00.000Z',
        updatedAt: '2026-09-10T10:00:00.000Z',
        metadata: {}
      };

      await documentExportUtils.downloadAsImage(genericDoc, false);

      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(1500);

      const allRendered = filledTextCalls.join(' ');
      expect(allRendered).toContain('Academic Notice & Regulatory Order');
      expect(allRendered).toContain('DOC-MISC-998811');
      expect(allRendered).toContain('Vikas Dubey');
      expect(allRendered).toContain('Ghazipur, Uttar Pradesh');
      expect(allRendered).toContain('2,500');
    });
  });
});
