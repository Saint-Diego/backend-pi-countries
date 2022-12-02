const { Country } = require('../db');
const ModelCRUD = require('./modelCRUD');

class CountryController extends ModelCRUD {
  constructor(model) {
    super(model);
  }

}

const countryController = new CountryController(Country);

module.exports = countryController;