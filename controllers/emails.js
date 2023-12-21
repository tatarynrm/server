const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const {
  GET_ALL_USERS,
  GET_ALL_ACTIVE_USERS,
  GET_ALL_FIRED_USERS,
} = require("../queries/user");
const { sendNewYearEmail } = require("../nodemailer/newYearNodemailer");
// const { sendBuhTransport } = require("../index");

const sendNewYearEmailFunction = async (req, res) => {

    const {text} = req.body
    console.log(text);
  try {
sendNewYearEmail(text)
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
    sendNewYearEmailFunction

};
