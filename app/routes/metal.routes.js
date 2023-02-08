//https://jayeshchoudhary.hashnode.dev/how-to-easily-validate-request-data-using-express-validator-in-nodejs
const { authJwt } = require("../middleware");
const controller = require("../controllers/metal.controller");

module.exports = function (app) {

    app.get("/api/metaltypes", controller.getmetaltypes);
    app.get("/api/metalinfo/:metaltypeid", controller.getmetalinfo);
    app.get("/api/metalsubinfo/:metaltypeid/:metalinfoid", controller.getmetalsubinfo);
   
};