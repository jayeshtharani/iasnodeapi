//https://jayeshchoudhary.hashnode.dev/how-to-easily-validate-request-data-using-express-validator-in-nodejs
const { authJwt } = require("../middleware");
const controller = require("../controllers/upload.controller");
const upload = require("../middleware/upload");
module.exports = function (app) {
    app.post("/api/upload/itemssheet", [authJwt.verifyToken, authJwt.isAdmin],upload.single("excelfile"), controller.itemssheet);
    app.get("/api/upload/getsheetitems", controller.getItems);
};