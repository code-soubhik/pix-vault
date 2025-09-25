const express = require("express");
const path = require("path");
const { singleUpload } = require("../middleware/image.middleware");

const router = express.Router();

router.post("/single", singleUpload, (req, res) => {
  return res.status(200).json({ message: "Successfully" });
});


router.post("/create-folder", (req, res) => {
  const { name, parentId } = req.body;
  if(!parentId){
    
  }
  return res.status(200).json({ message: "Successfully" });
});

// router.post("/multiple", singleUpload, (req, res) => {
//   return res.status(200).json({ message: "Successfully" });
// });

// router.get("/multiple", (req, res) => {
//   const filePath = path.join("uploads", "29beb5ed24fabbe8f067ec4b267bef5f");

//   return res.sendFile(path.resolve(filePath));
// });

module.exports = router;
