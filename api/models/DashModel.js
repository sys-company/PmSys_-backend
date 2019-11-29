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
GROUP BY PROCESS.nomeProcesso, SQUAD.idSquad, PROCESS.tempoDeUso, PROCESS.dataCapturada) TUDO 
GROUP BY TUDO.ID_SQUAD, TUDO.NOME_PROCESSO,TUDO.QTD_PROCESSO) TUDOMESMO
),
	 NOTIFICACOES AS
	 (
	     SELECT
			COUNT(*) QTD,
			NOT_QTD.fkSquad AS ID_SQUAD,
			NOT_QTD.observacao AS OBS,
			ROW_NUMBER() OVER(PARTITION BY NOT_QTD.fkSquad ORDER BY COUNT(NOT_QTD.observacao) DESC) AS RANKING
		   FROM tblNotificacao NOT_QTD 
	 	GROUP BY NOT_QTD.fkSquad, NOT_QTD.observacao
	  )
	SELECT 
		S.apelidoSquad nome,
	 	(SELECT
	 		SUM(H.HORAS) TOTAL_ONLINE
	 	   FROM (SELECT
	 	   			(DATEPART(HOUR, STATUS.horaSaiu) - DATEPART(HOUR,STATUS.horaEntrou)) as HORAS
	 	   		   FROM tblStatusFuncionario as STATUS) H WHERE H.HORAS IS NOT NULL) horaOnline,
	 	   	  NOTIFY.QTD AS notificacao,
	 	   	  NOTIFY.OBS AS not_comum,
			  PROCESSO.NOME_PROCESSO AS nome_programa,
			  PROCESSO.TEMPO_USO  AS t_uso,
			  TESTE.QTD AS total_uso	  FROM tblSquad S
INNER JOIN PROCESSOS PROCESSO  ON (S.idSquad = PROCESSO.ID_SQUAD)
INNER JOIN NOTIFICACOES NOTIFY ON (S.idSquad = NOTIFY.ID_SQUAD)
INNER JOIN ( SELECT
			  	S.idSquad,
			  	COUNT(*) QTD
			  	FROM tblSquad AS S
				INNER JOIN tblFuncionario 	FU 		  ON (S.idSquad = FU.fkSquad)
				INNER JOIN tblMaquina     	MA  	  ON (FU.fkMaquina = MA.idMaquina)
				INNER JOIN tblInfoProcessos PR	 	  ON (MA.idMaquina = PR.fkMaquina)
				GROUP BY S.idSquad, S.apelidoSquad) TESTE ON TESTE.idSquad = S.idSquad
     WHERE PROCESSO.RANKING = 1 
       AND NOTIFY.RANKING = 1;
            `;

            let dashData = await query(connection, sql);
            return dashData.recordsets[0];
		}

		async selectHard(periodo) {
		const sql = `
		
		SELECT * FROM vwHard WHERE PERIODO LIKE '%${periodo}%';

		`;
		let dashHard = await query(connection, sql);
		return dashHard.recordsets[0];

		}


    }


    module.exports = DashModel;