import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'food_scans',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // ✅ Allow multiple formats
        public_id: (req, file) => `${Date.now()}-${file.originalname}`
    }
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

// Multer upload instance with file filter

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});


export default upload;
