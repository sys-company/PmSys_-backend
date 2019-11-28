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
	ROW_NUMBER() OVER(PARTITION BY TUDOMESMO.ID_SQUAD ORDER BY TUDOMESMO.TEMPO_USO DESC) AS RANKING
  FROM(
SELECT
	TUDO.ID_SQUAD,
	TUDO.NOME_PROCESSO,
	MAX(TUDO.QTD_PROCESSO) AS TEMPO_USO
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
GROUP BY TUDO.ID_SQUAD, TUDO.NOME_PROCESSO) TUDOMESMO
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
	 	 (SELECT 
	 	 	TOTAL.OBS_COMUM2
	 	    FROM (
			 	 SELECT
			 	 	MAX(MAIS.CONT_APARECE) AS CONT,
			 	 	MAIS.OBS_COMUM AS OBS_COMUM2
			 	 	FROM (
			 	 		  SELECT 
			 	 			 COUNT(*) CONT_APARECE,
			 	 			 OBS.observacao OBS_COMUM
			 	 		    FROM tblNotificacao OBS
			 	 	    GROUP BY OBS.observacao) MAIS 
			 	GROUP BY MAIS.OBS_COMUM) TOTAL) NOT_COMUM,
			  PROCESSO.NOME_PROCESSO AS NOME_PROCESSO,
			  PROCESSO.TEMPO_USO AS TEMPO_USO,
			 ROUND( (PROCESSO.TEMPO_USO / (SELECT
			  							SUM(TEMPO_USO)T
			  						  FROM PROCESSOS
			  						 WHERE ID_SQUAD = S.idSquad)) * 100 ,0) AS PORCENTAGEM_USO
	  FROM tblSquad S
INNER JOIN PROCESSOS PROCESSO ON (S.idSquad = PROCESSO.ID_SQUAD)
     WHERE PROCESSO.RANKING = 1;
            
            `;

            let dashData = await query(connection, sql);
            return dashData.recordsets[0];
        }

    }


    module.exports = DashModel;