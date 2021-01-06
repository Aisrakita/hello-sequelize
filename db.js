const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.database,config.username,{
    
})