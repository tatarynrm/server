const norisdb = require("../../db/noris/noris");



const createFeedback = async (req,res)=>{
    const {text,user} = req.body;
    console.log(req.body);
    try {
      const newFeedBack = await norisdb.query(
        `
         INSERT INTO feedback (feedback,manager)
         values (${text},'${user}')
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


module.exports = {
    createFeedback
}