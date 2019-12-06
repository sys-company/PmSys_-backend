'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class HomeModel {


    async selectNotificacoes() {
		const sql = `
		SELECT TOP 10
			N.observacao, S.apelidoSquad, N.dataCapturada, F.nomeFuncionario, NT.nomeTipoNotificacao
		FROM tblNotificacao N
		INNER JOIN tblSquad S
			ON(N.fkSquad = S.idSquad)
		LEFT JOIN tblFuncionario F
			ON(N.fkFuncionario = F.idFuncionario)
		INNER JOIN tblTipoNotificacao NT
			ON(N.fkTipoNotificacao = NT.idTipoNotificacao)
		ORDER BY dataCapturada DESC;
		`;
		let lastNotify = await query(connection, sql);
		lastNotify = lastNotify.recordsets[0];


		return lastNotify;

	}


}

module.exports = HomeModel;
