const axios = require('axios');
const { Country, Activity, Op } = require('../db');

const URL_API = 'https://restcountries.com/v3/all';

class ModelCRUD {
  constructor(modelo) {
    this.model = modelo;
  }; 

  downloadCountries = async () => {
    try {
      const { data } = await axios.get(URL_API);
      const countries = data?.map((country) => (
        { 
          id: country.cca3,
          nameEn: country.name.common, 
          nameEs: country.translations.spa.common,
          flag: country.flags[1], 
          continent: country.continents[0], 
          capital: country.capital ? country.capital[0] : "Sin capital",
          subregion: country.subregion ? country.subregion : "Sin subregión", 
          area: country.area,
          population: country.population,
        }
      ));
      await this.model.bulkCreate(countries);
      return countries;
    } catch (error) {
      throw new TypeError(error.message);
    }
  };

  getAll = async (req, res, next) => {
    let name = (req.query) ? req.query.name : null;
    let data = null;
    try {
      if (name) {
        data = await this.getByName(name);
        if (!data.length) return res.status(404).send("Criterio de busqueda sin coincidencia");
      } else {
        const count = await this.model.count();
        if (!count) data = await this.downloadCountries();
        else data = await this.model.findAll({
          include: [{
            model: Activity,
            as: 'activities'
          }],
        });
      }
      return res.send(data);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    let id = (req.params) && req.params.idPais;
    try {
      const result = await this.model.findByPk(id, {
        include: [{
          model: Activity,
          as: 'activities'
        }],
      });
      if (!result) return res.status(404).send('País no encontrado');
      return res.send(result);
    } catch (error) {
      next(error);
    }
  };

  getByName = async (nameCountry) => {
    const condition = {
      where: {
        nameEs: {
          [Op.iLike]: `%${nameCountry}%`
        }
      },
      include: [{
        model: Activity,
        as: 'activities'
      }]
    };
    try {
      return await this.model.findAll(condition);
    } catch (error) {
      throw new TypeError(error.message);
    }
  };

  create = async (req, res, next) => {
    const {name, difficulty, duration, season, opCountries} = req.body;
    try {
      const [activity, created] = await this.model.findOrCreate({
        where: {name},
        defaults: {difficulty, duration, season}
      });
      if (!created) return res.status(400).send(`La actividad turística ${name} ya existe`);
      await this.transfer(opCountries, activity);
      return res.status(201).send('Activitidad creada correctamente');
    } catch (error) {
      next(error);
    }
  };

  transfer = async (countries, activity) => {
    try {
      countries?.map(async (name) => {
        const country = await Country.findOne({where: {nameEn: name}});
        await country.addActivity(activity);
      });
    } catch (error) {
      throw new TypeError(error.message);
    }
  };

  setActivities = async (country) => {
    try {
      const allActivities = await country.getActivities();
      const activities = allActivities?.map((a) => a.toJSON());
      return { ...country.toJSON(), activities};
    } catch (error) {
      throw new TypeError(error.message);
    }
  };
}

module.exports = ModelCRUD;