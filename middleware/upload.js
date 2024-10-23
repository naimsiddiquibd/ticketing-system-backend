// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, 'uploads'); // Save files to the uploads folder
    // },
    filename: function (req, file, cb) {
        // Add timestamp to the filename to avoid conflicts
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configure multer to handle multiple file uploads for specific fields
const upload = multer({ storage: storage }).fields([
    { name: 'eventLogo', maxCount: 1 },  // Field for event logo
    { name: 'thumbnail', maxCount: 1 }   // Field for event thumbnail
]);

module.exports = upload;
