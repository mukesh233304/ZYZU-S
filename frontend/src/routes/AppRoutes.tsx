import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { PublicLayout } from '../components/common/PublicLayout';

// Public Pages
import { HomePage } from '../features/public/HomePage';
import { FindTutorPage } from '../features/public/FindTutorPage';
import { TeacherProfilePage } from '../features/public/TeacherProfilePage';
import { FindLibraryPage } from '../features/public/FindLibraryPage';
import { LibraryDetailsPage } from '../features/public/LibraryDetailsPage';
import { LibraryBookingPage } from '../features/public/LibraryBookingPage';
import { AboutPage } from '../features/public/AboutPage';
import { HowItWorksPage } from '../features/public/HowItWorksPage';
import { ContactPage } from '../features/public/ContactPage';
import { MockTestsPublicPage } from '../features/public/MockTestsPublicPage';
import { StudyMaterialsPublicPage } from '../features/public/StudyMaterialsPublicPage';
import { ServicesPage } from '../features/public/ServicesPage';
import { AccountPage } from '../features/public/AccountPage';
import { LegalPage } from '../features/public/LegalPage';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterStudentPage } from '../features/auth/RegisterStudentPage';
import { RegisterTeacherPage } from '../features/auth/RegisterTeacherPage';
import { RegisterLibraryOwnerPage } from '../features/auth/RegisterLibraryOwnerPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { SuperAdminSetupPage } from '../features/auth/SuperAdminSetupPage';
import { SuperAdminLoginPage } from '../features/auth/SuperAdminLoginPage';
import { DistrictAdminLoginPage } from '../features/auth/DistrictAdminLoginPage';

// Student Pages
import { StudentDashboard } from '../features/student/StudentDashboard';
import { StudentTutorRequestFlow } from '../features/student/StudentTutorRequestFlow';
import { StudentRequestTracking } from '../features/student/StudentRequestTracking';
import { StudentMyTeacher } from '../features/student/StudentMyTeacher';
import { StudentAttendance } from '../features/student/StudentAttendance';
import { StudentFees } from '../features/student/StudentFees';
import { StudentBookings } from '../features/student/StudentBookings';
import { StudentProfile } from '../features/student/StudentProfile';
import { StudentNotifications } from '../features/student/StudentNotifications';
import { StudentSupport } from '../features/student/StudentSupport';
import { StudentSettings } from '../features/student/StudentSettings';
import { StudentStudyMaterial } from '../features/student/StudentStudyMaterial';
import { BookingConfirmationPage } from '../features/booking/BookingConfirmationPage';
import { QrAttendanceScanPage } from '../features/attendance/QrAttendanceScanPage';

// Academic Intelligence & Mock Test Pages
import { StudentGrowthIntelligence } from '../features/student/StudentGrowthIntelligence';
import { GovernmentExamMockTestCenter } from '../features/student/GovernmentExamMockTestCenter';
import { LiveMockTestAttempt } from '../features/student/LiveMockTestAttempt';
import { MockTestResultReview } from '../features/student/MockTestResultReview';
import { StudentMistakeBook } from '../features/student/StudentMistakeBook';
import { DigitalLearningStore } from '../features/student/DigitalLearningStore';
import { MySubscriptionsDashboard } from '../features/student/MySubscriptionsDashboard';
import { TeacherStudentPerformance } from '../features/teacher/TeacherStudentPerformance';
import { SuperAdminAcademicIntelligence } from '../features/super-admin/SuperAdminAcademicIntelligence';
import { SuperAdminQuestionBankStudio } from '../features/super-admin/SuperAdminQuestionBankStudio';
import { SuperAdminExamMaster } from '../features/super-admin/SuperAdminExamMaster';

// Teacher Pages
import { TeacherDashboard } from '../features/teacher/TeacherDashboard';
import { TeacherProfile } from '../features/teacher/TeacherProfile';
import { TeacherVerification } from '../features/teacher/TeacherVerification';
import { TeacherStudents } from '../features/teacher/TeacherStudents';
import { TeacherSchedule } from '../features/teacher/TeacherSchedule';
import { TeacherAttendance } from '../features/teacher/TeacherAttendance';
import { TeacherRevenue } from '../features/teacher/TeacherRevenue';
import { TeacherNotifications } from '../features/teacher/TeacherNotifications';
import { TeacherSupport } from '../features/teacher/TeacherSupport';
import { TeacherSettings } from '../features/teacher/TeacherSettings';

// Library Owner Pages
import { LibraryOwnerDashboard } from '../features/library-owner/LibraryOwnerDashboard';
import { LibraryListing } from '../features/library-owner/LibraryListing';
import { CreateLibraryWizard } from '../features/library-owner/CreateLibraryWizard';
import { LibraryStudents } from '../features/library-owner/LibraryStudents';
import { LibrarySeats } from '../features/library-owner/LibrarySeats';
import { LibraryShifts } from '../features/library-owner/LibraryShifts';
import { LibraryBookings } from '../features/library-owner/LibraryBookings';
import { LibraryAttendance } from '../features/library-owner/LibraryAttendance';
import { LibraryFees } from '../features/library-owner/LibraryFees';
import { LibraryRevenue } from '../features/library-owner/LibraryRevenue';
import { LibraryReports } from '../features/library-owner/LibraryReports';
import { LibraryNotifications } from '../features/library-owner/LibraryNotifications';
import { LibrarySupport } from '../features/library-owner/LibrarySupport';
import { LibraryOwnerProfile } from '../features/library-owner/LibraryOwnerProfile';
import { LibrarySubscriptionBilling } from '../features/library-owner/LibrarySubscriptionBilling';

// District Admin Pages
import { DistrictAdminDashboard } from '../features/district-admin/DistrictAdminDashboard';
import { DistrictTeacherApprovals } from '../features/district-admin/DistrictTeacherApprovals';
import { DistrictLibraryApprovals } from '../features/district-admin/DistrictLibraryApprovals';
import { DistrictTutorRequests } from '../features/district-admin/DistrictTutorRequests';
import { DistrictAssignments } from '../features/district-admin/DistrictAssignments';
import { DistrictAttendance } from '../features/district-admin/DistrictAttendance';
import { DistrictFees } from '../features/district-admin/DistrictFees';
import { DistrictRevenue } from '../features/district-admin/DistrictRevenue';
import { DistrictStudents } from '../features/district-admin/DistrictStudents';
import { DistrictTeachers } from '../features/district-admin/DistrictTeachers';
import { DistrictLibraries } from '../features/district-admin/DistrictLibraries';
import { DistrictReports } from '../features/district-admin/DistrictReports';
import { DistrictNotifications } from '../features/district-admin/DistrictNotifications';
import { DistrictSupport } from '../features/district-admin/DistrictSupport';
import { DistrictAdminProfile } from '../features/district-admin/DistrictAdminProfile';
import { DistrictExpenses } from '../features/district-admin/DistrictExpenses';
import { DistrictPayments } from '../features/district-admin/DistrictPayments';
import { DistrictHomeTuition } from '../features/district-admin/DistrictHomeTuition';
import { DistrictSuperAdminComm } from '../features/district-admin/DistrictSuperAdminComm';
import { DistrictAdminPolicies } from '../features/district-admin/DistrictAdminPolicies';
import { DistrictAdminStudyMaterial } from '../features/district-admin/DistrictAdminStudyMaterial';

// Super Admin Pages
import { SuperAdminDashboard } from '../features/super-admin/SuperAdminDashboard';
import { SuperAdminLocations } from '../features/super-admin/SuperAdminLocations';
import { SuperAdminDistricts } from '../features/super-admin/SuperAdminDistricts';
import { SuperAdminDistrictAdmins } from '../features/super-admin/SuperAdminDistrictAdmins';
import { SuperAdminUsers } from '../features/super-admin/SuperAdminUsers';
import { SuperAdminStudents } from '../features/super-admin/SuperAdminStudents';
import { SuperAdminTeachers } from '../features/super-admin/SuperAdminTeachers';
import { SuperAdminLibraries } from '../features/super-admin/SuperAdminLibraries';
import { SuperAdminBookings } from '../features/super-admin/SuperAdminBookings';
import { SuperAdminPayments } from '../features/super-admin/SuperAdminPayments';
import { SuperAdminAuditLogs } from '../features/super-admin/SuperAdminAuditLogs';
import { SuperAdminReports } from '../features/super-admin/SuperAdminReports';
import { SuperAdminNotifications } from '../features/super-admin/SuperAdminNotifications';
import { SuperAdminAiNotificationCenter } from '../features/super-admin/SuperAdminAiNotificationCenter';
import { SuperAdminPolicies } from '../features/super-admin/SuperAdminPolicies';
import { SuperAdminSettings } from '../features/super-admin/SuperAdminSettings';
import { SuperAdminProfile } from '../features/super-admin/SuperAdminProfile';
import { SuperAdminGmvAnalytics } from '../features/super-admin/SuperAdminGmvAnalytics';
import { SuperAdminRevenueAnalytics } from '../features/super-admin/SuperAdminRevenueAnalytics';
import { SuperAdminAttendanceAnalytics } from '../features/super-admin/SuperAdminAttendanceAnalytics';
import { SuperAdminDistrictCommand } from '../features/super-admin/SuperAdminDistrictCommand';
import { SuperAdminLibraryStudents } from '../features/super-admin/SuperAdminLibraryStudents';
import { SuperAdminStudyMaterial } from '../features/super-admin/SuperAdminStudyMaterial';
import { SuperAdminFinanceCommandCenter } from '../features/super-admin/SuperAdminFinanceCommandCenter';
import { MyDocumentsPage } from '../features/documents/MyDocumentsPage';
import { SuperAdminDocumentCenter } from '../features/super-admin/SuperAdminDocumentCenter';
import { SuperAdminSecurityCenter } from '../features/super-admin/SuperAdminSecurityCenter';
import { DocumentVerificationPage } from '../features/public/DocumentVerificationPage';

// Operator Console Pages
import { OperatorDashboard } from '../features/operator/OperatorDashboard';
import { OperatorProfile } from '../features/operator/OperatorProfile';
import { OperatorStudyMaterialManagement } from '../features/operator/OperatorStudyMaterialManagement';
import { OperatorMockTestManagement } from '../features/operator/OperatorMockTestManagement';
import { OperatorQuestionBank } from '../features/operator/OperatorQuestionBank';
import { OperatorExamManagement } from '../features/operator/OperatorExamManagement';
import { OperatorAIAssistant } from '../features/operator/OperatorAIAssistant';
import { OperatorContentAnalytics } from '../features/operator/OperatorContentAnalytics';
import { OperatorAuditTrail } from '../features/operator/OperatorAuditTrail';
import { OperatorPyqDigitizerStudio } from '../features/operator/OperatorPyqDigitizerStudio';
import { OperatorAdvertisementManager } from '../components/operator/OperatorAdvertisementManager';

// Super Admin Operator & BI Pages
import { SuperAdminOperatorManagement } from '../features/super-admin/SuperAdminOperatorManagement';
import { SuperAdminContentApprovals } from '../features/super-admin/SuperAdminContentApprovals';
import { SuperAdminStudyMaterialBI } from '../features/super-admin/SuperAdminStudyMaterialBI';
import { SuperAdminMockTestBI } from '../features/super-admin/SuperAdminMockTestBI';
import { SuperAdminOperatorMonitoring } from '../features/super-admin/SuperAdminOperatorMonitoring';
import { SuperAdminAcademicBusiness } from '../features/super-admin/SuperAdminAcademicBusiness';
import { SuperAdminPricingRules } from '../features/super-admin/SuperAdminPricingRules';
import { SuperAdminEligibilityRules } from '../features/super-admin/SuperAdminEligibilityRules';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Navigation & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/find-tutor" element={<FindTutorPage />} />
        <Route path="/tutors" element={<FindTutorPage />} />
        <Route path="/teacher/:id" element={<TeacherProfilePage />} />
        <Route path="/tutors/:id" element={<TeacherProfilePage />} />
        <Route path="/find-library" element={<FindLibraryPage />} />
        <Route path="/libraries" element={<FindLibraryPage />} />
        <Route path="/library/:id" element={<LibraryDetailsPage />} />
        <Route path="/libraries/:id" element={<LibraryDetailsPage />} />
        <Route path="/library/:id/book" element={<LibraryBookingPage />} />
        <Route path="/libraries/:id/book" element={<LibraryBookingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/mock-tests" element={<MockTestsPublicPage />} />
        <Route path="/study-materials" element={<StudyMaterialsPublicPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/refund" element={<LegalPage />} />
        <Route path="/subscription-policy" element={<LegalPage />} />
        <Route path="/content-policy" element={<LegalPage />} />
        <Route path="/verify/doc/:documentId" element={<DocumentVerificationPage />} />
        <Route path="/verify/doc" element={<DocumentVerificationPage />} />
        <Route path="/verify-certificate/:certificateId" element={<DocumentVerificationPage />} />
        <Route path="/verify-certificate" element={<DocumentVerificationPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<RegisterStudentPage />} />
      <Route path="/register/teacher" element={<RegisterTeacherPage />} />
      <Route path="/register/library" element={<RegisterLibraryOwnerPage />} />
      <Route path="/register/library-owner" element={<RegisterLibraryOwnerPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/super-admin/setup" element={<SuperAdminSetupPage />} />
      <Route path="/super-admin/register" element={<SuperAdminSetupPage />} />
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
      <Route path="/district-admin/login" element={<DistrictAdminLoginPage />} />

      {/* Mobile QR Attendance Pass & Presence Center */}
      <Route path="/attendance/pass" element={<QrAttendanceScanPage />} />
      <Route path="/attendance/scan/:token" element={<QrAttendanceScanPage />} />
      <Route path="/attendance/scan" element={<QrAttendanceScanPage />} />

      {/* Booking Confirmation Flow */}
      <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmationPage />} />
      <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student', 'library_student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="request-tutor" element={<StudentTutorRequestFlow />} />
        <Route path="tutor-requests/new" element={<StudentTutorRequestFlow />} />
        <Route path="requests" element={<StudentRequestTracking />} />
        <Route path="tutor-requests" element={<StudentRequestTracking />} />
        <Route path="teacher" element={<StudentMyTeacher />} />
        <Route path="tutor" element={<StudentMyTeacher />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="bookings" element={<StudentBookings />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="support" element={<StudentSupport />} />
        <Route path="settings" element={<StudentSettings />} />
        <Route path="study-material" element={<StudentStudyMaterial />} />
        <Route path="growth" element={<StudentGrowthIntelligence />} />
        <Route path="my-growth" element={<StudentGrowthIntelligence />} />
        <Route path="mock-tests" element={<GovernmentExamMockTestCenter />} />
        <Route path="exam-prep" element={<GovernmentExamMockTestCenter />} />
        <Route path="mock-tests/attempt/:attemptId" element={<LiveMockTestAttempt />} />
        <Route path="mock-tests/history/:attemptId" element={<MockTestResultReview />} />
        <Route path="mock-tests/result/:attemptId" element={<MockTestResultReview />} />
        <Route path="mistakes" element={<StudentMistakeBook />} />
        <Route path="mistake-book" element={<StudentMistakeBook />} />
        <Route path="store" element={<DigitalLearningStore />} />
        <Route path="learning-store" element={<DigitalLearningStore />} />
        <Route path="subscriptions" element={<MySubscriptionsDashboard />} />
        <Route path="my-subscriptions" element={<MySubscriptionsDashboard />} />
        <Route path="documents" element={<MyDocumentsPage />} />
        <Route path="booking-confirmed/:bookingId" element={<BookingConfirmationPage />} />
        <Route path="booking-confirmed" element={<BookingConfirmationPage />} />
        <Route path="pass" element={<QrAttendanceScanPage />} />
      </Route>

      {/* Teacher Portal */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="verification" element={<TeacherVerification />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="performance" element={<TeacherStudentPerformance />} />
        <Route path="student-performance" element={<TeacherStudentPerformance />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="revenue" element={<TeacherRevenue />} />
        <Route path="notifications" element={<TeacherNotifications />} />
        <Route path="support" element={<TeacherSupport />} />
        <Route path="settings" element={<TeacherSettings />} />
        <Route path="documents" element={<MyDocumentsPage />} />
      </Route>

      {/* Library Owner Portal */}
      <Route
        path="/library-owner"
        element={
          <ProtectedRoute allowedRoles={['library_owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LibraryOwnerDashboard />} />
        <Route path="dashboard" element={<LibraryOwnerDashboard />} />
        <Route path="library" element={<LibraryListing />} />
        <Route path="listing" element={<LibraryListing />} />
        <Route path="create" element={<CreateLibraryWizard />} />
        <Route path="students" element={<LibraryStudents />} />
        <Route path="seats" element={<LibrarySeats />} />
        <Route path="shifts" element={<LibraryShifts />} />
        <Route path="bookings" element={<LibraryBookings />} />
        <Route path="attendance" element={<LibraryAttendance />} />
        <Route path="fees" element={<LibraryFees />} />
        <Route path="revenue" element={<LibraryRevenue />} />
        <Route path="subscription" element={<LibrarySubscriptionBilling />} />
        <Route path="billing" element={<LibrarySubscriptionBilling />} />
        <Route path="reports" element={<LibraryReports />} />
        <Route path="profile" element={<LibraryOwnerProfile />} />
        <Route path="settings" element={<LibraryOwnerProfile />} />
        <Route path="notifications" element={<LibraryNotifications />} />
        <Route path="support" element={<LibrarySupport />} />
        <Route path="documents" element={<MyDocumentsPage />} />
      </Route>

      {/* District Admin Console */}
      <Route
        path="/district-admin"
        element={
          <ProtectedRoute allowedRoles={['district_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DistrictAdminDashboard />} />
        <Route path="dashboard" element={<DistrictAdminDashboard />} />
        <Route path="academic-intelligence" element={<SuperAdminAcademicIntelligence />} />
        <Route path="growth-intelligence" element={<SuperAdminAcademicIntelligence />} />
        <Route path="teacher-approvals" element={<DistrictTeacherApprovals />} />
        <Route path="library-approvals" element={<DistrictLibraryApprovals />} />
        <Route path="requests" element={<DistrictTutorRequests />} />
        <Route path="tutor-requests" element={<DistrictTutorRequests />} />
        <Route path="assignments" element={<DistrictAssignments />} />
        <Route path="attendance" element={<DistrictAttendance />} />
        <Route path="fees" element={<DistrictFees />} />
        <Route path="revenue" element={<DistrictRevenue />} />
        <Route path="students" element={<DistrictStudents />} />
        <Route path="teachers" element={<DistrictTeachers />} />
        <Route path="libraries" element={<DistrictLibraries />} />
        <Route path="reports" element={<DistrictReports />} />
        <Route path="notifications" element={<DistrictNotifications />} />
        <Route path="support" element={<DistrictSupport />} />
        <Route path="profile" element={<DistrictAdminProfile />} />
        <Route path="policies" element={<DistrictAdminPolicies />} />
        <Route path="commission-offers" element={<DistrictAdminPolicies />} />
        <Route path="expenses" element={<DistrictExpenses />} />
        <Route path="payments" element={<DistrictPayments />} />
        <Route path="home-tuition" element={<DistrictHomeTuition />} />
        <Route path="super-admin-comm" element={<DistrictSuperAdminComm />} />
        <Route path="study-material" element={<DistrictAdminStudyMaterial />} />
        <Route path="documents" element={<MyDocumentsPage />} />
      </Route>

      {/* Super Admin Console */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="academic-intelligence" element={<SuperAdminAcademicIntelligence />} />
        <Route path="question-bank" element={<SuperAdminQuestionBankStudio />} />
        <Route path="ai-studio" element={<SuperAdminQuestionBankStudio />} />
        <Route path="exams" element={<SuperAdminExamMaster />} />
        <Route path="exam-master" element={<SuperAdminExamMaster />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="executive-profile" element={<SuperAdminProfile />} />
        <Route path="sovereign-profile" element={<SuperAdminProfile />} />
        <Route path="account" element={<SuperAdminProfile />} />
        <Route path="analytics/gmv" element={<SuperAdminGmvAnalytics />} />
        <Route path="analytics/revenue" element={<SuperAdminRevenueAnalytics />} />
        <Route path="analytics/attendance" element={<SuperAdminAttendanceAnalytics />} />
        <Route path="district-command" element={<SuperAdminDistrictCommand />} />
        <Route path="locations" element={<SuperAdminLocations />} />
        <Route path="districts" element={<Navigate to="/super-admin/locations" replace />} />
        <Route path="security" element={<SuperAdminSecurityCenter />} />
        <Route path="security-center" element={<SuperAdminSecurityCenter />} />
        <Route path="3fa" element={<SuperAdminSecurityCenter />} />
        <Route path="security-3fa" element={<SuperAdminSecurityCenter />} />
        <Route path="policies" element={<SuperAdminPolicies />} />
        <Route path="policies/commission" element={<SuperAdminPolicies />} />
        <Route path="policies/offers" element={<SuperAdminPolicies />} />
        <Route path="commission-offers" element={<SuperAdminPolicies />} />
        <Route path="commission" element={<SuperAdminPolicies />} />
        <Route path="commissions" element={<SuperAdminPolicies />} />
        <Route path="offers" element={<SuperAdminPolicies />} />
        <Route path="district-admins" element={<SuperAdminDistrictAdmins />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="students" element={<SuperAdminStudents />} />
        <Route path="library-students" element={<SuperAdminLibraryStudents />} />
        <Route path="teachers" element={<SuperAdminTeachers />} />
        <Route path="educators" element={<SuperAdminTeachers />} />
        <Route path="verified-educators" element={<SuperAdminTeachers />} />
        <Route path="libraries" element={<SuperAdminLibraries />} />
        <Route path="study-libraries" element={<SuperAdminLibraries />} />
        <Route path="partner-libraries" element={<SuperAdminLibraries />} />
        <Route path="partner-study-libraries" element={<SuperAdminLibraries />} />
        <Route path="bookings" element={<SuperAdminBookings />} />
        <Route path="payments" element={<SuperAdminPayments />} />
        <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
        <Route path="audit-trail" element={<SuperAdminAuditLogs />} />
        <Route path="immutable-audit" element={<SuperAdminAuditLogs />} />
        <Route path="audit" element={<SuperAdminAuditLogs />} />
        <Route path="compliance-audit" element={<SuperAdminAuditLogs />} />
        <Route path="reports" element={<SuperAdminReports />} />
        <Route path="intelligence-reports" element={<SuperAdminReports />} />
        <Route path="intelligence-report" element={<SuperAdminReports />} />
        <Route path="intelligence" element={<SuperAdminReports />} />
        <Route path="executive-reports" element={<SuperAdminReports />} />
        <Route path="notifications" element={<SuperAdminNotifications />} />
        <Route path="directives" element={<SuperAdminNotifications />} />
        <Route path="broadcasts" element={<SuperAdminNotifications />} />
        <Route path="directives-broadcasts" element={<SuperAdminNotifications />} />
        <Route path="directive-broadcasts" element={<SuperAdminNotifications />} />
        <Route path="ai-notifications" element={<SuperAdminAiNotificationCenter />} />
        <Route path="ai-notification-center" element={<SuperAdminAiNotificationCenter />} />
        <Route path="smart-notifications" element={<SuperAdminAiNotificationCenter />} />
        <Route path="personalization" element={<SuperAdminAiNotificationCenter />} />
        <Route path="settings" element={<SuperAdminSettings />} />
        <Route path="central-settings" element={<SuperAdminSettings />} />
        <Route path="system-settings" element={<SuperAdminSettings />} />
        <Route path="architecture-settings" element={<SuperAdminSettings />} />
        <Route path="study-material" element={<SuperAdminStudyMaterial />} />
        <Route path="paid-vault" element={<SuperAdminStudyMaterial />} />
        <Route path="vault" element={<SuperAdminStudyMaterial />} />
        <Route path="study-materials" element={<SuperAdminStudyMaterial />} />
        <Route path="finance" element={<SuperAdminFinanceCommandCenter />} />
        <Route path="finance-command" element={<SuperAdminFinanceCommandCenter />} />
        <Route path="documents" element={<SuperAdminDocumentCenter />} />
        <Route path="operators" element={<SuperAdminOperatorManagement />} />
        <Route path="content-approvals" element={<SuperAdminContentApprovals />} />
        <Route path="approvals" element={<SuperAdminContentApprovals />} />
        <Route path="analytics/study-material" element={<SuperAdminStudyMaterialBI />} />
        <Route path="analytics/mock-tests" element={<SuperAdminMockTestBI />} />
        <Route path="operators/monitoring" element={<SuperAdminOperatorMonitoring />} />
        <Route path="academic-business" element={<SuperAdminAcademicBusiness />} />
        <Route path="pricing-rules" element={<SuperAdminPricingRules />} />
        <Route path="eligibility-rules" element={<SuperAdminEligibilityRules />} />
      </Route>

      {/* Pan-India Study Material & Mock Test Operator Console */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={['study_material_operator', 'super_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OperatorDashboard />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="profile" element={<OperatorProfile />} />
        <Route path="study-material" element={<OperatorStudyMaterialManagement />} />
        <Route path="pyq-studio" element={<OperatorPyqDigitizerStudio />} />
        <Route path="pyq-papers" element={<OperatorPyqDigitizerStudio />} />
        <Route path="mock-tests" element={<OperatorMockTestManagement />} />
        <Route path="question-bank" element={<OperatorQuestionBank />} />
        <Route path="exams" element={<OperatorExamManagement />} />
        <Route path="ai-assistant" element={<OperatorAIAssistant />} />
        <Route path="analytics" element={<OperatorContentAnalytics />} />
        <Route path="audit-trail" element={<OperatorAuditTrail />} />
        <Route path="advertisements" element={<OperatorAdvertisementManager />} />
        <Route path="campaigns" element={<OperatorAdvertisementManager />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
