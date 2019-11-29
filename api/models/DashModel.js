'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class DashModel{

    async select() {
            const sql = `
			WITH PROCESSOS 
			AS
			(
			SELECT 
				TUDOMESMO.ID_SQUAD,
				TUDOMESMO.NOME_PROCESSO,
				TUDOMESMO.TEMPO_USO,
				TUDOMESMO.QTP,
				ROW_NUMBER() OVER(PARTITION BY TUDOMESMO.ID_SQUAD ORDER BY TUDOMESMO.TEMPO_USO DESC) AS RANKING
			  FROM(
			SELECT
				TUDO.ID_SQUAD,
				TUDO.NOME_PROCESSO,
				SUM(TUDO.QTD_PROCESSO) AS TEMPO_USO,
				TUDO.QTD_PROCESSO AS QTP
				--ROUND(SUM(TEMPO_USO), 0) AS TEMPO_USO
			  FROM(
				SELECT 
					COUNT(*) AS QTD_PROCESSO,
					SQUAD.idSquad AS ID_SQUAD,
					PROCESS.nomeProcesso AS NOME_PROCESSO,
					CASE WHEN PROCESS.tempoDeUso LIKE '%h%'
						 THEN CAST (REPLACE(REPLACE(REPLACE(PROCESS.tempoDeUso, 'h', '.'), 'min', ''), ':', '') AS FLOAT)
						 ELSE CAST (REPLACE(PROCESS.tempoDeUso,':','.')AS FLOAT)
					 END TEMPO_USO
				  FROM tblSquad AS SQUAD
			INNER JOIN tblFuncionario F ON (SQUAD.idSquad = F.fkSquad)
			INNER JOIN tblMaquina M ON (F.fkMaquina = M.idMaquina)
			INNER JOIN tblInfoProcessos PROCESS ON (M.idMaquina = PROCESS.fkMaquina)
			GROUP BY PROCESS.nomeProcesso, SQUAD.idSquad, PROCESS.tempoDeUso) TUDO 
			GROUP BY TUDO.ID_SQUAD, TUDO.NOME_PROCESSO,TUDO.QTD_PROCESSO) TUDOMESMO
			)	
				SELECT 
					S.apelidoSquad NOME,
					(SELECT
						COUNT(*) QTD
					   FROM tblNotificacao NOT_QTD 
				 INNER JOIN PROCESSOS P ON (NOT_QTD.fkSquad = P.ID_SQUAD)) N_NOTIFICACAO,
					 (SELECT
						 SUM(H.HORAS) TOTAL_ONLINE
						FROM (SELECT
									(DATEPART(HOUR, STATUS.horaSaiu) - DATEPART(HOUR,STATUS.horaEntrou)) as HORAS
								   FROM tblStatusFuncionario as STATUS) H WHERE H.HORAS IS NOT NULL) HORA_ONLINE,
						  PROCESSO.NOME_PROCESSO AS NOME_PROCESSO,
						  PROCESSO.TEMPO_USO  AS TEMPO_USO,
						  TESTE.QTD AS TEMPO_TOTAL
				  FROM tblSquad S
			INNER JOIN PROCESSOS PROCESSO ON (S.idSquad = PROCESSO.ID_SQUAD)
			INNER JOIN ( SELECT
							  S.idSquad,
							  COUNT(*) QTD
							  FROM tblSquad AS S
							INNER JOIN tblFuncionario FU ON (S.idSquad = FU.fkSquad)
							INNER JOIN tblMaquina MA ON (FU.fkMaquina = MA.idMaquina)
							INNER JOIN tblInfoProcessos PR ON (MA.idMaquina = PR.fkMaquina)
							GROUP BY S.idSquad, S.apelidoSquad) TESTE ON TESTE.idSquad = S.idSquad
				 WHERE PROCESSO.RANKING = 1;
			
            `;

            let dashData = await query(connection, sql);
            return dashData.recordsets[0];
		}

		async selectHard() {
		const sql = `
		
		SELECT
		ROUND((RAM.totalRamUsado / RAM.totalRam) * 100, 0) AS PERCENT_RAM,
		ROUND((CPU.byUser / CPU.totalUso) * 100, 0) AS PERCENT_CPU,
		ROUND((HD.espacoTotalDisponivel / HD.espacoTotal) * 100, 0) AS PERCENT_HD,
		CONVERT(CHAR(16),RAM.dataCapturada,113) AS DATA_CAPTURA,
		CASE  
				WHEN CAST(RAM.dataCapturada as DATE) >= DATEADD(DAY, -1, DATEADD(HOUR, -3, GETDATE()))
				THEN 'DIÁRIO SEMANAL MENSAL'
				WHEN CAST(RAM.dataCapturada as DATE) BETWEEN DATEADD(WEEK, -1, DATEADD(HOUR, -3, GETDATE()))
														 AND DATEADD(DAY, -1, DATEADD(HOUR, -3, GETDATE()))
			  THEN 'SEMANAL MENSAL'
			  WHEN CAST(RAM.dataCapturada as DATE) BETWEEN DATEADD(MONTH, -1, DATEADD(HOUR, -3, GETDATE()))
													   AND DATEADD(WEEK, -1, DATEADD(HOUR, -3, GETDATE()))
			  THEN 'MENSAL'										 
			  ELSE 'ANTIGO'
		END PERIODO,
		RAM.fkMaquina AS ID_MAQUINA
	   FROM tblInfoRAM AS RAM
 INNER JOIN tblInfoCPU AS CPU ON (RAM.fkMaquina = CPU.fkMaquina) AND (CONVERT(CHAR(16),RAM.dataCapturada,113) = CONVERT(CHAR(16),CPU.dataCapturada,113))
 INNER JOIN tblInfoHD AS HD ON (RAM.fkMaquina = HD.fkMaquina) AND CONVERT(CHAR(16),RAM.dataCapturada,113) = CONVERT(CHAR(16),HD.dataCapturada,113);

		`;
		let dashHard = await query(connection, sql);
		return dashHard.recordsets[0];

		}
    }


    module.exports = DashModel;