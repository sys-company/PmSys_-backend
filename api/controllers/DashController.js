const DashModel = require('../models/DashModel');

const getData = async (req, res) => {
    
    const {  } = req.body;

    model = new DashModel();

    const dashData = await model.select();

    //if(session.length > 0) {
         return res.status(200).json(dashData);
    // }else {
    //     return res.status(404).end();
    // }

} 
module.exports = {
    getData,
};