import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Download, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Search, 
  Bookmark, 
  Flame, 
  X, 
  Maximize2, 
  GraduationCap,
  Award
} from 'lucide-react';
import { Button } from '../common/Button';
import { ServiceRegistrationGateModal } from '../common/ServiceRegistrationGateModal';
import { useAuth } from '../../context/AuthContext';

interface NoteItem {
  id: string;
  category: 'CLASS_10' | 'CLASS_12' | 'NEET_JEE' | 'ENTRANCE_PYQ' | 'GOVT_EXAMS';
  classGrade: string;
  subject: string;
  title: string;
  author: string;
  authorQualification: string;
  pageCount: number;
  fileSize: string;
  downloadsCount: number;
  rating: number;
  language: string;
  samplePreviewSnippet: {
    chapterTitle: string;
    keyPoints: string[];
    formulaIncluded: string;
    diagramLabel: string;
  };
  highlights: string[];
  isPopular?: boolean;
}

const ACADEMIC_NOTES_DATA: NoteItem[] = [
  {
    id: 'note-c10-sci-master',
    category: 'CLASS_10',
    classGrade: 'Class 10 CBSE & State Board',
    subject: 'Science (Physics, Chem, Bio)',
    title: 'Class 10 Science: Complete Concept Mind Maps & NCERT Line-by-Line',
    author: 'Er. Sandeep Mishra',
    authorQualification: 'M.Tech IIT-BHU • 12 Yrs Board Specialist',
    pageCount: 148,
    fileSize: '12.4 MB',
    downloadsCount: 14200,
    rating: 4.95,
    language: 'Bilingual (Hindi + English)',
    highlights: ['All 13 Chapters Mind Maps', 'Chemical Reactions Flowchart', 'Ray Optics Derivations', '10-Yr Solved Board Questions'],
    samplePreviewSnippet: {
      chapterTitle: 'Chapter 1: Chemical Reactions & Equations',
      keyPoints: [
        'Balanced Chemical Equation Law of Conservation of Mass proof',
        'Endothermic vs Exothermic decomposition diagrams',
        'Redox reactions with oxidation numbers in tabular format',
        'Corrosion prevention and rancidity anti-oxidants summary'
      ],
      formulaIncluded: 'Fe₂O₃ + 2Al → Al₂O₃ + 2Fe + Heat (Thermite Process)',
      diagramLabel: 'Schematic Diagram: Electrolysis of Acidulated Water with Anode/Cathode Gas Ratio 1:2'
    },
    isPopular: true
  },
  {
    id: 'note-c10-math-formulas',
    category: 'CLASS_10',
    classGrade: 'Class 10 CBSE & State Board',
    subject: 'Mathematics',
    title: 'Class 10 Mathematics: Golden Formula Digest & Step-Wise Theorems',
    author: 'Dr. Anand Swaroop',
    authorQualification: 'Ph.D Mathematics • State Best Teacher Awardee',
    pageCount: 96,
    fileSize: '8.1 MB',
    downloadsCount: 11800,
    rating: 4.9,
    language: 'Bilingual (Hindi + English)',
    highlights: ['Basic Proportionality Theorem Step Proofs', 'Trigonometric Identities Cheat Sheet', 'Surface Areas & Volumes 3D Charts', 'Standard vs Basic Math PYQs'],
    samplePreviewSnippet: {
      chapterTitle: 'Chapter 8 & 9: Trigonometry & Applications (Heights & Distances)',
      keyPoints: [
        'Reciprocal and quotient trigonometric relations with mnemonics (PBP/HHB)',
        'Sin²θ + Cos²θ = 1 geometric circle derivation',
        'Angle of Elevation & Depression word problems with standard angle ratios (30°, 45°, 60°)',
        'Speed calculation of moving boat and airplane multi-triangle setups'
      ],
      formulaIncluded: 'tan(A±B) derivations and sec²θ - tan²θ = 1 identity transformations',
      diagramLabel: 'Two-Observer Height Triangulation Diagram with Elevation Angle Subtensions'
    }
  },
  {
    id: 'note-c12-phy-derivation',
    category: 'CLASS_12',
    classGrade: 'Class 12 Boards & CUET',
    subject: 'Physics',
    title: 'Class 12 Physics: All 45 Mandatory Board Derivations & Formula Book',
    author: 'Prof. R.K. Pandey',
    authorQualification: 'Ex-Professor SCERT • Academic Panelist',
    pageCount: 182,
    fileSize: '15.6 MB',
    downloadsCount: 16500,
    rating: 4.98,
    language: 'English + Hindi Clarifications',
    highlights: ['Gauss Law & Applications', 'Wave Optics Huygens Wavefronts', 'Biot-Savart & Ampere Circuit Law', 'Semiconductors Band Theory'],
    samplePreviewSnippet: {
      chapterTitle: 'Unit 1: Electrostatics & Potential',
      keyPoints: [
        'Electric field on axial and equatorial lines of electric dipole step-by-step',
        'Gauss Law applied to infinite thin plane sheet of charge (E = σ / 2ε₀)',
        'Capacitance of parallel plate capacitor with partially filled dielectric slab',
        'Energy stored in capacitor and energy density per unit volume'
      ],
      formulaIncluded: 'E_axial = 2kp / r³ vs E_equatorial = kp / r³ (r >> a)',
      diagramLabel: 'Gaussian Cylindrical Surface Enclosing Uniform Linear Charge Density'
    },
    isPopular: true
  },
  {
    id: 'note-neet-bio-ncert',
    category: 'NEET_JEE',
    classGrade: 'NEET UG 2027 Aspirants',
    subject: 'Biology (Botany + Zoology)',
    title: 'NEET UG 360/360: NCERT Line-by-Line Highlighter & Flowchart Atlas',
    author: 'Dr. Meenakshi Srivastava',
    authorQualification: 'MBBS (KGMC Lucknow) • NEET Mentorship Head',
    pageCount: 220,
    fileSize: '19.8 MB',
    downloadsCount: 22400,
    rating: 4.99,
    language: 'English with Hindi Terms',
    highlights: ['Every NCERT Line Tested in Last 10 Years', 'Human Physiology Flowcharts', 'Genetics Cross Tables & Pedigrees', 'Plant Kingdom Mnemonics'],
    samplePreviewSnippet: {
      chapterTitle: 'Genetics: Principles of Inheritance & Variation',
      keyPoints: [
        'Mendelian Dihybrid Ratio 9:3:3:1 and test cross phenotypic frequencies',
        'Incomplete dominance vs Co-dominance with ABO blood group allele analysis',
        'Chromosomal theory of inheritance by Sutton & Boveri comparison chart',
        'Sex-linked recessive disorders: Hemophilia & Color Blindness pedigree conventions'
      ],
      formulaIncluded: 'Recombination Frequency = (Total Recombinants / Total Progeny) × 100',
      diagramLabel: 'Drosophila Melanogaster Morgan Dihybrid Cross: Eye Color vs Wing Size Linkage'
    },
    isPopular: true
  },
  {
    id: 'note-chs-pyq-solved',
    category: 'ENTRANCE_PYQ',
    classGrade: 'BHU CHS Entrance Class 9 & 11',
    subject: 'All Subjects (Science, Math, Hindi, Eng, GK)',
    title: 'BHU CHS 10-Year Solved Question Papers with Explanatory Keys',
    author: "ZYZU'S Varanasi Academic Hub",
    authorQualification: 'Curated by Top 10 CHS Rankers & Mentors',
    pageCount: 160,
    fileSize: '14.2 MB',
    downloadsCount: 9800,
    rating: 4.88,
    language: 'Hindi & English Bilingual',
    highlights: ['Authentic 2016-2025 BHU Exam Papers', 'Negative Marking Traps Avoidance', 'General Science & UP History Modules', 'Expected Cutoff Analysis'],
    samplePreviewSnippet: {
      chapterTitle: 'BHU CHS Class 11 Entrance Solved Paper Analysis',
      keyPoints: [
        'Detailed Hindi Vyakarana: Sandhi, Samas, Ras, Alankar high-frequency questions',
        'Physics & Chemistry numerical shortcuts for speed optimization under 90 minutes',
        'Current scientific inventions, Nobel laureates, and Indian constitutional milestones',
        'Section-wise time management blueprint recommended by 2025 Rank #1'
      ],
      formulaIncluded: 'Cutoff Target: Science Stream 84+ Marks, Maths Stream 82+ Marks',
      diagramLabel: 'Subject-Wise Mark Weightage Pie Chart for BHU CHS Entrance'
    }
  },
  {
    id: 'note-govt-gk-gs',
    category: 'GOVT_EXAMS',
    classGrade: 'UP Police, SSC, State PCS',
    subject: 'General Knowledge & Current Affairs',
    title: 'State & Central Exams: 2026 Ultimate Static GK & Current Affairs Capsule',
    author: 'Devendra Pratap Singh',
    authorQualification: 'Ex-Civil Services Faculty • State Expert',
    pageCount: 134,
    fileSize: '11.0 MB',
    downloadsCount: 18700,
    rating: 4.92,
    language: 'Hindi Medium Priority (English Terms Included)',
    highlights: ['UP Special (Culture, Districts, Census)', 'Indian Constitution & Polity Articles', 'Indian Freedom Struggle Timeline', 'Important Govt Schemes 2026'],
    samplePreviewSnippet: {
      chapterTitle: 'Section 1: Uttar Pradesh Special & Modern Indian Polity',
      keyPoints: [
        'UP Geographical boundaries, 18 divisions, 75 districts, and rivers network',
        'Fundamental Rights (Articles 12-35) with landmark Supreme Court judgements',
        'Panchayati Raj 73rd Amendment and urban governance 74th Amendment provisions',
        'Major archaeological sites and historical monuments across Uttar Pradesh'
      ],
      formulaIncluded: 'Article 32 & 226: Five Writs (Habeas Corpus, Mandamus, Quo-Warranto, Certiorari, Prohibition)',
      diagramLabel: 'Complete Flowchart of Indian Judicial Hierarchy & Writ Jurisdictions'
    },
    isPopular: true
  }
];

interface AcademicNotesShowcaseSectionProps {
  maxDisplayCount?: number;
}

export const AcademicNotesShowcaseSection: React.FC<AcademicNotesShowcaseSectionProps> = ({
  maxDisplayCount = 3
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewModalNote, setPreviewModalNote] = useState<NoteItem | null>(null);

  // Gate Modal State
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateServiceInfo, setGateServiceInfo] = useState<{ title: string; desc: string; path: string }>({
    title: "ZYZU'S Digital Study Materials",
    desc: 'Access verified class notes, topper summaries, and solved papers.',
    path: '/study-materials'
  });

  const categories = [
    { id: 'ALL', label: 'All Curated Notes' },
    { id: 'CLASS_10', label: 'Class 10 Board Master' },
    { id: 'CLASS_12', label: 'Class 12 Boards & CUET' },
    { id: 'NEET_JEE', label: 'NEET & JEE High-Yield' },
    { id: 'ENTRANCE_PYQ', label: 'CHS & Navodaya PYQs' },
    { id: 'GOVT_EXAMS', label: 'UP Police & SSC GK' },
  ];

  const filteredNotes = ACADEMIC_NOTES_DATA.filter((note) => {
    const matchesCategory = selectedCategory === 'ALL' || note.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedNotes = filteredNotes.slice(0, maxDisplayCount);

  const handleDownload = (note: NoteItem) => {
    if (!user) {
      setGateServiceInfo({
        title: note.title,
        desc: `Register or sign in to download the full ${note.pageCount}-page verified PDF (${note.fileSize}) with digital watermark and instant sync.`,
        path: `/study-materials?download=${note.id}`
      });
      setGateModalOpen(true);
    } else {
      navigate(`/study-materials?view=${note.id}`);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 overflow-hidden">
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>District Toppers &amp; Faculty Curated</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-700 normal-case">100% Pedagogy Verified</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Academic &amp; Competitive{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Notes &amp; PYQ Vault
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Stop wasting hours sifting through unverified photocopies. Access structured, chapter-wise handwritten topper summaries, color-coded mind maps, formula cheat sheets, and 10-year step-by-step solved question papers vetted by accredited educators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/study-materials">
            <Button
              variant="outline"
              size="md"
              className="border-emerald-300 text-emerald-900 hover:bg-emerald-50 bg-white shadow-xs font-bold rounded-xl"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Further Explore (850+ Notes)
            </Button>
          </Link>
          <Link to="/study-materials?filter=PYQ">
            <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer">
              <Award className="w-4 h-4" />
              <span>Explore 10-Yr Solved Papers</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-600/25 scale-102'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search subject, chapter, or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Curated Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedNotes.map((note) => (
          <div
            key={note.id}
            className="group relative p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between space-y-5"
          >
            {/* Top Badges & Meta */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {note.classGrade}
                </span>
                {note.isPopular && (
                  <span className="flex items-center gap-1 text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    TOP DOWNLOAD
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  {note.subject}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-emerald-700 transition-colors leading-snug mt-1">
                  {note.title}
                </h3>
              </div>

              {/* Author & Faculty Credentials */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black text-xs border border-emerald-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{note.author}</p>
                  <p className="text-[11px] text-slate-500 truncate">{note.authorQualification}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pages</span>
                  <p className="text-xs font-black text-slate-900">{note.pageCount} pgs</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">PDF Size</span>
                  <p className="text-xs font-black text-slate-900">{note.fileSize}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
                  <p className="text-xs font-black text-amber-600 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {note.rating}
                  </p>
                </div>
              </div>

              {/* Key Bullet Highlights */}
              <div className="space-y-1.5 pt-1">
                {note.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-clamp-1">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Card Footer Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {note.language}
                </span>
                <span>{note.downloadsCount.toLocaleString('en-IN')} students enrolled</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalNote(note)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sample Peek</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(note)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Notes</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Further Explore Button & Discovery Banner */}
      <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              850+ Verified Chapters &amp; Solved Papers
            </span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              Showing 3 of {filteredNotes.length} in preview
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Looking for more chapter notes, formulas &amp; 10-year PYQ papers?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Dive into our complete repository spanning Class 10 &amp; 12 Board mind maps, NEET &amp; JEE high-yield sheets, BHU CHS &amp; Navodaya PYQ solutions, and UP Police/State GK capsules.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
          <Link 
            to={selectedCategory === 'ALL' ? '/study-materials' : `/study-materials?category=${selectedCategory}`}
            className="w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer group">
              <span>Further Explore Complete Notes Vault</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* ZYZU'S Academic Quality Guarantee Strip */}
      <div className="mt-12 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Zero Piracy &bull; Zero Fluff Guarantee
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Every Note Is Line-by-Line Fact Checked
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Notes are prepared by state toppers and subject teachers from BHU, AKTU, and SCERT. Printed digital access is also synchronized at all ZYZU'S verified self-study libraries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/study-materials">
              <button className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4" />
                <span>Open Digital Repository</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Sample Note Peek Modal */}
      {previewModalNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    SAMPLE PREVIEW
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {previewModalNote.classGrade}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-950 mt-1 leading-snug">
                  {previewModalNote.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Authored by <strong className="text-slate-800">{previewModalNote.author}</strong> ({previewModalNote.authorQualification})
                </p>
              </div>

              <button
                onClick={() => setPreviewModalNote(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated High-Res Document Preview Screen */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] text-slate-500">
                <span className="font-bold text-emerald-800">
                  PAGE 1 OF {previewModalNote.pageCount} &bull; {previewModalNote.samplePreviewSnippet.chapterTitle}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  WATERMARKED // ZYZU'S VERIFIED
                </span>
              </div>

              {/* Sample Notes Key Points */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  High-Yield Concept Digest:
                </span>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-700 font-sans text-xs">
                  {previewModalNote.samplePreviewSnippet.keyPoints.map((pt, i) => (
                    <li key={i} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Highlight Formula Box */}
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 font-mono text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                  Important Golden Formula / Reaction:
                </span>
                <p className="font-bold text-sm text-emerald-900">
                  {previewModalNote.samplePreviewSnippet.formulaIncluded}
                </p>
              </div>

              {/* Diagram / Schematic Label */}
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-[11px] flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Illustrated Asset:</strong> {previewModalNote.samplePreviewSnippet.diagramLabel}
                </span>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Full PDF includes all <strong className="text-slate-800">{previewModalNote.pageCount} pages</strong> with step-wise derivations and solutions.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewModalNote(null)}
                >
                  Close Preview
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewModalNote(null);
                    handleDownload(previewModalNote);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Registration Gate Modal */}
      <ServiceRegistrationGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        serviceTitle={gateServiceInfo.title}
        serviceDescription={gateServiceInfo.desc}
        intendedDestination={gateServiceInfo.path}
      />
    </section>
  );
};
