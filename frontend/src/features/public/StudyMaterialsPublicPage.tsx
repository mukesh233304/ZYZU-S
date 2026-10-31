import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, FileText, Download, Sparkles, CheckCircle2, 
  ArrowRight, Search, ShieldCheck, Bookmark, Lock, Layers 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ServiceRegistrationGateModal } from '../../components/common/ServiceRegistrationGateModal';
import { FocusPointAdCarousel } from '../../components/common/FocusPointAdCarousel';
import { notificationEventService } from '../../services/notificationEventService';

export const StudyMaterialsPublicPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Agent Event Hook: Detect study material search activity
  useEffect(() => {
    if (!searchQuery.trim() && selectedClass === 'ALL') return;

    const timer = setTimeout(() => {
      notificationEventService.emitStudyMaterialSearch({
        query: searchQuery.trim() || undefined,
        classLevel: selectedClass !== 'ALL' ? selectedClass : undefined,
        districtName: user?.districtName || 'Pan-India',
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedClass, user]);

  const handleAccessMaterial = (materialTitle?: string) => {
    if (materialTitle) {
      notificationEventService.emitStudyMaterialSearch({
        query: materialTitle,
        classLevel: selectedClass !== 'ALL' ? selectedClass : undefined,
        districtName: user?.districtName || 'Pan-India',
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone
      });
    }

    if (user) {
      navigate('/student/study-material');
    } else {
      setGateOpen(true);
    }
  };

  const MATERIALS = [
    {
      id: 'mat-1',
      title: 'Class 10 CBSE Complete Science Mind Maps & Formula Book',
      classLevel: 'Class 10',
      subject: 'Science',
      pages: 148,
      format: 'High-Res PDF',
      badge: 'Bestseller',
      description: 'Concise chapter summaries, chemical equation balance sheets, and physics ray diagram guides.'
    },
    {
      id: 'mat-2',
      title: 'Class 10 Mathematics Standard & Basic Question Bank with Solutions',
      classLevel: 'Class 10',
      subject: 'Mathematics',
      pages: 210,
      format: 'Annotated PDF',
      badge: 'Popular',
      description: 'NCERT Exemplar + past 10 years solved board examination questions categorized by difficulty.'
    },
    {
      id: 'mat-3',
      title: 'Class 12 Physics Electromagnetism & Optics Topper Revision Notes',
      classLevel: 'Class 12',
      subject: 'Physics',
      pages: 185,
      format: 'Handwritten PDF',
      badge: 'Topper Notes',
      description: 'Color-coded handwritten derivations, circuit shortcuts, and board marking-scheme tips.'
    },
    {
      id: 'mat-4',
      title: 'BHU CHS Class 9 All-In-One Entrance Preparation Module',
      classLevel: 'Class 9',
      subject: 'CHS Prep',
      pages: 320,
      format: 'Complete Kit',
      badge: 'Exam Special',
      description: 'Mental ability, General Science, Social Studies, Hindi, and English previous year solved modules.'
    },
    {
      id: 'mat-5',
      title: 'NEET Botany & Zoology NCERT Line-by-Line Fact Sheet 2026',
      classLevel: 'Class 12 / Drop',
      subject: 'Biology',
      pages: 260,
      format: 'Interactive PDF',
      badge: 'High Yield',
      description: 'Every statement from NCERT textbooks converted into one-liner revision flashpoints.'
    },
    {
      id: 'mat-6',
      title: 'Navodaya Class 6 Selection Exam Mental Ability Solved Diagrams',
      classLevel: 'Class 6',
      subject: 'JNVST Prep',
      pages: 110,
      format: 'Diagram Book',
      badge: 'Foundation',
      description: 'Pattern completion, spatial visualization, figure series, and arithmetic tips.'
    }
  ];

  const filtered = MATERIALS.filter((m) => {
    const matchesClass = selectedClass === 'ALL' || m.classLevel.includes(selectedClass);
    const matchesSearch = !searchQuery.trim() || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-lg">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Academic & Competitive Exam Study Materials</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Curated Study Notes & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Previous-Year Solved Papers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Authentic, verified digital study materials reviewed by District Admins and subject experts. Access class-wise chapter notes, formula books, and competitive exam modules.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => handleAccessMaterial()}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="shadow-xl shadow-emerald-600/25 bg-emerald-600 hover:bg-emerald-500 font-bold"
            >
              Explore Study Materials
            </Button>
            {user ? (
              <Link to="/student/study-material">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold">
                  Go to Student Repository
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setGateOpen(true)}
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Sign In to Download
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* FOCUSPOINT ADVERTISEMENT CAROUSEL — SERVICE ENGINE (STUDY MATERIALS) */}
        <FocusPointAdCarousel page="STUDY_MATERIALS" className="mb-8" />

        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, chapter, or exam..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 overflow-x-auto">
            {['ALL', 'Class 6', 'Class 9', 'Class 10', 'Class 12'].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {cls === 'ALL' ? 'All Classes' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    {mat.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                    {mat.classLevel}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-950 leading-snug">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {mat.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{mat.pages} Pages</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>{mat.format}</span>
                  </span>
                </div>
              </div>

              <div className="pt-5 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAccessMaterial(mat.title)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Access Notes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Registration Gate */}
      <ServiceRegistrationGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        serviceTitle="Digital Study Materials & Notes"
        serviceDescription="Sign in or create your ZYZU'S student account to view, download, and bookmark chapter revision notes and previous-year question papers."
        intendedDestination="/student/study-material"
      />
    </div>
  );
};
