const router = require("express").Router();
const mtgController = require("../controllers/mtgController")

router.get("/:storeName/:cardName", mtgController.getStorePrice);
router.get("/:cardName", mtgController.getCard);
module.exports = router;