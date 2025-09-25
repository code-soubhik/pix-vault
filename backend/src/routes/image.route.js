const express = require("express");
const path = require("path");
const { singleUpload, multipleUpload } = require("../middleware/image.middleware");
const { createFolder, singleFile, getFolders, getRootContents, deleteFolder, deleteImage, multipleFile, getImagesByFolder, searchImages, moveImage, getRootImages, getImage } = require("../services/image.service");
const router = express.Router();

router.post("/single", singleUpload, singleFile);

router.post("/multiple", multipleUpload, multipleFile);

router.post("/create-folder", createFolder);

router.get("/folders", getFolders);

router.get("/root-contents", getRootContents);

router.get("/root", getRootImages);

router.get("/folder/:id/images", getImagesByFolder);

router.get("/search", searchImages);

router.put("/move", moveImage);

router.delete("/folder/:id", deleteFolder);

router.delete("/image/:id", deleteImage);

router.get("/image/:id", getImage);

module.exports = router;
