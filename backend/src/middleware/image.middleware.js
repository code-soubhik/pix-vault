const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filePath = req.body?.filePath || "";
    const userFolder = req.user.id.toString();
    const uploadPath = path.join("uploads", userFolder, filePath);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const singleUpload = upload.single("image")

const multipleUpload = upload.array("images", 20);

module.exports = { singleUpload, multipleUpload };
