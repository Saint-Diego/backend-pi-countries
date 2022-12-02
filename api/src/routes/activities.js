const { Router } = require("express");
const activitiesController = require('../controllers/activities');

const router = Router();

router.get('/', activitiesController.getActivities);
router.post('/', activitiesController.create);

module.exports = router;