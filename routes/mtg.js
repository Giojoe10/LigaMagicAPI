const router = require('express').Router();
const mtgController = require('../controllers/mtgController');

router.get("/:cardName", mtgController.getCard);

module.exports = router