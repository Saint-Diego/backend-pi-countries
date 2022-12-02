const { Activity } = require('../db');
const ModelCRUD = require('./modelCRUD');

class ActivityController extends ModelCRUD {
  constructor(model) {
    super(model);
  }

  getActivities = async (req, res, next) => {
    try {
      const result = await this.model.findAll({
        attributes: ['name']
      });
      res.send(result.length ? result : []);
    } catch (error) {
      next(error);
    }
  };
}

const activityController = new ActivityController(Activity);

module.exports = activityController;