const multer = require("multer");
const path = require('path');
const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only excel file.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../tmp", "excel"));
    },
    filename: (req, file, cb) => {
        var yourDate = new Date();  // for example
        var epochTicks = 621355968000000000;
        var ticksPerMillisecond = 10000;
        var yourTicks = epochTicks + (yourDate.getTime() * ticksPerMillisecond);
        cb(null, path.parse(file.originalname).name + '_' + yourTicks + path.parse(file.originalname).ext)
    },
});
var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;