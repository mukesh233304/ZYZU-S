import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { studentPerformanceService } from '../../../services/studentPerformanceService';
import { StudentTestRecord } from '../../../types/academicIntelligence';

interface TeacherPerformanceSnapshotProps {
  teacherId?: string;
  studentId?: string;
}

export const TeacherPerformanceSnapshot: React.FC<TeacherPerformanceSnapshotProps> = ({
  teacherId = 'usr-teacher-rajesh',
  studentId
}) => {
  const [testRecords, setTestRecords] = useState<StudentTestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const records = await studentPerformanceService.getTeacherTests(teacherId, studentId);
        setTestRecords(records || []);
      } catch (e) {
        console.error('Failed to load performance snapshot:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [teacherId, studentId]);

  // Aggregate performance across students based on real recorded percentages
  const performanceStatus = React.useMemo(() => {
    if (!testRecords || testRecords.length === 0) return null;

    const recent = testRecords.slice(0, 8);
    const avgPercentage = recent.reduce((acc, r) => acc + (r.percentage || (r.marksObtained / r.totalMarks) * 100), 0) / recent.length;

    let trend: 'Improving' | 'Stable' | 'Needs Attention' = 'Stable';
    if (avgPercentage >= 75) trend = 'Improving';
    else if (avgPercentage < 50) trend = 'Needs Attention';

    return {
      avgScore: Math.round(avgPercentage),
      totalTests: testRecords.length,
      trend,
      recent
    };
  }, [testRecords]);

  return (
    <Card className="p-6 border border-slate-200/80 bg-white shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Academic Performance Snapshot</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Recorded weekly test assessments and student topic mastery
          </p>
        </div>

        <Link
          to="/teacher/performance"
          className="text-xs font-bold text-royal-blue-600 hover:text-royal-blue-700 flex items-center gap-1"
        >
          <span>All Test Scores</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="w-6 h-6 border-2 border-royal-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !performanceStatus || performanceStatus.totalTests === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Not enough recent data</p>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Log weekly chapter assessments in the Student Test Records section to track academic mastery.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Header Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                Batch Average Mastery
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {performanceStatus.avgScore}%
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Across {performanceStatus.totalTests} tests
                </span>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                performanceStatus.trend === 'Improving'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : performanceStatus.trend === 'Needs Attention'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              {performanceStatus.trend === 'Improving' ? (
                <Award className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{performanceStatus.trend}</span>
            </span>
          </div>

          {/* Recent 3 Test Records */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Recent Logged Assessments
            </span>
            {performanceStatus.recent.slice(0, 3).map((test) => (
              <div
                key={test.id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{test.testName}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {test.studentName} • {test.subject} ({test.testDate})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">
                    {test.marksObtained} / {test.totalMarks}
                  </span>
                  <span className="text-[11px] text-slate-600 block font-semibold">
                    {Math.round((test.marksObtained / test.totalMarks) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
