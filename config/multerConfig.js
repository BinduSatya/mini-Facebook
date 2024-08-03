const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); // Corrected typo here

//Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const name = crypto.randomBytes(12); // Corrected typo here
    const fn = name.toString("hex") + path.extname(file.originalname);
    console.log("hoho ", fn);
    cb(null, fn);
  },
});

//Export upload variable
let upload = multer({ storage: storage });

module.exports = upload;    
