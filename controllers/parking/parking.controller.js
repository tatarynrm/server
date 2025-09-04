const cookieParser = require("cookie-parser");
const parkingdb = require("../../db/parking/parking.pool");
const pool = require("../../db/pool");
// const pool = require("../db/index");

const getParkedCars = async (req, res) => {
  try {
    const parkedCars = await parkingdb.query(
      `select * from parking_parked_cars`
    );

    res.json(parkedCars.rows);
  } catch (error) {
    console.log(error);
  }
};
const loginParking = async (req,res) => {
  try {
  
  } catch (error) {
    console.log(error);
    
  }
}
const registerParking = async (req,res) =>{
  try {
  
  } catch (error) {
    console.log(error);
    
  }
}

module.exports = {
  getParkedCars,
}
