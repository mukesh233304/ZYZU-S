const academicSubscriptionService = require('../services/academicSubscriptionService');

class AcademicSubscriptionController {
  async resolvePricing(req, res) {
    try {
      const studentId = req.user ? req.user.id : null;
      const { productId, districtId, state, libraryId, teacherId, couponCode } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'productId is required'
        });
      }

      const pricing = academicSubscriptionService.resolvePrice(
        productId,
        studentId,
        districtId || (req.user ? req.user.district_id : null),
        state || null,
        libraryId,
        teacherId,
        couponCode
      );

      return res.status(200).json({
        success: true,
        data: pricing
      });
    } catch (err) {
      console.error('Error resolving academic pricing:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to resolve pricing'
      });
    }
  }

  async purchase(req, res) {
    try {
      const studentId = req.user.id;
      const result = academicSubscriptionService.purchaseSubscription(studentId, req.body);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error purchasing subscription:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to complete subscription purchase'
      });
    }
  }

  async getMySubscriptions(req, res) {
    try {
      const studentId = req.user.id;
      const subscriptions = academicSubscriptionService.getStudentSubscriptions(studentId);

      return res.status(200).json({
        success: true,
        count: subscriptions.length,
        data: subscriptions
      });
    } catch (err) {
      console.error('Error retrieving subscriptions:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve active subscriptions'
      });
    }
  }

  async checkEntitlement(req, res) {
    try {
      const studentId = req.user.id;
      const { feature } = req.query;

      const entitlement = academicSubscriptionService.checkEntitlement(studentId, feature);
      return res.status(200).json({
        success: true,
        data: entitlement
      });
    } catch (err) {
      console.error('Error checking entitlement:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to check feature entitlement'
      });
    }
  }
}

module.exports = new AcademicSubscriptionController();
