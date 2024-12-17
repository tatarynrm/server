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
  
  const {model,inv_number} = req.body;
    try {
      const query = `insert into printers(model,inv_number) values($1,$2) returning *`;
      const values = [model,inv_number]
      const result = await ict_printers.query(query,values)

      
      res.status(200).json(result);
    
      
    } catch (error) {
      console.log(error);
    if (error) {
        res.status(400).json(error)
    }
    }
  };

const createCartridge = async (req, res) => {
  
  const {serial_number,cartridge_model} = req.body;

  console.log(serial_number,cartridge_model);
  
    try {
      const query = `insert into cartridges (serial_number,cartridge_model) values($1,$2) returning *`;
      const values = [serial_number,cartridge_model]
      const result = await ict_printers.query(query,values)

      
      res.status(200).json(result);
    
      
    } catch (error) {
      console.log(error);
    if (error) {
        res.status(400).json(error)
    }
    }
  };

  const createPrinterLocation = async (req, res) => {
  
    const {location_id,printer_id} = req.body;
      try {
        const query = `insert into printer_location (location_id,printer_id) values($1,$2) returning *`;
        const values = [location_id,printer_id]
        const result = await ict_printers.query(query,values)
  
        
        res.status(200).json(result);
      
        
      } catch (error) {
        console.log(error);
      if (error) {
          res.status(400).json(error)
      }
      }
    };

  const createCartridgeChange = async (req, res) => {
  
    const {printer_id,counter,cart_change_date,comment,cartridge_id} = req.body;
      try {
        const query = `insert into cartridge_change (printer_id,counter,cart_change_date,comment,cartridge_id) values($1,$2,$3,$4,$5) returning *`;
        const values = [printer_id,counter,cart_change_date,comment,cartridge_id]
        const result = await ict_printers.query(query,values)
  
        console.log(result);
        
        res.status(200).json(result);
      
        
      } catch (error) {
        console.log(error);
      if (error) {
          res.status(400).json(error)
      }
      }
    };



    const getAllData = async (req, res) => {
  
  
          try {
  const cartridges = await ict_printers.query(`select * from cartridges`)
  const printers = await ict_printers.query(`select * from printers`)
  const location = await ict_printers.query(`select * from location`)
      
            
            res.status(200).json({
                cartridges:cartridges.rows,
                printers:printers.rows,
                location:location.rows,
            });
          
            
          } catch (error) {
            console.log(error);
          if (error) {
              res.status(400).json(error)
          }
          }
        };
    

        const getAllCartridgesChange = async (req,res) =>{
            try {
                const result = await ict_printers.query(`select * from cartridge_change`);
                console.log(result);
                res.status(200).json(result)
            } catch (error) {
                console.log(error);
                
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
createCartridgeChange
};
