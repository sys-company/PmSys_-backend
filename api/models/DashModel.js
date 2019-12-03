'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class DashModel {

	async notificacoes(periodo) {
		const sql = `
			SELECT 
				N.observacao,
				N.dataCapturada data,
				F.idFuncionario,
				F.nomeFuncionario funcionario,
				S.apelidoSquad squad,
				NT.nomeTipoNotificacao tipo
			FROM tblNotificacao N
			LEFT JOIN tblFuncionario F
				ON F.idFuncionario = N.fkFuncionario
			LEFT JOIN tblSquad S
				ON S.idSquad = N.fkSquad
			INNER JOIN tblTipoNotificacao NT
				ON NT.idTipoNotificacao = N.fkTipoNotificacao
			WHERE 
				N.dataCapturada 
				BETWEEN GETDATE()${periodo=='MENSAL'? '-30':periodo=='SEMANAL'? '-7':'-1'} AND GETDATE()
		;`;

		const dado = await query(connection, sql);

		return dado.recordsets[0];
	}
	
	async select(periodo) {
		const sql = `
			SELECT * FROM dashFinalizadoRadical WHERE PERIODO LIKE '%${periodo}%';
            `;

			let dashProgramas = await query(connection, sql);
			dashProgramas = dashProgramas.recordsets[0];
			let squads = dashProgramas.map(dashHard => dashHard.nome);
			squads = squads.filter((squad, index) => squads.indexOf(squad) == index);
			if (!squads.length) return {};
			let formated = {
				squads: [],
				programas: [],
				aparicoes: [],
				totalUso: [],
				tempoUso: [], 
			};
			squads.map((squad) => {
				const dadosSquad = dashProgramas.filter(dado => dado.nome === squad);
				let programas = dadosSquad.map(dado => dado.nome_programa);
				programas = programas.filter((programa, index) => programas.indexOf(programa) == index);
	
				let maisUsado = {nome: null, aparicoes: 0};
				programas.forEach(programa => {
					let count = 0;
					dadosSquad.forEach(dado => dado.nome_programa === programa && count++);
					if (count > maisUsado.aparicoes) maisUsado = {nome: programa, aparicoes: count};
				})
	
				formated.squads.push(squad);
				formated.programas.push(maisUsado.nome);
				formated.aparicoes.push(maisUsado.aparicoes);
				formated.totalUso.push(dadosSquad.map(dado => dado.total_uso)[0]);
				formated.tempoUso.push(dadosSquad.map(dado => dado.t_uso)[0]);
			})
	
			return formated;
	}

	async hardSquad(periodo) {
		const sql = `
		SELECT
			AVG(CPU.totalUso) as CPU,
			(AVG(RAM.totalRamUsado)/AVG(RAM.totalRam))*100 RAM,
			(AVG(HD.espacoTotal - HD.espacoTotalDisponivel)/AVG(HD.espacoTotal))*100 HD,
			S.apelidoSquad
		FROM tblInfoCPU as CPU
		INNER JOIN tblInfoRAM RAM
			ON RAM.fkMaquina = CPU.fkMaquina AND SUBSTRING(Convert(varchar(17),CPU.dataCapturada,120), 0, 17) = SUBSTRING(Convert(varchar(17),RAM.dataCapturada,120), 0, 17)
		INNER JOIN tblInfoHD HD
			ON HD.fkMaquina = CPU.fkMaquina AND SUBSTRING(Convert(varchar(17),CPU.dataCapturada,120), 0, 17) = SUBSTRING(Convert(varchar(17),HD.dataCapturada,120), 0, 17)
		INNER JOIN tblFuncionario f
			ON f.fkMaquina = CPU.fkMaquina
		INNER JOIN tblSquad S
			ON S.idSquad = f.fkSquad
		WHERE 
			CPU.dataCapturada
			BETWEEN GETDATE()${periodo=='MENSAL'? '-30':periodo=='SEMANAL'? '-7':'-1'} AND GETDATE()
		GROUP BY S.idSquad, S.apelidoSquad
		;`;

		let dashHard = await query(connection, sql);
		dashHard = dashHard.recordsets[0];

		return dashHard;
	}

	// async hardSquad(periodo) {
	// 	const sql = `
	// 		SELECT 
	// 			*
	// 		FROM vwHard WHERE PERIODO LIKE '%${periodo}%';
	// 	`;
	// 	let dashHard = await query(connection, sql);
	// 	dashHard = dashHard.recordsets[0];

	// 	return dashHard;

	// }
	async selectOnline(periodo) {
		const sql = `
		SELECT
		 *
		 FROM vmOnline WHERE PERIODO LIKE '%${periodo}%';
		`;
		let dashOnline = await query(connection, sql);
		dashOnline = dashOnline.recordsets[0];
		

		return dashOnline;

	}


}


module.exports = DashModel;