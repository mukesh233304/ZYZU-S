import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, MapPin, Award, Clock, ShieldCheck, 
  Calendar, BookOpen, Star, CheckCircle, ArrowLeft, ArrowRight, UserCheck, Sparkles 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RatingStars } from '../../components/common/RatingStars';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { teacherService } from '../../services/teacherService';
import { Teacher } from '../../types';
import { policyService } from '../../services/policyService';
import { OfferBadge, OfferPriceDisplay } from '../../components/common/OfferBadge';
import { DemoBookingModal } from '../../components/demo/DemoBookingModal';

export const TeacherProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setPolicyVersion] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Real-time reactive subscription to District Admin policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      if (id) {
        const data = await teacherService.getTeacherById(id);
        setTeacher(data || null);
      }
      setLoading(false);
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ErrorState
          title="Teacher Profile Not Found"
          message="The requested teacher profile could not be located or is pending district verification."
          onRetry={() => navigate('/find-tutor')}
        />
      </div>
    );
  }

  const monthlyFee = teacher.expectedFeeMonthly || teacher.monthlyFee || 0;
  const activeOffer = policyService.getBestActiveOffer({
    districtName: teacher.districtName || 'Ghazipur',
    serviceType: 'TUITION',
    targetId: teacher.id,
    amount: monthlyFee,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <Link to="/find-tutor" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tutor Directory</span>
      </Link>

      {/* Main Profile Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <img
            src={teacher.avatarUrl}
            alt={teacher.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-500/30 shadow-md shrink-0"
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{teacher.name}</h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by Ghazipur District Admin</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800">{teacher.degree}</p>
            <p className="text-xs text-slate-500 font-medium">{teacher.university} (Class of {teacher.passingYear})</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{teacher.area}, {teacher.districtName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{teacher.experienceYears}+ Years Teaching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RatingStars rating={teacher.rating || 0} reviewsCount={teacher.reviewsCount} />
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="sm:w-64 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shrink-0 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Monthly Tuition Fee</span>
              <OfferPriceDisplay pricing={activeOffer} unit="/month" size="lg" />
              <span className="text-[11px] text-slate-500 font-medium block mt-1">approx {teacher.feeRange}</span>
            </div>

            <Link to={`/student/tutor-requests/new?preferredTeacherId=${teacher.id}&teacherName=${encodeURIComponent(teacher.name)}`}>
              <Button size="md" className="w-full font-bold shadow-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Book This Teacher
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Book 1-Time Demo Class
            </button>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium">
              Official Educator Booking: Payment of tuition fee required to confirm booking & reserve schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Details and Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: About & Teaching Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Bio */}
          <Card className="space-y-3 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-black text-base text-slate-950">About the Educator</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{teacher.bio}</p>
          </Card>

          {/* Subjects & Classes */}
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-black text-base text-slate-950">Subjects & Classes Taught</h3>
            
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-500">Subjects</span>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map(sub => (
                  <span key={sub} className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500">Eligible Classes & Curriculums</span>
              <div className="flex flex-wrap gap-2">
                {(teacher.classes || []).map(cls => (
                  <span key={cls} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500">Specializations</span>
              <div className="flex flex-wrap gap-2">
                {(teacher.specializations || []).map(spec => (
                  <span key={spec} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Verified Qualifications & Credentials */}
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-black text-base text-slate-950">Verified Credentials</h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-950">Highest Degree: {teacher.highestQualification}</p>
                  <p className="text-slate-600 text-[11px] font-medium">{teacher.university} • Completed {teacher.passingYear}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-950">Government ID & Police Verification</p>
                  <p className="text-slate-600 text-[11px] font-medium">Aadhaar and local residence attested by District Admin office</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Logistics & Availability */}
        <div className="space-y-6">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-black text-base text-slate-950">Teaching Mode & Slots</h3>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-500">Teaching Mode</span>
              <p className="text-xs text-slate-800 font-bold">
                {teacher.teachingMode === 'OFFLINE_HOME' ? '1-on-1 Offline Home Tuition Only' :
                 teacher.teachingMode === 'ONLINE' ? 'Live Online Sessions Only' :
                 'Both Home Tuition & Online Available'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500">Available Days</span>
              <div className="flex flex-wrap gap-1.5">
                {(teacher.availabilityDays || []).map(d => (
                  <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500">Daily Slots</span>
              <div className="space-y-1">
                {(teacher.availabilitySlots || []).map(slot => (
                  <div key={slot} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500">Covered Localities</span>
              <div className="flex flex-wrap gap-1">
                {(teacher.areasServed || []).map(area => (
                  <span key={area} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Matching Workflow Reminder Notice */}
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-xs text-slate-700 space-y-2 shadow-xs">
            <h4 className="font-bold text-brand-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>How Allotment Works</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              When you click "Request This Teacher", your request is submitted to the Ghazipur District Admin. The administrator confirms teacher availability and location fit before confirming the schedule.
            </p>
          </div>
        </div>
      </div>

      {showDemoModal && teacher && (
        <DemoBookingModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
          serviceType="HOME_TUITION"
          serviceId={teacher.id}
          serviceName={teacher.name}
          tutorSubject={teacher.subjects?.[0]}
          state="Uttar Pradesh"
          district={teacher.districtName || teacher.district || 'Ghazipur'}
        />
      )}
    </div>
  );
};
