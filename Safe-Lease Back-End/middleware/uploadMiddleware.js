// Safe-Lease Back-End/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Updated to handle both property images and signatures
        let uploadPath;
        if (file.fieldname === 'image') { // Assuming 'image' for property images
            uploadPath = path.join(__dirname, '../uploads/property-images');
        } else if (file.fieldname === 'signature') { // Assuming 'signature' for agreement signatures
            uploadPath = path.join(__dirname, '../uploads/signatures');
        } else {
            uploadPath = path.join(__dirname, '../uploads/misc'); // Fallback for other file types
        }

        fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use a unique filename with original extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
});

// Export the multer instance directly, not inside an object.
module.exports = upload;