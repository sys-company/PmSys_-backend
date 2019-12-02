const DashModel = require('../models/DashModel');

const getData = async (req, res) => {

    const { periodo } = req.query || { periodo: 'SEMANAL' };

    model = new DashModel();

    const notificacoes = await model.notificacoes(periodo);
    const programas = await model.select(periodo);
    const hardware = await model.selectHard(periodo);
    const online = await model.selectOnline(periodo);
    const response = { notificacoes, programas, hardware, online};
    return res.status(200).json(response);

}
module.exports = {
    getData,
};