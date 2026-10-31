const db = require('../db/database');

function seedAcademicData() {
  console.log('--- Starting FocusPoint Academic Intelligence & Mock Test Seeder ---');

  // 1. Seed Government & Entrance Exams
  const insertExam = db.prepare(`
    INSERT OR REPLACE INTO government_exams 
    (id, title, category, description, eligibility, total_marks, duration_minutes, negative_marking_ratio, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const exams = [
    ['exam-ssc-cgl', 'SSC CGL Tier 1', 'SSC', 'Staff Selection Commission Combined Graduate Level Examination', 'Graduation in any discipline', 200, 60, 0.50, 1],
    ['exam-up-police', 'UP Police Constable', 'STATE_EXAMS', 'Uttar Pradesh Police Recruitment and Promotion Board Examination', '10+2 Intermediate from recognized board', 300, 120, 0.25, 1],
    ['exam-neet-ug', 'NEET UG Pre-Medical', 'ENTRANCE_MEDICAL', 'National Eligibility cum Entrance Test for MBBS/BDS Admissions', 'Class 12 Science PCB with min 50% marks', 720, 200, 1.00, 1],
    ['exam-jee-main', 'JEE Main (B.E./B.Tech)', 'ENTRANCE_ENGINEERING', 'Joint Entrance Examination for Engineering Admissions', 'Class 12 Science PCM / Appearing', 300, 180, 1.00, 1],
    ['exam-ctet', 'CTET Paper 1 & 2', 'TEACHING', 'Central Teacher Eligibility Test conducted by CBSE', 'B.Ed / D.El.Ed with graduate qualification', 150, 150, 0.00, 1],
    ['exam-jnvst-6', 'Navodaya Vidyalaya (Class 6)', 'SCHOOL_ENTRANCE', 'Jawahar Navodaya Vidyalaya Selection Test for Class 6 Admission', 'Studying in Class 5 in recognized rural/urban school', 100, 120, 0.00, 1],
    ['exam-chs-9', 'Central Hindu School (Class 9)', 'SCHOOL_ENTRANCE', 'Banaras Hindu University CHS Class 9 Entrance Test', 'Passed Class 8 from recognized school', 100, 120, 0.00, 1]
  ];

  for (const e of exams) {
    insertExam.run(...e);
  }
  console.log(`✓ Seeded ${exams.length} Government & School Entrance Exams`);

  // 2. Seed Subjects and Topics
  const insertSubject = db.prepare(`
    INSERT OR REPLACE INTO exam_subjects (id, exam_id, name, weightage_marks)
    VALUES (?, ?, ?, ?)
  `);

  const subjects = [
    ['sub-ssc-math', 'exam-ssc-cgl', 'Quantitative Aptitude', 50],
    ['sub-ssc-reasoning', 'exam-ssc-cgl', 'General Intelligence & Reasoning', 50],
    ['sub-ssc-english', 'exam-ssc-cgl', 'English Comprehension', 50],
    ['sub-ssc-gs', 'exam-ssc-cgl', 'General Awareness', 50],
    ['sub-up-math', 'exam-up-police', 'Numerical & Mental Ability', 75],
    ['sub-up-hindi', 'exam-up-police', 'General Hindi', 75],
    ['sub-neet-physics', 'exam-neet-ug', 'Physics', 180],
    ['sub-neet-chemistry', 'exam-neet-ug', 'Chemistry', 180],
    ['sub-neet-biology', 'exam-neet-ug', 'Biology (Botany & Zoology)', 360],
    ['sub-jee-math', 'exam-jee-main', 'Mathematics', 100],
    ['sub-jee-physics', 'exam-jee-main', 'Physics', 100],
    ['sub-jee-chem', 'exam-jee-main', 'Chemistry', 100]
  ];

  for (const s of subjects) {
    insertSubject.run(...s);
  }

  // 3. Seed Question Bank items
  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO question_bank 
    (id, subject_name, topic_name, exam_category, question_text, question_type, options, correct_option_ids, explanation, difficulty, marks, negative_marks, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const questions = [
    [
      'qb-ssc-001',
      'Quantitative Aptitude',
      'Percentage',
      'SSC',
      'If the price of sugar is increased by 20%, by what percent must a household reduce its consumption so that total expenditure remains unchanged?',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: '16.67%' },
        { id: 'opt_2', text: '20%' },
        { id: 'opt_3', text: '25%' },
        { id: 'opt_4', text: '14.28%' }
      ]),
      JSON.stringify(['opt_1']),
      'Required percentage reduction = [r / (100 + r)] * 100 = [20 / 120] * 100 = 16.67%.',
      'EASY',
      2.0,
      0.5,
      'PUBLISHED'
    ],
    [
      'qb-ssc-002',
      'Quantitative Aptitude',
      'Profit and Loss',
      'SSC',
      'A shopkeeper sells a book at a profit of 12%. Had he sold it for ₹18 more, 18% profit would have been gained. Find the cost price of the book.',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: '₹250' },
        { id: 'opt_2', text: '₹300' },
        { id: 'opt_3', text: '₹360' },
        { id: 'opt_4', text: '₹400' }
      ]),
      JSON.stringify(['opt_2']),
      'Difference in profit % = 18% - 12% = 6%. Since 6% of CP = ₹18, CP = (18 / 6) * 100 = ₹300.',
      'MEDIUM',
      2.0,
      0.5,
      'PUBLISHED'
    ],
    [
      'qb-ssc-003',
      'General Intelligence & Reasoning',
      'Number Series',
      'SSC',
      'Find the missing number in the sequence: 7, 12, 22, 42, 82, ?',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: '142' },
        { id: 'opt_2', text: '152' },
        { id: 'opt_3', text: '162' },
        { id: 'opt_4', text: '172' }
      ]),
      JSON.stringify(['opt_3']),
      'Pattern is differences doubling: +5, +10, +20, +40, +80. Thus 82 + 80 = 162.',
      'EASY',
      2.0,
      0.5,
      'PUBLISHED'
    ],
    [
      'qb-ssc-004',
      'General Awareness',
      'Indian Constitution',
      'SSC',
      'Which Constitutional Amendment Act introduced the Goods and Services Tax (GST) in India?',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: '99th Amendment' },
        { id: 'opt_2', text: '100th Amendment' },
        { id: 'opt_3', text: '101st Amendment' },
        { id: 'opt_4', text: '103rd Amendment' }
      ]),
      JSON.stringify(['opt_3']),
      'The 101st Constitutional Amendment Act, 2016 paved the way for introducing the Goods and Services Tax (GST) nationwide from July 1, 2017.',
      'EASY',
      2.0,
      0.5,
      'PUBLISHED'
    ],
    [
      'qb-jee-001',
      'Mathematics',
      'Calculus',
      'ENTRANCE_ENGINEERING',
      'Evaluate the limit: lim(x -> 0) [sin(3x) / x].',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: '0' },
        { id: 'opt_2', text: '1' },
        { id: 'opt_3', text: '3' },
        { id: 'opt_4', text: 'Undefined' }
      ]),
      JSON.stringify(['opt_3']),
      'Standard limit formula: lim(x -> 0) [sin(kx)/x] = k. Here k = 3.',
      'EASY',
      4.0,
      1.0,
      'PUBLISHED'
    ],
    [
      'qb-neet-001',
      'Biology',
      'Cell Biology',
      'ENTRANCE_MEDICAL',
      'Which organelle is known as the powerhouse of the cell?',
      'MCQ',
      JSON.stringify([
        { id: 'opt_1', text: 'Ribosome' },
        { id: 'opt_2', text: 'Mitochondria' },
        { id: 'opt_3', text: 'Golgi apparatus' },
        { id: 'opt_4', text: 'Lysosome' }
      ]),
      JSON.stringify(['opt_2']),
      'Mitochondria generate most of the chemical energy needed to power the cell biochemical reactions, stored in adenosine triphosphate (ATP).',
      'EASY',
      4.0,
      1.0,
      'PUBLISHED'
    ]
  ];

  for (const q of questions) {
    insertQuestion.run(...q);
  }
  console.log(`✓ Seeded ${questions.length} Question Bank Items`);

  // 4. Seed Mock Tests & Mock Test Questions
  const insertMockTest = db.prepare(`
    INSERT OR REPLACE INTO mock_tests 
    (id, exam_id, title, test_type, total_questions, duration_minutes, total_marks, passing_percentage, negative_marking_ratio, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMockTest.run('mock-ssc-cgl-01', 'exam-ssc-cgl', 'SSC CGL All-India Full Mock Test #1', 'FULL_LENGTH', 4, 60, 8.0, 40.0, 0.25, 1);
  insertMockTest.run('mock-ssc-cgl-02', 'exam-ssc-cgl', 'SSC CGL Quantitative Aptitude Sectional', 'SECTIONAL', 2, 30, 4.0, 40.0, 0.25, 1);
  insertMockTest.run('mock-jee-01', 'exam-jee-main', 'JEE Main Speed Sprint Test #1', 'SECTIONAL', 1, 15, 4.0, 40.0, 0.25, 1);

  const insertMTQ = db.prepare(`
    INSERT OR REPLACE INTO mock_test_questions (mock_test_id, question_id, question_order)
    VALUES (?, ?, ?)
  `);

  insertMTQ.run('mock-ssc-cgl-01', 'qb-ssc-001', 1);
  insertMTQ.run('mock-ssc-cgl-01', 'qb-ssc-002', 2);
  insertMTQ.run('mock-ssc-cgl-01', 'qb-ssc-003', 3);
  insertMTQ.run('mock-ssc-cgl-01', 'qb-ssc-004', 4);
  insertMTQ.run('mock-ssc-cgl-02', 'qb-ssc-001', 1);
  insertMTQ.run('mock-ssc-cgl-02', 'qb-ssc-002', 2);
  insertMTQ.run('mock-jee-01', 'qb-jee-001', 1);

  console.log('✓ Seeded Mock Tests & Question Junctions');

  // 5. Seed 6-Tier Priority Pricing Rules
  const insertPricingRule = db.prepare(`
    INSERT OR REPLACE INTO academic_pricing_rules 
    (id, product_id, product_type, scope, target_id, base_price, discount_percentage, override_price, is_active, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const pricingRules = [
    // 1. Pan-India Default (Priority 1)
    ['pr-cgl-pan-india', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'PAN_INDIA', null, 499, 0, null, 1, 1],
    // 2. State-level Override (Priority 2: Uttar Pradesh)
    ['pr-cgl-up', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'STATE', 'Uttar Pradesh', 499, 20, 399, 1, 2],
    // 3. District-level Override (Priority 3: Ghazipur district)
    ['pr-cgl-ghazipur', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'DISTRICT', 'Ghazipur', 499, 40, 299, 1, 3],
    // 4. Library Member Override (Priority 4)
    ['pr-cgl-library', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'LIBRARY', 'lib-saidpur-01', 499, 50, 249, 1, 4],
    // 5. Teacher Allotment Override (Priority 5)
    ['pr-cgl-teacher', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'TEACHER', 'usr-teacher-rajesh', 499, 60, 199, 1, 5],
    // 6. Particular Student Override (Priority 6: Aryan student)
    ['pr-cgl-student', 'prod-ssc-cgl-pass', 'EXAM_PASS', 'STUDENT', 'usr-student-aryan', 499, 70, 149, 1, 6],

    // Default Pan-India for other products
    ['pr-jee-pan-india', 'prod-jee-pass', 'EXAM_PASS', 'PAN_INDIA', null, 899, 0, null, 1, 1],
    ['pr-neet-pan-india', 'prod-neet-pass', 'EXAM_PASS', 'PAN_INDIA', null, 899, 0, null, 1, 1],
    ['pr-navodaya-pan-india', 'prod-jnvst-pass', 'EXAM_PASS', 'PAN_INDIA', null, 199, 0, null, 1, 1]
  ];

  for (const pr of pricingRules) {
    insertPricingRule.run(...pr);
  }
  console.log(`✓ Seeded ${pricingRules.length} 6-Tier Hierarchical Pricing Rules`);

  // 6. Seed Academic Eligibility Rules
  const insertEligibility = db.prepare(`
    INSERT OR REPLACE INTO academic_eligibility_rules
    (id, exam_id, min_class, max_class, allowed_streams, min_age, max_age, required_state, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const eligibilityRules = [
    ['el-jnvst-6', 'exam-jnvst-6', 5, 5, JSON.stringify(['ALL']), 9, 12, null, 'Applicant must be in Class 5 for Class 6 admission', 1],
    ['el-chs-9', 'exam-chs-9', 8, 8, JSON.stringify(['ALL']), 13, 15, null, 'Applicant must have passed Class 8', 1],
    ['el-jee-main', 'exam-jee-main', 11, 13, JSON.stringify(['SCIENCE_PCM']), 15, 25, null, 'Physics, Chemistry & Math mandatory', 1],
    ['el-neet-ug', 'exam-neet-ug', 11, 13, JSON.stringify(['SCIENCE_PCB']), 17, 25, null, 'Physics, Chemistry & Biology mandatory', 1],
    ['el-ssc-cgl', 'exam-ssc-cgl', 15, 20, JSON.stringify(['ALL']), 18, 32, null, 'Graduation degree required', 1],
    ['el-up-police', 'exam-up-police', 12, 20, JSON.stringify(['ALL']), 18, 28, 'Uttar Pradesh', '10+2 Intermediate with UP domicile preference', 1]
  ];

  for (const el of eligibilityRules) {
    insertEligibility.run(...el);
  }
  console.log(`✓ Seeded ${eligibilityRules.length} Academic Eligibility Rules`);

  // 7. Seed PYQ Papers (Previous Year Exam Papers)
  const insertPyq = db.prepare(`
    INSERT OR REPLACE INTO pyq_papers
    (id, exam_id, exam_name, exam_category, exam_year, tier_or_stage, exam_date, shift, shift_timing, paper_code, language, total_questions, total_marks, duration_minutes, negative_marking, sections_json, master_paper_pdf_url, official_answer_key_url, solved_solutions_pdf_url, is_cbt_available, linked_cbt_mock_test_id, ocr_confidence_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const pyqs = [
    [
      'pyq-ssc-2024-t1-s1',
      'exam-ssc-cgl',
      'SSC CGL Tier 1',
      'SSC',
      2024,
      'Tier-1',
      '2024-09-12',
      'Shift 1',
      '09:00 AM - 10:00 AM',
      'Set A (Code 101)',
      'Bilingual (Hindi + English)',
      100,
      200.0,
      60,
      0.50,
      JSON.stringify([
        { name: 'Quantitative Aptitude', questionCount: 25, marks: 50, negativeMarks: 0.5 },
        { name: 'General Intelligence & Reasoning', questionCount: 25, marks: 50, negativeMarks: 0.5 },
        { name: 'General Awareness', questionCount: 25, marks: 50, negativeMarks: 0.5 },
        { name: 'English Comprehension', questionCount: 25, marks: 50, negativeMarks: 0.5 }
      ]),
      '/uploads/pyq/ssc_cgl_2024_t1_s1_paper.pdf',
      '/uploads/pyq/ssc_cgl_2024_t1_s1_key.pdf',
      '/uploads/pyq/ssc_cgl_2024_t1_s1_solutions.pdf',
      1,
      'mock-ssc-cgl-01',
      99.2,
      'PUBLISHED'
    ],
    [
      'pyq-up-police-2024-s2',
      'exam-up-police',
      'UP Police Constable Re-Exam',
      'STATE_EXAMS',
      2024,
      'Written Examination',
      '2024-08-24',
      'Shift 2',
      '03:00 PM - 05:00 PM',
      'Series B (Code UP-B2)',
      'Hindi Medium',
      150,
      300.0,
      120,
      0.25,
      JSON.stringify([
        { name: 'General Hindi', questionCount: 37, marks: 74, negativeMarks: 0.25 },
        { name: 'General Knowledge', questionCount: 38, marks: 76, negativeMarks: 0.25 },
        { name: 'Numerical & Mental Ability', questionCount: 38, marks: 76, negativeMarks: 0.25 },
        { name: 'Mental Aptitude / IQ Test', questionCount: 37, marks: 74, negativeMarks: 0.25 }
      ]),
      '/uploads/pyq/up_police_2024_s2_paper.pdf',
      '/uploads/pyq/up_police_2024_s2_key.pdf',
      '/uploads/pyq/up_police_2024_s2_solutions.pdf',
      0,
      null,
      98.6,
      'PUBLISHED'
    ]
  ];

  for (const p of pyqs) {
    insertPyq.run(...p);
  }
  console.log(`✓ Seeded ${pyqs.length} Official PYQ Papers`);

  console.log('--- Academic Seeding Completed Successfully ---');
}

if (require.main === module) {
  seedAcademicData();
}

module.exports = seedAcademicData;
