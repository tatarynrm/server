const { ict_printers } = require("../../db/noris/noris");

const getAllPrinters = async (req, res) => {
  console.log("TEST PRITERS");

  try {
    const result = await ict_printers.query(`select * from printers`);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getAllCartridges = async (req, res) => {
  console.log("TEST PRITERS");

  try {
    const result = await ict_printers.query(`select * from cartridges`);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getPrintersLocation = async (req, res) => {
  console.log("TEST PRITERS");

  try {
    const result = await ict_printers.query(`select * from location`);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const createPrinter = async (req, res) => {
  const { model, inv_number } = req.body;
  try {
    const query = `insert into printers(model,inv_number) values($1,$2) returning *`;
    const values = [model, inv_number];
    const result = await ict_printers.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    if (error) {
      res.status(400).json(error);
    }
  }
};

const createCartridge = async (req, res) => {
  const { serial_number, cartridge_model } = req.body;

  console.log(serial_number, cartridge_model);

  try {
    const query = `insert into cartridges (serial_number,cartridge_model) values($1,$2) returning *`;
    const values = [serial_number, cartridge_model];
    const result = await ict_printers.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    if (error) {
      res.status(400).json(error);
    }
  }
};

const createPrinterLocation = async (req, res) => {
  const { location_id, printer_id } = req.body;
  try {
    const query = `insert into printer_location (location_id,printer_id) values($1,$2) returning *`;
    const values = [location_id, printer_id];
    const result = await ict_printers.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    if (error) {
      res.status(400).json(error);
    }
  }
};

const createCartridgeChange = async (req, res) => {
  const { printer_id, counter, cart_change_date, comment, cartridge_id,price } =
    req.body;
  console.log(cart_change_date);

  try {
    const query = `insert into cartridge_change (printer_id,counter,cart_change_date,comment,cartridge_id,price) values($1,$2,$3,$4,$5,$6) returning *`;
    const values = [
      printer_id,
      counter,
      cart_change_date,
      comment,
      cartridge_id,
      price
    ];
    const result = await ict_printers.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    if (error) {
      res.status(400).json(error);
    }
  }
};

const getAllData = async (req, res) => {
  try {
    const cartridges = await ict_printers.query(`select * from cartridges`);
    const printers = await ict_printers.query(
      `select a.*,b.location_id from printers a left join printer_location b on a.id = b.printer_id`
    );
    const location = await ict_printers.query(`select * from location`);
    const cartridge_change = await ict_printers.query(
      `select * from cartridge_change`
    );

    const printer_locations = await ict_printers.query(`select a.*, b.model,b.inv_number,c.location 
      from printer_location a 
      left join printers b on a.printer_id = b.id
      left join location c on a.location_id = c.id
      
      `)

    res.status(200).json({
      cartridges: cartridges.rows,
      printers: printers.rows,
      location: location.rows,
      cart_change: cartridge_change.rows,
      printer_location:printer_locations.rows
    });
  } catch (error) {
    console.log(error);
    if (error) {
      res.status(400).json(error);
    }
  }
};

const getAllCartridgesChange = async (req, res) => {
  try {
    const result = await ict_printers.query(`select * from cartridge_change`);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};



const updatePrinter = async (req,res) =>{
  const {model, inv_number, id} = req.body;
  try {
    const query = `
      UPDATE printers
      SET model = $1, inv_number = $2
      WHERE id = $3
    `;
    const values = [model, inv_number, id];

    const result = await ict_printers.query(query, values);
    if (result.rowCount > 0) {
      console.log(`Printer with ID ${id} was updated.`);
      res.status(200).json(result.rows)
    } else {
      console.log(`No printer found with ID ${id}.`);
    }
  } catch (error) {
    console.error('Error updating printer:', error);
  }
}
const updateCartridge = async (req,res) =>{
  const {serial_number, cartridge_model, id} = req.body;
  try {
    const query = `
      UPDATE cartridges
      SET cartridge_model = $1, serial_number = $2
      WHERE id = $3
    `;
    const values = [cartridge_model, serial_number, id];

    const result = await ict_printers.query(query, values);
    if (result.rowCount > 0) {
      console.log(`Cartrdige with ID ${id} was updated.`);
      res.status(200).json(result.rows)
    } else {
      console.log(`No Cartrdige found with ID ${id}.`);
    }
  } catch (error) {
    console.error('Error updating printer:', error);
  }
}
const updateCartridgeChange = async (req,res) =>{
  const {id,printer_id,cartridge_id,counter,cart_change_date,price,comment} = req.body;
  try {
    const query = `
      UPDATE cartridge_change
      SET printer_id = $1, cartridge_id = $2, counter = $3,cart_change_date=$4,price=$5,comment=$6
      WHERE id = $7
    `;
    const values = [printer_id,cartridge_id,counter, cart_change_date,price,comment,id];

    const result = await ict_printers.query(query, values);
    if (result.rowCount > 0) {
      console.log(`Cartrdige with ID ${id} was updated.`);
      res.status(200).json(result.rows)
    } else {
      console.log(`No Cartrdige found with ID ${id}.`);
    }
  } catch (error) {
    console.error('Error updating printer:', error);
  }
}
const updateLocation = async (req,res) =>{
  const {printer_id,location_id} = req.body;
  try {
    const query = `
      UPDATE printer_location
      SET printer_id = $1, location_id = $2
      WHERE printer_id = $1
    `;
    const values = [printer_id,location_id];

    const result = await ict_printers.query(query, values);
    if (result.rowCount > 0) {
      console.log(`Printer with ID ${printer_id} was updated.`);
      res.status(200).json(result.rows)
    } else {
      console.log(`No Printer found with ID ${printer_id}.`);
    }
  } catch (error) {
    console.error('Error updating printer:', error);
  }
}


module.exports = {
  getAllPrinters,
  getAllCartridges,
  getPrintersLocation,
  getAllData,
  getAllCartridgesChange,

  //   POST
  createPrinter,
  createCartridge,
  createPrinterLocation,
  createCartridgeChange,



  // UPDATES
  updatePrinter,
  updateCartridge,
  updateCartridgeChange,
  updateLocation
};
