const HomeModel = require('../models/HomeModel');

const getNotify = async (req, res) => {


    model = new HomeModel();

    const response = await model.selectNotificacoes();
    return res.status(200).json(response);

}
module.exports = {
    getNotify,
};