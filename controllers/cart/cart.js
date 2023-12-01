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
      `SELECT a.*,b.model,b.id,c.id as department_id,c.dep_name as prnId from prn a
      left join prn_model b on a.prn_model_id = b.id
      left join dep c on a.dep_id = c.id
      `
    );
    if (printers) {
      res.status(200).json(printers.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
const getCartModel = async (req, res) => {
  try {
    const cart = await cartridge.query(`SELECT * from cart_model`);
    if (cart) {
      res.status(200).json(cart.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
const getCartriges = async (req, res) => {
  try {
    const cart = await cartridge.query(
      `SELECT a.*,b.model from cartr a left join cart_model b on a.cart_model_id = b.id`
    );
    if (cart) {
      res.status(200).json(cart.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
const changePrinterModel = async (req, res) => {
  const {id,model} = req.body
  console.log(id,model);
  try {
    // Ваш SQL-запит для оновлення даних
    const query = 'UPDATE prn_model SET model = $1 WHERE id = $2';
    const values = [model, id];

    const result = await cartridge.query(query, values);
    console.log('Rows affected:', result.rowCount);
    res.status(200).json(result)
  } catch(error){
    console.log(error);
  }
};
const changePrinterDep = async (req, res) => {
  const {dep_id,prn_inv} = req.body
  console.log(dep_id,prn_inv);
  try {
    // Ваш SQL-запит для оновлення даних
    const query = 'UPDATE prn SET dep_id = $1 WHERE prn_inv = $2';
    const values = [dep_id, prn_inv];

    const result = await cartridge.query(query, values);
    console.log('Rows affected:', result.rowCount);
    res.status(200).json(result)
  } catch(error){
    console.log(error);
  }
};



const getAllDepartments = async (req, res) => {
  try {
    const departments = await cartridge.query(
      `SELECT * from dep`
    );
    if (departments) {
      res.status(200).json(departments.rows);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getCart,
  getDepartments,
  getAllPrinters,
  getCartModel,
  getCartriges,
  getAllDepartments,
  // Updates
  changePrinterModel,
  changePrinterDep
};
