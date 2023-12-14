const fs = require('fs');
const path = require("path");
const multer = require("multer");

const directory = 'static';
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, {recursive: true});
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage: storage});

module.exports = upload