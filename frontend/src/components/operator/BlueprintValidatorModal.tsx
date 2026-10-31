// FOCUSPOINT Pan-India Operator Mock Test Blueprint Validation Modal
// Audits mock tests against official exam patterns, syllabus blueprints, and quality guidelines

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Zap, 
  ArrowRight, 
  Check, 
  Copy, 
  Sliders, 
  PieChart, 
  Info,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  BlueprintValidationReport, 
  BlueprintValidationIssue, 
  QuestionItem 
} from '../../types/academicIntelligence';
import { blueprintValidationService } from '../../services/blueprintValidationService';

interface BlueprintValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: BlueprintValidationReport | null;
  onAutoFix?: (action: string, issue: BlueprintValidationIssue) => void;
  onApproveAndPublish?: () => void;
  isPublishing?: boolean;
}

export const BlueprintValidatorModal: React.FC<BlueprintValidatorModalProps> = ({
  isOpen,
  onClose,
  report,
  onAutoFix,
  onApproveAndPublish,
  isPublishing = false
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING' | 'INFO'>('ALL');

  if (!report) return null;

  const filteredIssues = report.issues.filter(issue => {
    if (filterSeverity === 'ALL') return true;
    return issue.severity === filterSeverity;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
            report.isValid 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-rose-500 to-amber-600 shadow-rose-500/30'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Exam Blueprint & Quality Audit Report
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                report.isValid 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {report.isValid ? 'PASSED — EXAM READY' : 'BLOCKED — RESOLVE ISSUES'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Exam: <strong className="text-slate-800">{report.examName}</strong> | Test: <strong className="text-slate-800">{report.mockTestTitle}</strong>
            </p>
          </div>
        </div>
      }
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Executive Score & KPI Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Score Ring */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-indigo-500/30 bg-slate-900/80 shadow-inner">
                <div className="text-center">
                  <span className={`text-2xl font-black font-mono ${
                    report.readinessScore >= 90 ? 'text-emerald-400' :
                    report.readinessScore >= 70 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {report.readinessScore}%
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Readiness
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Blueprint Quality Rating
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {report.isValid ? 'Syllabus & Quality Verification Complete' : 'Critical Discrepancies Require Attention'}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                  {report.complianceSummary}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-center min-w-[70px]">
                <span className="text-xs font-bold text-slate-400 uppercase block">Questions</span>
                <span className="text-lg font-mono font-black text-white">
                  {report.totalQuestions}/{report.targetQuestions}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-center min-w-[70px]">
                <span className="text-xs font-bold text-slate-400 uppercase block">Marks</span>
                <span className="text-lg font-mono font-black text-white">
                  {report.totalMarks}/{report.targetMarks}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-center min-w-[70px]">
                <span className="text-xs font-bold text-rose-300 uppercase block">Errors</span>
                <span className="text-lg font-mono font-black text-rose-400">
                  {report.errorCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center min-w-[70px]">
                <span className="text-xs font-bold text-amber-300 uppercase block">Warnings</span>
                <span className="text-lg font-mono font-black text-amber-400">
                  {report.warningCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Balance & Difficulty Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Balance */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Section & Subject Distribution
            </h4>
            <div className="space-y-2">
              {report.sectionCoverage.map(sec => (
                <div key={sec.sectionId} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{sec.subject}</span>
                    <span className="text-slate-400 text-[11px] block">{sec.actualMarks} marks total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">
                      {sec.actualQuestions} / {sec.targetQuestions} Qs
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      sec.isBalanced 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {sec.isBalanced ? 'Balanced' : 'Imbalanced'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Ratios */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" /> Difficulty Calibration Radar
            </h4>

            <div className="space-y-3">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Easy (Foundation): {report.difficultyAnalysis.easyCount} Qs</span>
                  <span className="font-mono text-emerald-600">{report.difficultyAnalysis.easyPct}% (Target: 30%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${report.difficultyAnalysis.easyPct}%` }}></div>
                </div>
              </div>

              {/* Moderate */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Moderate (Exam Standard): {report.difficultyAnalysis.moderateCount} Qs</span>
                  <span className="font-mono text-indigo-600">{report.difficultyAnalysis.moderatePct}% (Target: 50%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${report.difficultyAnalysis.moderatePct}%` }}></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hard (Distinguisher): {report.difficultyAnalysis.hardCount} Qs</span>
                  <span className="font-mono text-amber-600">{report.difficultyAnalysis.hardPct}% (Target: 20%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${report.difficultyAnalysis.hardPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Question Detector Notice (if any) */}
        {report.duplicateMatches.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-rose-950 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Duplicate Questions Detected Within Test ({report.duplicateMatches.length})
            </h4>
            <div className="space-y-2">
              {report.duplicateMatches.map((dup, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-800">
                    <span>Q{dup.questionANumber} and Q{dup.questionBNumber} are {dup.similarityScorePct}% similar</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                      DUPLICATE
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] truncate">
                    1: {dup.questionAText}
                  </p>
                  <p className="text-slate-600 text-[11px] truncate">
                    2: {dup.questionBText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List & Auto-Fix Actions */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Detailed Audit Findings ({report.issues.length})
            </h4>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterSeverity('ALL')}
                className={`px-2.5 py-1 rounded ${filterSeverity === 'ALL' ? 'bg-white shadow text-indigo-700' : 'text-slate-600'}`}
              >
                All ({report.issues.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterSeverity('ERROR')}
                className={`px-2.5 py-1 rounded ${filterSeverity === 'ERROR' ? 'bg-rose-600 text-white shadow' : 'text-rose-600'}`}
              >
                Errors ({report.errorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterSeverity('WARNING')}
                className={`px-2.5 py-1 rounded ${filterSeverity === 'WARNING' ? 'bg-amber-500 text-white shadow' : 'text-amber-700'}`}
              >
                Warnings ({report.warningCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterSeverity('INFO')}
                className={`px-2.5 py-1 rounded ${filterSeverity === 'INFO' ? 'bg-slate-700 text-white shadow' : 'text-slate-600'}`}
              >
                Advisories ({report.infoCount})
              </button>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h5 className="text-sm font-black text-emerald-950">Zero Issues in Selected Category</h5>
              <p className="text-xs text-emerald-800">
                All audited items meet FocusPoint examination criteria perfectly.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                    issue.severity === 'ERROR' 
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950' 
                      : issue.severity === 'WARNING' 
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {issue.severity === 'ERROR' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : issue.severity === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{issue.title}</span>
                        {issue.questionNumber && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white/70 border border-slate-300">
                            Q{issue.questionNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{issue.message}</p>
                    </div>
                  </div>

                  {issue.canAutoFix && onAutoFix && (
                    <button
                      type="button"
                      onClick={() => onAutoFix(issue.ruleCode, issue)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {issue.fixActionLabel || 'Auto Fix'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions Gate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Audited by: <span className="font-semibold text-slate-700">{report.auditedBy}</span> ({new Date(report.auditedAt).toLocaleTimeString()})
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close Audit
            </Button>

            {onApproveAndPublish && (
              <button
                type="button"
                disabled={!report.isValid || isPublishing}
                onClick={onApproveAndPublish}
                className={`py-2.5 px-6 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 ${
                  report.isValid 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 cursor-pointer shadow-emerald-500/25 border border-emerald-300 transform hover:scale-[1.02]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isPublishing ? 'Publishing Mock Drill...' : 'Approve & Publish to Students'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
