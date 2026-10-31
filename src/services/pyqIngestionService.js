const db = require('../db/database');
const crypto = require('crypto');

class PyqIngestionService {
  /**
   * List digitized previous year question papers
   */
  listPapers(filters = {}) {
    let query = `
      SELECT pyq.*, ge.title as exam_title, ge.category as exam_category_title
      FROM pyq_papers pyq
      JOIN government_exams ge ON pyq.exam_id = ge.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.examId) {
      query += ' AND pyq.exam_id = ?';
      params.push(filters.examId);
    }
    if (filters.examYear) {
      query += ' AND pyq.exam_year = ?';
      params.push(filters.examYear);
    }
    if (filters.shift) {
      query += ' AND pyq.shift = ?';
      params.push(filters.shift);
    }
    if (filters.isCbtAvailable !== undefined) {
      query += ' AND pyq.is_cbt_available = ?';
      params.push(filters.isCbtAvailable ? 1 : 0);
    }

    query += ' ORDER BY pyq.exam_year DESC, pyq.exam_date DESC';

    const papers = db.prepare(query).all(...params);

    return papers.map(p => ({
      ...p,
      sections: JSON.parse(p.sections_json || '[]')
    }));
  }

  /**
   * Ingest / Digitize a new official Previous Year Paper
   */
  digitizePaper(data, operatorId) {
    const {
      examId,
      examName,
      examCategory,
      examYear,
      tierOrStage = 'Tier-1',
      examDate,
      shift = 'Shift 1',
      shiftTiming,
      paperCode,
      language = 'Bilingual (Hindi + English)',
      durationMinutes = 60,
      negativeMarking = 0.25,
      sections = [],
      masterPaperPdfUrl,
      officialAnswerKeyUrl,
      solvedSolutionsPdfUrl,
      isCbtAvailable = false,
      ocrConfidenceScore = 98.5
    } = data;

    if (!examId || !examName || !examYear || !examDate || !sections || sections.length === 0) {
      throw new Error('Missing required PYQ fields (examId, examName, examYear, examDate, sections)');
    }

    // Compute total questions and marks from sections
    let totalQuestions = 0;
    let totalMarks = 0;

    for (const sec of sections) {
      totalQuestions += sec.questionCount || 0;
      totalMarks += sec.marks || 0;
    }

    const pyqId = `pyq-${crypto.randomUUID()}`;
    const sectionsJson = JSON.stringify(sections);

    let validOperatorId = null;
    if (operatorId) {
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(operatorId);
      if (user) validOperatorId = user.id;
    }

    db.prepare(`
      INSERT INTO pyq_papers
      (id, exam_id, exam_name, exam_category, exam_year, tier_or_stage, exam_date, shift, shift_timing, paper_code, language, total_questions, total_marks, duration_minutes, negative_marking, sections_json, master_paper_pdf_url, official_answer_key_url, solved_solutions_pdf_url, is_cbt_available, ocr_confidence_score, digitized_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
    `).run(
      pyqId,
      examId,
      examName,
      examCategory || 'COMPETITIVE_EXAM',
      examYear,
      tierOrStage,
      examDate,
      shift,
      shiftTiming || null,
      paperCode || null,
      language,
      totalQuestions,
      totalMarks,
      durationMinutes,
      negativeMarking,
      sectionsJson,
      masterPaperPdfUrl || null,
      officialAnswerKeyUrl || null,
      solvedSolutionsPdfUrl || null,
      isCbtAvailable ? 1 : 0,
      ocrConfidenceScore,
      validOperatorId
    );

    let linkedCbtMockTestId = null;

    // If CBT synthesis enabled, register an interactive mock test in the test bank
    if (isCbtAvailable) {
      linkedCbtMockTestId = this.synthesizeCbtTest(pyqId);
    }

    return {
      success: true,
      pyqId,
      linkedCbtMockTestId,
      message: 'Official Previous Year Paper digitized and published to PYQ Vault.'
    };
  }

  /**
   * 1-Click CBT Synthesis: Generates launchable CBT Mock Test from PYQ Paper
   */
  synthesizeCbtTest(pyqId) {
    const paper = db.prepare('SELECT * FROM pyq_papers WHERE id = ?').get(pyqId);
    if (!paper) {
      throw new Error('PYQ paper not found');
    }

    const mockTestId = `mock-pyq-${crypto.randomUUID().slice(0, 8)}`;
    const title = `${paper.exam_name} ${paper.exam_year} (${paper.shift}) Official CBT Paper`;

    db.prepare(`
      INSERT INTO mock_tests
      (id, exam_id, title, test_type, total_questions, duration_minutes, total_marks, passing_percentage, negative_marking_ratio, is_published)
      VALUES (?, ?, ?, 'FULL_LENGTH', ?, ?, ?, 40.0, ?, 1)
    `).run(
      mockTestId,
      paper.exam_id,
      title,
      paper.total_questions,
      paper.duration_minutes,
      paper.total_marks,
      paper.negative_marking
    );

    // Link mock test to paper
    db.prepare(`
      UPDATE pyq_papers 
      SET is_cbt_available = 1, linked_cbt_mock_test_id = ? 
      WHERE id = ?
    `).run(mockTestId, pyqId);

    return mockTestId;
  }
}

module.exports = new PyqIngestionService();
