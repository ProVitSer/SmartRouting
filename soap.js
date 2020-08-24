'use strict';
const axios = require('axios'),
    util = require('util'),
    logger = require(`./logger`);


class Soap {
    constructor(username = 'WsUser', password = 'Ab123456', url = '172.16.0.10') {
        this.username = username;
        this.password = password;
        this.url = url;
    }

    async getNumber(...params) {
        logger.info(`getNumber данные  ${params}`);
        let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");

        let xml =
            `<?xml version="1.0" encoding="UTF-8"?>
                <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="ReturnNumber">
                  <SOAP-ENV:Body>
                    <ns1:ReturnNumber>
                      <ns1:Number>${params[0]}</ns1:Number>
                    </ns1:ReturnNumber>
                  </SOAP-ENV:Body>
                </SOAP-ENV:Envelope>`

        let config = {
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            }
        }

        logger.info(`Отправляем запрос`);
        //const res = await axios.post(`http://${this.url}/upp82_test7/ws/ReturnNumber.1cws`, xml, config)
	const res = await axios.post(`http://${this.url}:8185/upp82_new/ws/ReturnNumber.1cws`, xml, config)
        const result = await res;

        logger.info(`Получили результат на запрос ${result.data}`);
        if (!result) {
            console.log('Возвращаем 0');
            return [];
        }
        return result.data;
    };
};

module.exports = Soap;
