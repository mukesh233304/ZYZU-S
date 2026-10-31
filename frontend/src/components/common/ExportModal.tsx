import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import { ReportExportFormat } from '../../types';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Printer, 
  X, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface ExportModalProps {
  title: string;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  filename?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  title,
  data,
  isOpen,
  onClose,
  filename,
}) => {
  const { showToast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('CSV');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await reportService.exportReport(data, filename || title, selectedFormat);
      showToast(res.message, 'success');
      onClose();
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formats: { format: ReportExportFormat; label: string; desc: string; icon: React.ReactNode; status: string }[] = [
    { format: 'CSV', label: 'CSV Spreadsheet', desc: 'Raw tabular dataset formatted for Excel & Google Sheets', icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />, status: 'Available' },
    { format: 'JSON', label: 'JSON Data Stream', desc: 'Structured JSON objects for programmatic ETL integration', icon: <Code className="w-5 h-5 text-amber-400" />, status: 'Available' },
    { format: 'EXCEL', label: 'Microsoft Excel (.xlsx)', desc: 'Pre-formatted workbook with styling and metadata', icon: <FileSpreadsheet className="w-5 h-5 text-blue-400" />, status: 'Print / Direct' },
    { format: 'PDF', label: 'Formal Executive PDF', desc: 'Official formatted document with corporate headers & seal', icon: <FileText className="w-5 h-5 text-rose-400" />, status: 'Print / Browser' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Export & Intelligence Dispatch</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Exporting dataset for: <strong className="text-white">{title}</strong>
        </p>

        {/* Format Selector */}
        <div className="space-y-2.5">
          {formats.map((f) => (
            <div
              key={f.format}
              onClick={() => setSelectedFormat(f.format)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedFormat === f.format
                  ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{f.label}</h4>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                selectedFormat === f.format ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'
              }`}>
                {selectedFormat === f.format && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        {/* Integration notice */}
        <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
          <Clock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Notice: CSV/JSON downloads run locally in simulation mode. Backend PDF document generation engine integration is pending.</span>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Direct Print</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Processing...' : `Export ${selectedFormat}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
