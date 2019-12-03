'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class HomeModel {


    async selectNotificacoes() {
		const sql = `
		SELECT TOP 10 NOTIFICS.observacao,SQUADS.apelidoSquad,NOTIFICS.dataCapturada FROM tblNotificacao NOTIFICS
	    INNER JOIN tblSquad SQUADS ON(NOTIFICS.fkSquad = SQUADS.idSquad) ORDER BY dataCapturada DESC;
		`;
		let lastNotify = await query(connection, sql);
		lastNotify = lastNotify.recordsets[0];
		

		return lastNotify;

	}


}

module.exports = HomeModel;
