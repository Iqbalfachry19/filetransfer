const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });
app.use('/downloads', express.static('safe_uploads'));
app.get("/",(req,res)=>{
    res.json({success:true})
})

app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Check the file type (optional)
    const allowedFileTypes = ['image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(req.file.mimetype)) {
        // Delete the file from the temporary uploads directory
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG and PNG files are allowed.' });
    }

    // Here, you can perform additional checks or validations on the file if needed.
    // For example, check the file size, scan for viruses, etc.

    // Move the file from the temporary uploads directory to a safe location
    const targetPath = 'safe_uploads/' + req.file.originalname;
    fs.renameSync(req.file.path, targetPath);

    res.json({ success: true, message: 'File uploaded successfully.' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
