const { DataTypes } = require("sequelize");
const {sq} = require('../db/postgresql')
const Message = sq.define("ictmessages", {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false, 
    },
    kod_os:{
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
   
  });


  Message.sync().then(() => {
    console.log("User Model synced");
  });



  module.exports = Message;