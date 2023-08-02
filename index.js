const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3000;

// Set up AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const s3BucketName = process.env.S3_BUCKET_NAME;

// Set up multer to handle file uploads directly to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3BucketName,
    key: function (req, file, cb) {
      cb(null, 'uploads/' + file.originalname);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit (adjust as needed)
  },
  fileFilter: function (req, file, cb) {
    // Check the file type (optional, same as in your existing code)
    const allowedFileTypes = ['image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
    }
    cb(null, true);
  },
});

// Route to download files from S3
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;

  const params = {
    Bucket: s3BucketName,
    Key: `uploads/${filename}`,
  };

  // Get the file from S3
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error('Error fetching file from S3:', err);
      return res.status(500).json({ success: false, message: 'Error fetching file from S3.' });
    }

    // Set appropriate headers for the file download
    res.attachment(filename);
    res.send(data.Body);
  });
});

// Route to handle file uploads to S3
app.post('/upload', upload.single('file'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  // The file has already been uploaded to S3, no need to do anything here.

  res.json({ success: true, message: 'File uploaded successfully.' });
});

app.get("/", (req, res) => {
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
