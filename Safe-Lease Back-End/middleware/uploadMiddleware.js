const multer = require('multer');
const path = require('path');
const fs = require ('fs'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/'; 

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

module.exports = upload; 