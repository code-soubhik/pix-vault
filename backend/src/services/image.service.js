const Image = require("../schemas/image.schema");
const Path = require("path");
const fs = require("fs");


const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const userId = req.user.id;
    let newImageInfo;
    if (parentId == null) {
      newImageInfo = {
        userId,
        type: "folder",
        name,
        parentId: null,
        path: name,
      };
    } else {
      const findParent = await Image.findOne({ userId, _id: parentId });
      newImageInfo = {
        userId,
        type: "folder",
        parentId,
        name,
        path: findParent ? findParent.path + "/" + name : name,
      };
    }
    console.log(newImageInfo);
    const newImage = new Image(newImageInfo);
    await newImage.save();
    return res.status(200).json({ message: "Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const singleFile = async (req, res) => {
  try {
    const parentId = null;
    const userId = req.user.id.toString();
    let relativePath = req.file.originalname;
    if (parentId && parentId != 'null') {
      const parent = await Image.findOne({ _id: parentId, userId, type: "folder" });
      if (parent) {
        relativePath = parent.path + "/" + req.file.originalname;
      }
    }
    const newImg = new Image({
      userId,
      type: "image",
      name: req.file.originalname,
      fileUrl: `/uploads/${userId}/${req.file.filename}`,
      parentId,
      path: relativePath,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    await newImg.save();

    // Move file to user folder
    const userFolder = Path.join('uploads', userId);
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    const newPath = Path.join(userFolder, req.file.filename);
    fs.renameSync(req.file.path, newPath);

    return res.status(200).json({ message: "Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Image.find({ userId, type: "folder" })
      .sort({ name: 1 })
      .select("_id name parentId");
    const folderList = folders.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      parentId: f.parentId ? f.parentId.toString() : null,
      type: "folder",
    }));
    return res.status(200).json(folderList);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getRootContents = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Image.find({ userId, type: "folder", parentId: null })
      .sort({ name: 1 })
      .select("_id name");
    const images = await Image.find({ userId, type: "image", parentId: null })
      .sort({ name: 1 })
      .select("_id name");
    const contents = [
      ...folders.map((f) => ({
        id: f._id.toString(),
        name: f.name,
        type: "folder",
      })),
      ...images.map((i) => ({
        id: i._id.toString(),
        name: i.name,
        type: "image",
        path: i.path,
        mimetype: i.mimetype,
        size: i.size,
      })),
    ];
    return res.status(200).json(contents);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const folder = await Image.findOne({ _id: id, userId, type: "folder" });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    const hasContents = await Image.findOne({ userId, parentId: id });
    if (hasContents) {
      return res
        .status(400)
        .json({ message: "Cannot delete folder with contents" });
    }
    await Image.deleteOne({ _id: id });
    return res.status(200).json({ message: "Folder deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const image = await Image.findOne({ _id: id, userId, type: "image" });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    // Optionally delete file from disk, but for now just DB
    await Image.deleteOne({ _id: id });
    return res.status(200).json({ message: "Image deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const multipleFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const paths = JSON.parse(req.body.paths);
    const files = req.files;
    const fs = require('fs');
    const path = require('path');

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = paths[i];
      const pathParts = relativePath.split('/').slice(1); // remove root folder
      const folderPath = pathParts.slice(0, -1).join('/'); // all except last
      const fileName = pathParts[pathParts.length - 1];

      let parentId = null;
      if (folderPath) {
        const folderParts = folderPath.split('/');
        let currentParent = null;
        let currentPath = '';
        for (const part of folderParts) {
          currentPath += (currentPath ? '/' : '') + part;
          const existing = await Image.findOne({ userId, type: 'folder', name: part, parentId: currentParent });
          if (existing) {
            currentParent = existing._id;
          } else {
            const newFolder = new Image({
              userId,
              type: 'folder',
              name: part,
              parentId: currentParent,
              path: currentPath,
            });
            await newFolder.save();
            currentParent = newFolder._id;
          }
        }
        parentId = currentParent;

        // Move file to subfolder
        const userFolder = path.join('uploads', userId.toString());
        const subFolder = path.join(userFolder, folderPath);
        fs.mkdirSync(subFolder, { recursive: true });
        const oldPath = path.join(userFolder, file.filename);
        const newPath = path.join(subFolder, file.filename);
        fs.renameSync(oldPath, newPath);
      }

      // Move file to user folder if not in subfolder
      if (!folderPath) {
        const userFolder = Path.join('uploads', userId.toString());
        fs.mkdirSync(userFolder, { recursive: true });
        const oldPath = Path.join('uploads', file.filename);
        const newPath = Path.join(userFolder, file.filename);
        fs.renameSync(oldPath, newPath);
      }

      const newImage = new Image({
        userId,
        type: 'image',
        name: fileName,
        fileUrl: `/uploads/${userId}/${folderPath ? folderPath + '/' : ''}${file.filename}`,
        parentId,
        path: folderPath,
      });
      await newImage.save();
      uploadedImages.push(newImage);
    }

    return res.status(200).json({ message: "Images uploaded successfully", images: uploadedImages });
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getImagesByFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const images = await Image.find({ userId, parentId: id, type: "image" })
      .sort({ name: 1 })
      .select("id name fileUrl path mimetype size");
    return res.status(200).json(images);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const searchImages = async (req, res) => {
  try {
    const { q, folderId } = req.query;
    const userId = req.user.id;
    const query = {
      userId,
      type: "image",
      name: { $regex: q, $options: "i" },
    };
    if (folderId) {
      query.parentId = folderId;
    }
    const images = await Image.find(query)
      .sort({ name: 1 })
      .select("id name fileUrl path mimetype size");
    return res.status(200).json(images);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const moveImage = async (req, res) => {
  try {
    const { id, newParentId } = req.body;
    const userId = req.user.id;
    const image = await Image.findOne({ _id: id, userId, type: "image" });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    await Image.updateOne({ _id: id }, { parentId: newParentId });
    return res.status(200).json({ message: "Image moved successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getRootImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const images = await Image.find({ userId, type: "image", parentId: null })
      .sort({ name: 1 })
      .select("id name fileUrl path mimetype size");
    return res.status(200).json(images);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const image = await Image.findOne({ _id: id, userId, type: "image" })
      .select("id name fileUrl path mimetype size");
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    // Construct full file path
    const fullPath = Path.join('uploads', userId.toString(), image?.path ? image.path + '/' + image.name : image.name);
    
    const buffer = await fs.promises.readFile(fullPath);
    const base64 = buffer .toString('base64');
    const mimeType = image.mimetype || 'image/jpeg'; // default if not set

    return res.status(200).json({
      ...image.toObject(),
      base64,
      imageSrc: `data:${mimeType};base64,${base64}`
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFolder,
  singleFile,
  getFolders,
  getRootContents,
  deleteFolder,
  deleteImage,
  multipleFile,
  getImagesByFolder,
  searchImages,
  moveImage,
  getRootImages,
  getImage,
};
