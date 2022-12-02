const { Router } = require("express");
const countryController = require('../controllers/countries');

const router = Router();

router.get('/', countryController.getAll);
router.get('/:idPais', countryController.getById);

module.exports = router;