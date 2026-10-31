const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

function fileFilter(req, file, cb) {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF documents are supported.'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter
});

const teacherUpload = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'verification_docs', maxCount: 5 }
]);

const adUploadDir = path.join(__dirname, '../../public/uploads/ads');
if (!fs.existsSync(adUploadDir)) {
  fs.mkdirSync(adUploadDir, { recursive: true });
}

const adStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, adUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `ad_${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

function adFileFilter(req, file, cb) {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.mp4', '.webm', '.mov', '.m4v'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Security block: explicitly reject dangerous executable extensions
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.ts', '.php', '.phtml', '.py', '.pl', '.cgi', '.html', '.htm'];
  if (dangerousExts.includes(ext)) {
    return cb(new Error('Security violation: Executable scripts or html files are strictly prohibited.'));
  }

  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid advertisement media type. Supported formats: JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV.'));
  }
}

const adMediaUpload = multer({
  storage: adStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max for promotional video/high-res banner
  fileFilter: adFileFilter
});

module.exports = {
  teacherUpload,
  adMediaUpload
};
