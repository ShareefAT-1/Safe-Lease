const multer = require('multer');
const path = require('path');
const fs = require ('fs'); // Import fs module to create directories

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/'; // Define your upload directory

        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

// --- CRUCIAL CHANGE: Export the 'upload' instance directly, not as an object ---
module.exports = upload; // Removed curly braces