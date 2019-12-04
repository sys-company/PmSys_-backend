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
			RIGHT JOIN tblFuncionario F
				ON F.idFuncionario = N.fkFuncionario
			RIGHT JOIN tblSquad S
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
			SELECT
				DISTINCT 
				D.nome AS squad,
				D.nome_programa AS programa,
				D.t_uso AS uso,
				D.total_uso AS total
			FROM dashFinalizadoRadical D
			WHERE PERIODO LIKE '%${periodo}%'
		`;

			let dashProgramas = await query(connection, sql);
			dashProgramas = dashProgramas.recordsets[0];
			let squads = dashProgramas.map(dashHard => dashHard.squad);
			squads = squads.filter((squad, index) => squads.indexOf(squad) == index);
			if (!squads.length) return {};
			let formated = {
				squad: [],
				programa: [],
				tempoUso: [],
				totalUso: [],
				porcentagem: [], 
			};
			squads.map((squad) => {
				const dadosSquad = dashProgramas.filter(dado => dado.squad === squad);
				let programas = dadosSquad.map(dado => dado.nome_programa);
	
				let maisUsado = {nome: null, uso: 0};
				dadosSquad.forEach(dado => {
					if (dado.uso > maisUsado.uso) maisUsado = {nome: dado.programa, uso: dado.uso};
				})
	
				formated.squad.push(squad);
				formated.programa.push(maisUsado.nome);
				formated.tempoUso.push(maisUsado.uso);
				formated.totalUso.push(dadosSquad[0].total);
				formated.porcentagem.push((maisUsado.uso/dadosSquad[0].total)*100);
			})
	
			// return dashProgramas;
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
		SELECT COUNT(RAM.idInfoRAM) cont,
			s.apelidoSquad,
			Convert(varchar(11),RAM.dataCapturada,103) as dataCapturada
		FROM tblInfoRAM RAM
		INNER JOIN tblFuncionario f on f.fkMaquina = RAM.fkMaquina
		INNER JOIN tblSquad s on f.fkSquad = s.idSquad
		WHERE ram.dataCapturada between GETDATE()${periodo=='MENSAL'? '-30':periodo=='SEMANAL'? '-7':'-1'} and GETDATE()
		GROUP by Convert(varchar(11),RAM.dataCapturada,103), s.apelidoSquad
		`;
		let dashOnline = await query(connection, sql);
		dashOnline = dashOnline.recordsets[0];
		

		return dashOnline;

	}


}


module.exports = DashModel;