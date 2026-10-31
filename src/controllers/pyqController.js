const pyqIngestionService = require('../services/pyqIngestionService');

class PyqController {
  async listPapers(req, res) {
    try {
      const { examId, examYear, shift, isCbtAvailable } = req.query;
      const filters = {};
      if (examId) filters.examId = examId;
      if (examYear) filters.examYear = parseInt(examYear, 10);
      if (shift) filters.shift = shift;
      if (isCbtAvailable !== undefined) filters.isCbtAvailable = isCbtAvailable === 'true' || isCbtAvailable === '1';

      const papers = pyqIngestionService.listPapers(filters);
      return res.status(200).json({
        success: true,
        count: papers.length,
        data: papers
      });
    } catch (err) {
      console.error('Error listing PYQ papers:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve previous year question papers'
      });
    }
  }

  async digitizePaper(req, res) {
    try {
      const operatorId = req.user ? req.user.id : null;
      const result = pyqIngestionService.digitizePaper(req.body, operatorId);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error digitizing PYQ paper:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to digitize previous year paper'
      });
    }
  }

  async synthesizeCbt(req, res) {
    try {
      const { id } = req.params;
      const mockTestId = pyqIngestionService.synthesizeCbtTest(id);

      return res.status(200).json({
        success: true,
        data: {
          pyqId: id,
          linkedCbtMockTestId: mockTestId,
          message: 'CBT Mock Test successfully synthesized and linked to PYQ Paper'
        }
      });
    } catch (err) {
      console.error('Error synthesizing CBT exam:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to synthesize CBT test'
      });
    }
  }
}

module.exports = new PyqController();
