const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

function createUploader(folderName) {
  const uploadPath = path.join(__dirname, "..", "uploads", folderName);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "..", "uploads", folderName);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
      if (!req.fileNames) {
        req.fileNames = [];
      }
      req.fileNames.push(uniqueName);
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  });

  return upload;
}

module.exports = createUploader;
