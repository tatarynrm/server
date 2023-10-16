const cartridge = require("../../db/cartriges/cart");

const getCart = async (req, res) => {
  try {
    const cart = await cartridge.query(`SELECT * from prn_model`);
    if (cart) {
      res.status(200).json(cart);
    }
  } catch (error) {
    console.log(error);
  }
};
const getDepartments = async (req, res) => {
  try {
    const dep = await cartridge.query(`SELECT * from dep`);
    if (dep) {
      res.status(200).json(dep.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllPrinters = async (req, res) => {
  try {
    const printers = await cartridge.query(
      `SELECT a.*,b.model,b.id as prnId from prn a
      left join prn_model b on a.prn_model_id = b.id
      `
    );
    if (printers) {
      res.status(200).json(printers.rows);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getCart,
  getDepartments,
  getAllPrinters,
};
