const HomeModel = require('../models/HomeModel');

const getNotify = async (req, res) => {


    model = new HomeModel();

    const notify = await model.selectNotificacoes();
    const response = {notify};
    return res.status(200).json(response);

}
module.exports = {
    getNotify,
};