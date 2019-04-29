const routes = require("express").Router();
const validate = require('express-validation')
const authMiddleware = require("./app/middlewares/auth");
const handler = require('express-async-handler')

const controllers = require("./app/controllers");
const validators = require('./app/validators')

routes.post("/users",validate(validators.User), handler(controllers.UserController.store));
routes.post("/sessions",validate(validators.Session), handler(controllers.SessionController.store));

/**
 * Teste
 */

routes.get('/teste', (req, res) =>{
    throw new Error('Erro no teste2')
})

routes.use(authMiddleware);

/**
 * Ads
 */
routes.get("/ads", handler(controllers.AdController.index));
routes.get("/ads/:id", handler(controllers.AdController.show));
routes.post("/ads",validate(validators.Ad), handler(controllers.AdController.store));
routes.put("/ads/:id", validate(validators.Ad),handler(controllers.AdController.update));
routes.delete("/ads/:id", handler(controllers.AdController.destroy));

/**
 * Purchase
 */
routes.post("/purchases", validate(validators.Purchase), handler(controllers.PurchaseController.store));
routes.get("/purchases/:id", controllers.PurchaseController.approvePurchase)

module.exports = routes;
