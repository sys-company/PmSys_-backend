const DashModel = require('../models/DashModel');

const getData = async (req, res) => {

    const { periodo } = req.query || { periodo: 'DIARIO' };

    model = new DashModel();

    const notificacoes = await model.notificacoes(periodo);
    const programas = await model.select(periodo);
    const hardware = await model.hardSquad(periodo);
    // const hardware = await model.selectHard(periodo);
    const response = { notificacoes, programas, hardware };
    return res.status(200).json(response);

}
module.exports = {
    getData,
};