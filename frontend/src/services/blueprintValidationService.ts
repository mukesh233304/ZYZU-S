// FOCUSPOINT Pan-India Operator Mock Test Blueprint Validation Engine
// Enforces Question Quality Control, Pattern Compliance, and Anti-Duplicate Guardrails

import { 
  MockTest, 
  GovernmentExam, 
  QuestionItem, 
  BlueprintValidationReport, 
  BlueprintValidationIssue, 
  SectionCoverageDetail, 
  DifficultyRatioAnalysis, 
  DuplicateQuestionMatch 
} from '../types/academicIntelligence';

class BlueprintValidationService {
  /**
   * Calculate word token Jaccard similarity between two question texts (0.0 to 1.0)
   */
  public calculateTextSimilarity(textA: string, textB: string): number {
    if (!textA || !textB) return 0;
    const cleanTokens = (str: string): Set<string> => {
      return new Set(
        str.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(t => t.length > 2)
      );
    };

    const tokensA = cleanTokens(textA);
    const tokensB = cleanTokens(textB);
    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersectionCount = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) intersectionCount++;
    });

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    return unionCount === 0 ? 0 : intersectionCount / unionCount;
  }

  /**
   * Detect duplicate question pairs within a test
   */
  public findDuplicateQuestions(questions: QuestionItem[], thresholdPct: number = 80): DuplicateQuestionMatch[] {
    const duplicates: DuplicateQuestionMatch[] = [];

    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const qA = questions[i];
        const qB = questions[j];
        const similarity = this.calculateTextSimilarity(qA.questionText, qB.questionText);
        const similarityPct = Math.round(similarity * 100);

        if (similarityPct >= thresholdPct) {
          duplicates.push({
            questionAId: qA.id,
            questionANumber: i + 1,
            questionAText: qA.questionText,
            questionBId: qB.id,
            questionBNumber: j + 1,
            questionBText: qB.questionText,
            similarityScorePct: similarityPct
          });
        }
      }
    }

    return duplicates;
  }

  /**
   * Comprehensive blueprint audit for a mock test
   */
  public auditMockTestBlueprint(
    mockTest: MockTest, 
    exam: GovernmentExam, 
    questions: QuestionItem[],
    auditorName: string = "ZYZU'S Academic Lead"
  ): BlueprintValidationReport {
    const issues: BlueprintValidationIssue[] = [];

    const totalQuestions = questions.length;
    const targetQuestions = mockTest.totalQuestions || exam.totalQuestions || 25;

    // 1. Question Count Match
    if (totalQuestions !== targetQuestions) {
      issues.push({
        id: `iss-count-${Date.now()}`,
        severity: 'ERROR',
        ruleCode: 'QUESTION_COUNT_MISMATCH',
        title: 'Question Count Mismatch',
        message: `Blueprint has ${totalQuestions} questions authored, but blueprint target requires ${targetQuestions} questions.`,
        canAutoFix: false,
        fixActionLabel: 'Add Missing Questions'
      });
    }

    // 2. Total Marks Calculation & Consistency
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    const targetMarks = mockTest.totalMarks || exam.totalMarks || (targetQuestions * 2);
    if (Math.abs(totalMarks - targetMarks) > 0.1 && totalQuestions > 0) {
      issues.push({
        id: `iss-marks-${Date.now()}`,
        severity: 'WARNING',
        ruleCode: 'TOTAL_MARKS_MISMATCH',
        title: 'Marks Total Discrepancy',
        message: `Sum of authored question marks is ${totalMarks}, but target test marks is ${targetMarks}.`,
        canAutoFix: true,
        fixActionLabel: 'Auto-balance Marks'
      });
    }

    // 3. Negative Marking Standard
    const standardNegative = exam.negativeMarkingPerQuestion ?? (mockTest.negativeMarkingPerQuestion || 0.5);
    questions.forEach((q, idx) => {
      if (q.negativeMarks !== standardNegative && q.negativeMarks !== 0) {
        issues.push({
          id: `iss-neg-${q.id}-${idx}`,
          severity: 'INFO',
          ruleCode: 'NEGATIVE_MARKING_INVALID',
          title: `Non-standard Negative Marking (Q${idx + 1})`,
          message: `Question ${idx + 1} has -${q.negativeMarks} negative marks, while standard for ${exam.shortName || exam.name} is -${standardNegative}.`,
          questionId: q.id,
          questionNumber: idx + 1,
          canAutoFix: true,
          fixActionLabel: 'Set to Standard'
        });
      }
    });

    // 4. Per-Question Quality Audit (Correct Answer, Duplicate Options, Explanations)
    questions.forEach((q, idx) => {
      const qNum = idx + 1;

      // Question text length
      if (!q.questionText || q.questionText.trim().length < 8) {
        issues.push({
          id: `iss-empty-text-${q.id}`,
          severity: 'ERROR',
          ruleCode: 'QUESTION_COUNT_MISMATCH',
          title: `Incomplete Question Text (Q${qNum})`,
          message: `Question ${qNum} has very short or empty text.`,
          questionId: q.id,
          questionNumber: qNum
        });
      }

      // Check Correct Answer presence
      const hasCorrectOption = q.options?.some(o => o.isCorrect);
      if (!hasCorrectOption && q.questionType !== 'NUMERICAL') {
        issues.push({
          id: `iss-no-ans-${q.id}`,
          severity: 'ERROR',
          ruleCode: 'MISSING_CORRECT_ANSWER',
          title: `No Correct Answer Selected (Q${qNum})`,
          message: `Question ${qNum} does not have any option marked as correct.`,
          questionId: q.id,
          questionNumber: qNum,
          canAutoFix: true,
          fixActionLabel: 'Mark Option A as Default'
        });
      }

      // Check Duplicate Options within the same question
      if (q.options && q.options.length > 1) {
        const seenTexts = new Map<string, number>();
        q.options.forEach((opt, optIdx) => {
          const normText = opt.text.trim().toLowerCase();
          if (normText && seenTexts.has(normText)) {
            issues.push({
              id: `iss-dup-opt-${q.id}-${optIdx}`,
              severity: 'ERROR',
              ruleCode: 'DUPLICATE_OPTIONS',
              title: `Duplicate Options (Q${qNum})`,
              message: `Question ${qNum} has duplicate options: "${opt.text}" appears multiple times.`,
              questionId: q.id,
              questionNumber: qNum
            });
          } else if (normText) {
            seenTexts.set(normText, optIdx);
          }
        });
      }

      // Check Explanation
      if (!q.explanation || q.explanation.trim().length < 10) {
        issues.push({
          id: `iss-exp-${q.id}`,
          severity: 'WARNING',
          ruleCode: 'MISSING_EXPLANATION',
          title: `Missing or Sparse Explanation (Q${qNum})`,
          message: `Question ${qNum} lacks a detailed pedagogical explanation for student learning review.`,
          questionId: q.id,
          questionNumber: qNum,
          canAutoFix: true,
          fixActionLabel: 'AI Generate Explanation'
        });
      }
    });

    // 5. Duplicate Question Across Test Detection
    const duplicateMatches = this.findDuplicateQuestions(questions, 80);
    duplicateMatches.forEach(dup => {
      issues.push({
        id: `iss-dup-q-${dup.questionAId}-${dup.questionBId}`,
        severity: 'ERROR',
        ruleCode: 'DUPLICATE_QUESTION',
        title: `Duplicate Questions Detected (Q${dup.questionANumber} & Q${dup.questionBNumber})`,
        message: `Questions ${dup.questionANumber} and ${dup.questionBNumber} have ${dup.similarityScorePct}% textual similarity.`,
        questionId: dup.questionBId,
        questionNumber: dup.questionBNumber
      });
    });

    // 6. Section & Subject Coverage Analysis
    const sectionCoverage: SectionCoverageDetail[] = [];
    const subjectsInExam = exam.subjects || [mockTest.subject || 'General Knowledge'];

    subjectsInExam.forEach((sub, sIdx) => {
      const subjectQuestions = questions.filter(q => 
        q.subject.toLowerCase() === sub.toLowerCase() || 
        (mockTest.subject && mockTest.subject.toLowerCase() === sub.toLowerCase())
      );
      
      const expectedPerSubject = Math.round(targetQuestions / (subjectsInExam.length || 1));
      const isBalanced = Math.abs(subjectQuestions.length - expectedPerSubject) <= 2;

      sectionCoverage.push({
        sectionId: `sec-${sIdx}`,
        sectionName: sub,
        subject: sub,
        actualQuestions: subjectQuestions.length,
        targetQuestions: expectedPerSubject,
        actualMarks: subjectQuestions.reduce((acc, q) => acc + (q.marks || 0), 0),
        targetMarks: expectedPerSubject * 2,
        isBalanced
      });

      if (!isBalanced && totalQuestions > 0 && subjectsInExam.length > 1) {
        issues.push({
          id: `iss-sec-${sIdx}`,
          severity: 'WARNING',
          ruleCode: 'SECTION_COUNT_MISMATCH',
          title: `Section Balance Alert: ${sub}`,
          message: `Subject "${sub}" has ${subjectQuestions.length} questions, expected approximately ${expectedPerSubject}.`,
          sectionName: sub
        });
      }
    });

    // 7. Difficulty Ratio Analysis
    let easyCount = 0;
    let moderateCount = 0;
    let hardCount = 0;

    questions.forEach(q => {
      if (q.difficulty === 'EASY') easyCount++;
      else if (q.difficulty === 'HARD') hardCount++;
      else moderateCount++;
    });

    const easyPct = totalQuestions > 0 ? Math.round((easyCount / totalQuestions) * 100) : 0;
    const moderatePct = totalQuestions > 0 ? Math.round((moderateCount / totalQuestions) * 100) : 0;
    const hardPct = totalQuestions > 0 ? Math.round((hardCount / totalQuestions) * 100) : 0;

    // Ideal: Easy 20-35%, Moderate 45-60%, Hard 15-25%
    const isDifficultyCompliant = easyPct >= 15 && easyPct <= 45 && moderatePct >= 35 && moderatePct <= 70 && hardPct >= 10 && hardPct <= 35;

    if (!isDifficultyCompliant && totalQuestions >= 10) {
      issues.push({
        id: `iss-diff-imbalance`,
        severity: 'INFO',
        ruleCode: 'DIFFICULTY_IMBALANCE',
        title: 'Difficulty Distribution Advisory',
        message: `Current distribution (Easy: ${easyPct}%, Mod: ${moderatePct}%, Hard: ${hardPct}%) deviates slightly from the target (30% / 50% / 20%).`,
        canAutoFix: true,
        fixActionLabel: 'Auto-rebalance Difficulty Tags'
      });
    }

    const difficultyAnalysis: DifficultyRatioAnalysis = {
      easyCount,
      easyPct,
      targetEasyPct: 30,
      moderateCount,
      moderatePct,
      targetModeratePct: 50,
      hardCount,
      hardPct,
      targetHardPct: 20,
      isCompliant: isDifficultyCompliant
    };

    // Calculate Final Readiness Score
    const errorCount = issues.filter(i => i.severity === 'ERROR').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;
    const infoCount = issues.filter(i => i.severity === 'INFO').length;

    let readinessScore = 100 - (errorCount * 20) - (warningCount * 6) - (infoCount * 2);
    if (totalQuestions === 0) readinessScore = 0;
    readinessScore = Math.max(0, Math.min(100, readinessScore));

    const isValid = errorCount === 0 && totalQuestions > 0;

    let complianceSummary = '';
    if (isValid && readinessScore >= 90) {
      complianceSummary = "EXCELLENT: This mock test fully satisfies ZYZU'S Exam Pattern & Quality Guidelines and is 100% ready for publishing.";
    } else if (isValid) {
      complianceSummary = 'PASS WITH ADVISORIES: All mandatory syllabus and correctness requirements met. Review minor warnings before publishing.';
    } else {
      complianceSummary = `ACTION REQUIRED: Found ${errorCount} blocking errors that must be resolved before this test can be published to students.`;
    }

    return {
      id: `bp-rep-${mockTest.id || Date.now()}`,
      mockTestId: mockTest.id,
      mockTestTitle: mockTest.title,
      examId: exam.id,
      examName: exam.name,
      isValid,
      readinessScore,
      totalQuestions,
      targetQuestions,
      totalMarks,
      targetMarks,
      durationMinutes: mockTest.durationMinutes || exam.durationMinutes || 60,
      targetDurationMinutes: exam.durationMinutes || 60,
      negativeMarking: mockTest.negativeMarkingPerQuestion ?? standardNegative,
      standardNegativeMarking: standardNegative,
      errorCount,
      warningCount,
      infoCount,
      sectionCoverage,
      difficultyAnalysis,
      duplicateMatches,
      issues,
      auditedBy: auditorName,
      auditedAt: new Date().toISOString(),
      complianceSummary
    };
  }

  /**
   * Auto-fix negative marks to match official standard
   */
  public autoFixNegativeMarking(questions: QuestionItem[], standardNegative: number): QuestionItem[] {
    return questions.map(q => ({
      ...q,
      negativeMarks: standardNegative
    }));
  }

  /**
   * Auto-fix missing correct answers by selecting Option A as fallback
   */
  public autoFixMissingCorrectAnswers(questions: QuestionItem[]): QuestionItem[] {
    return questions.map(q => {
      const hasCorrect = q.options?.some(o => o.isCorrect);
      if (!hasCorrect && q.options && q.options.length > 0 && q.questionType !== 'NUMERICAL') {
        const updatedOptions = q.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === 0
        }));
        return {
          ...q,
          options: updatedOptions,
          correctAnswer: 'A'
        };
      }
      return q;
    });
  }

  /**
   * Auto-balance question marks uniformly to match target total
   */
  public autoBalanceMarks(questions: QuestionItem[], targetTotalMarks: number): QuestionItem[] {
    if (questions.length === 0) return questions;
    const perQuestionMark = Math.round((targetTotalMarks / questions.length) * 10) / 10;
    return questions.map(q => ({
      ...q,
      marks: perQuestionMark
    }));
  }
}

export const blueprintValidationService = new BlueprintValidationService();
