import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'food_scans',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allow multiple formats
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Multer file filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
  }
};

// Create Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

/**
 * Conditional upload middleware.
 *
 * This middleware checks the Content-Type header:
 * - If the request is JSON (for example, for a consumption update),
 *   it skips file processing.
 * - Otherwise, it uses Multer to handle the file upload.
 */
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'];
  
  // If the request is JSON (as is the case for consumption updates), skip file upload.
  if (contentType && contentType.includes('application/json')) {
    return next();
  }
  
  // Otherwise, process the file upload using Multer.
  return upload.single('foodImage')(req, res, next);
};

export default conditionalUpload;
