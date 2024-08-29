const norisdb = require("../../db/noris/noris");



const createFeedback = async (req,res)=>{
    const {text,user} = req.body;
    let myText = text.trim()
    myText.replace("\n"," ");

    try {
      const newFeedBack = await norisdb.query(
        `
         INSERT INTO feedback (feedback,manager)
         values ('${myText}','${user}')
         returning *
         `
      );
  
      if (newFeedBack.rowCount) {
        res.json(newFeedBack.rows)
      }
    } catch (error) {
      console.log(error);
    }
  }
const getAllFeedbacks = async (req,res)=>{

    console.log(req.body);
    try {
        const result = await norisdb.query('select * from feedback')
     res.json(result.rows)
    
    } catch (error) {
      console.log(error);
    }
  }
const getAllEmailsCount = async (req,res)=>{

    console.log(req.body);
    try {
        const result = await norisdb.query('select * from emails')
     res.json(result.rows)
    
    } catch (error) {
      console.log(error);
    }
  }


module.exports = {
    createFeedback,
    getAllFeedbacks,
    getAllEmailsCount
}