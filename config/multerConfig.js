const multer = require("multer");
const path = require("path");
const crytpo = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const name = crytpo.randomBytes(12);
    const fn = name.toString("hex") + path.extname(file.originalname);
    cb(null, fn);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
