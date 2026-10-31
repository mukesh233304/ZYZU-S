// FocusPoint Server-side Validation & Sanitization Middleware

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

function cleanString(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[<>]/g, '');
}

function normalizeMobile(mobile) {
  if (!mobile) return '';
  const cleaned = String(mobile).replace(/\D/g, '');
  // If starts with 91 and 12 digits, strip country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

// Student registration validation
function validateStudentRegistration(req, res, next) {
  const {
    full_name,
    mobile,
    email,
    password,
    confirm_password,
    dob,
    gender,
    district_id,
    city_area,
    address,
    pincode
  } = req.body;

  const errors = {};

  if (!full_name || cleanString(full_name).length < 2) {
    errors.full_name = 'Full name is required (minimum 2 characters)';
  }

  const normalizedPhone = normalizeMobile(mobile);
  if (!normalizedPhone || !mobileRegex.test(normalizedPhone)) {
    errors.mobile = 'Valid 10-digit Indian mobile number is required';
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Valid email address is required';
  }

  const pwdError = validatePasswordStrength(password);
  if (pwdError) {
    errors.password = pwdError;
  }

  if (password !== confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  if (!dob) {
    errors.dob = 'Date of birth is required';
  }

  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    errors.gender = 'Gender must be Male, Female, or Other';
  }

  if (!district_id || isNaN(parseInt(district_id, 10))) {
    errors.district_id = 'Valid district selection is required';
  }

  if (!city_area || cleanString(city_area).length < 2) {
    errors.city_area = 'City/Area is required';
  }

  if (!address || cleanString(address).length < 5) {
    errors.address = 'Detailed address is required (minimum 5 characters)';
  }

  const cleanPincode = String(pincode || '').trim();
  if (!cleanPincode || !pincodeRegex.test(cleanPincode)) {
    errors.pincode = 'Valid 6-digit postal pincode is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Attach sanitized data
  req.body.full_name = cleanString(full_name);
  req.body.mobile = normalizedPhone;
  req.body.email = email.trim().toLowerCase();
  req.body.city_area = cleanString(city_area);
  req.body.address = cleanString(address);
  req.body.pincode = cleanPincode;
  req.body.district_id = parseInt(district_id, 10);

  next();
}

// Teacher registration validation
function validateTeacherRegistration(req, res, next) {
  const {
    full_name,
    mobile,
    email,
    password,
    confirm_password,
    gender,
    dob,
    qualification,
    experience,
    subjects,
    classes,
    specialization,
    teaching_mode,
    district_id,
    areas_served,
    expected_fee,
    availability,
    address
  } = req.body;

  const errors = {};

  if (!full_name || cleanString(full_name).length < 2) {
    errors.full_name = 'Full name is required';
  }

  const normalizedPhone = normalizeMobile(mobile);
  if (!normalizedPhone || !mobileRegex.test(normalizedPhone)) {
    errors.mobile = 'Valid 10-digit mobile number is required';
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Valid email address is required';
  }

  const pwdError = validatePasswordStrength(password);
  if (pwdError) {
    errors.password = pwdError;
  }

  if (password !== confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    errors.gender = 'Gender must be Male, Female, or Other';
  }

  if (!dob) {
    errors.dob = 'Date of birth is required';
  }

  if (!qualification || cleanString(qualification).length < 2) {
    errors.qualification = 'Educational qualification is required';
  }

  const expNum = parseInt(experience, 10);
  if (isNaN(expNum) || expNum < 0) {
    errors.experience = 'Experience must be a positive number (in years)';
  }

  // Subjects can be array or string
  if (!subjects || (Array.isArray(subjects) && subjects.length === 0) || (typeof subjects === 'string' && subjects.trim().length === 0)) {
    errors.subjects = 'At least one subject is required';
  }

  // Classes can be array or string
  if (!classes || (Array.isArray(classes) && classes.length === 0) || (typeof classes === 'string' && classes.trim().length === 0)) {
    errors.classes = 'Target class / grade levels are required';
  }

  const mode = String(teaching_mode || '').toUpperCase();
  if (!['ONLINE', 'OFFLINE', 'BOTH'].includes(mode)) {
    errors.teaching_mode = 'Teaching mode must be ONLINE, OFFLINE, or BOTH';
  }

  if (!district_id || isNaN(parseInt(district_id, 10))) {
    errors.district_id = 'Valid district selection is required';
  }

  if (!areas_served || cleanString(areas_served).length < 2) {
    errors.areas_served = 'Areas or localities served is required';
  }

  const feeNum = parseFloat(expected_fee);
  if (isNaN(feeNum) || feeNum < 0) {
    errors.expected_fee = 'Valid expected monthly/hourly fee is required';
  }

  if (!availability || cleanString(availability).length < 2) {
    errors.availability = 'Availability schedule is required';
  }

  if (!address || cleanString(address).length < 5) {
    errors.address = 'Residential / operating address is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Teacher registration validation failed',
      errors
    });
  }

  // Format array fields as JSON string if not already
  const formattedSubjects = Array.isArray(subjects)
    ? JSON.stringify(subjects)
    : JSON.stringify(subjects.split(',').map(s => s.trim()).filter(Boolean));

  const formattedClasses = Array.isArray(classes)
    ? JSON.stringify(classes)
    : JSON.stringify(classes.split(',').map(c => c.trim()).filter(Boolean));

  req.body.full_name = cleanString(full_name);
  req.body.mobile = normalizedPhone;
  req.body.email = email.trim().toLowerCase();
  req.body.qualification = cleanString(qualification);
  req.body.experience = expNum;
  req.body.subjects = formattedSubjects;
  req.body.classes = formattedClasses;
  req.body.specialization = cleanString(specialization);
  req.body.teaching_mode = mode;
  req.body.district_id = parseInt(district_id, 10);
  req.body.areas_served = cleanString(areas_served);
  req.body.expected_fee = feeNum;
  req.body.availability = cleanString(availability);
  req.body.address = cleanString(address);

  next();
}

// Library owner registration validation
function validateLibraryOwnerRegistration(req, res, next) {
  const {
    owner_name,
    mobile,
    email,
    password,
    confirm_password,
    district_id,
    address
  } = req.body;

  const errors = {};

  if (!owner_name || cleanString(owner_name).length < 2) {
    errors.owner_name = 'Owner name is required (minimum 2 characters)';
  }

  const normalizedPhone = normalizeMobile(mobile);
  if (!normalizedPhone || !mobileRegex.test(normalizedPhone)) {
    errors.mobile = 'Valid 10-digit Indian mobile number is required';
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Valid email address is required';
  }

  const pwdError = validatePasswordStrength(password);
  if (pwdError) {
    errors.password = pwdError;
  }

  if (password !== confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  if (!district_id || isNaN(parseInt(district_id, 10))) {
    errors.district_id = 'Valid district selection is required';
  }

  if (!address || cleanString(address).length < 5) {
    errors.address = 'Address is required (minimum 5 characters)';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Library owner registration validation failed',
      errors
    });
  }

  req.body.owner_name = cleanString(owner_name);
  req.body.mobile = normalizedPhone;
  req.body.email = email.trim().toLowerCase();
  req.body.district_id = parseInt(district_id, 10);
  req.body.address = cleanString(address);

  next();
}

// Unified Login validation (Email or Mobile + Password)
function validateLogin(req, res, next) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email/mobile and password are required'
    });
  }

  const raw = String(identifier).trim();
  const isEmail = emailRegex.test(raw);
  const normalizedPhone = normalizeMobile(raw);
  const isPhone = mobileRegex.test(normalizedPhone);

  if (!isEmail && !isPhone) {
    return res.status(400).json({
      success: false,
      message: 'Identifier must be a valid email address or 10-digit mobile number'
    });
  }

  req.body.cleanIdentifier = isEmail ? raw.toLowerCase() : normalizedPhone;
  req.body.identifierType = isEmail ? 'EMAIL' : 'MOBILE';

  next();
}

module.exports = {
  validateStudentRegistration,
  validateTeacherRegistration,
  validateLibraryOwnerRegistration,
  validateLogin,
  validatePasswordStrength,
  normalizeMobile,
  cleanString
};
