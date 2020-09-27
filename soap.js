'use strict';
const axios = require('axios'),
    util = require('util'),
    logger = require(`./logger/logger`),
    config = require(`./config/config`);

class Soap {
    constructor(username = config.webServer.username, password = config.webServer.secret, url = config.webServer.url) {
        this.username = username;
        this.password = password;
        this.url = url;
    }

    async getNumber(...params) {
        logger.info(`getNumber данные  ${params}`);
        let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");

        //params[0] - Входящий номер, params[1] - номер куда звонят, params[2] время поступления входящего вызова
        //Парсинг ответа ['soap:Envelope']['soap:Body']['m:ReturnNumberResponse']['m:return']['_text']
        params[1] = params[1].length > 8 ? params[1] : "8495" + params[1];
        let xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ret="ReturnNumber">
		<soap:Header/>
		  <soap:Body>
		   <ret:ReturnNumber>
		      <ret:Number>${params[0]}</ret:Number>
		      <ret:Number1>${params[1]}</ret:Number1>
              <ret:DateTime>${params[2]}</ret:DateTime>
              <ret:ID>${params[3]}</ret:ID>
		   </ret:ReturnNumber>
		  </soap:Body>
		</soap:Envelope>`


        let config = {
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            }
        }

        logger.info(`Отправляем запрос на получении добавочного для даннх ${xml}`);
        const res = await axios.post(this.url, xml, config)
        const result = await res;

        logger.info(`Получили результат на запрос получения добавочного ${result.data}`);
        if (!result) {
            logger.error('Отсутствует результат');
            return [];
        }
        return result.data;
    };

    async sendInfoAfterHangup(...params) {
        logger.info(`sendInfoAfterHangup данные  ${params}`);
        let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");

        let xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ret="ReturnNumber">
                <soap:Header/>
                  <soap:Body>
                   <ret:SetID>
                      <ret:ID>${params[0]}</ret:ID>
                      <ret:ID3CX>${params[1]}</ret:ID3CX>
                   </ret:SetID>
                  </soap:Body>
                </soap:Envelope>`


        let config = {
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            }
        }
        logger.info(`Отправляем информацию с данными 3cx\module id ${xml}`);
        const res = await axios.post(this.url, xml, config)
        const result = await res;

        logger.info(`Получили результат отправленную информацию ${result.data}`);
        if (!result) {
            logger.error('Отсутствует результат');
            return [];
        }
        return result.data;
    };

};

module.exports = Soap;