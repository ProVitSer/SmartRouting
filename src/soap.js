'use strict';
const axios = require('axios'),
    util = require('util'),
    logger = require(`../logger/logger`),
    config = require(`../config/config`);

class Soap {
    constructor(username = config.webServer.username, password = config.webServer.secret, url = config.webServer.url) {
        this.username = username;
        this.password = password;
        this.url = url;
    }

    async getNumber(...params) {
        logger.info(`getNumber данные  ${params}`);

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

        //let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");
        let config = {
            method: 'post',
            url: this.url,
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            },
            data: xml
        };

        logger.info(`Отправляем запрос на получении добавочного для даннх ${xml}`);
        const res = await axios(config);
        const result = await res;

        if (!result) {
            logger.info('Отсутствует результат');
        } else {
            return result;
        }

    };

    async sendInfoAfterHangup(...params) {
        logger.info(`sendInfoAfterHangup данные  ${params}`);

        let xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ret="ReturnNumber">
                <soap:Header/>
                  <soap:Body>
                   <ret:SetID>
                      <ret:ID>${params[0]}</ret:ID>
                      <ret:ID3CX>${params[1]}</ret:ID3CX>
                      <ret:Number>${params[2]}</ret:Number>
                      <ret:DobNumber>${params[3]}</ret:DobNumber>
                      <ret:OutNumber>${params[4]}</ret:OutNumber>
                      <ret:DateTime>${params[5]}</ret:DateTime>
                   </ret:SetID>
                  </soap:Body>
                </soap:Envelope>`

        //let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");
        let config = {
            method: 'post',
            url: this.url,
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            },
            data: xml
        };

        logger.info(`Отправляем запрос на получении добавочного для даннх ${xml}`);
        const res = await axios(config);
        const result = await res;

        if (!result) {
            logger.info('Отсутствует результат');
        } else {
            return result;
        }
    };

    async sendInfoDialLocalExtension(...params) {
        logger.info(`sendInfoDialLocalExtension данные  ${params}`);

        let xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ret="ReturnNumber">
                <soap:Header/>
                  <soap:Body>
                    <ret:SetNumber>
                        <ret:ID>${params[0]}</ret:ID>
                        <ret:InNumber>${params[1]}</ret:InNumber>
                        <ret:DobNumber>${params[2]}</ret:DobNumber>
                        <ret:OurNumber>${params[3]}</ret:OurNumber>
                        <ret:DateTimeIn>${params[4]}</ret:DateTimeIn>
                    </ret:SetNumber>
                  </soap:Body>
                </soap:Envelope>`

        //let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");
        let config = {
            method: 'post',
            url: this.url,
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            },
            data: xml
        };

        logger.info(`Отправляем запрос на получении добавочного для даннх ${xml}`);
        const res = await axios(config);
        const result = await res;

        if (!result) {
            logger.info('Отсутствует результат');
        } else {
            return result;
        }
    };
};

module.exports = Soap;