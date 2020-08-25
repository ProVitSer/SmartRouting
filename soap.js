'use strict';
const axios = require('axios'),
    util = require('util'),
    logger = require(`./logger`),
    config = require(`./config`);

class Soap {
    constructor(username = config.webServer.username, password = config.webServer.secret, url = config.webServer.url) {
        this.username = username;
        this.password = password;
        this.url = url;
    }

    async getNumber(...params) {
        logger.info(`getNumber данные  ${params}`);
        let auth = "Basic " + new Buffer(`${this.username}:${this.password}`).toString("base64");

        let xml = config.xml

        let config = {
            headers: {
                'User-Agent': 'icepartners/0.0.1',
                'Content-Type': 'application/soap+xml;charset=utf-8',
                'Content-Length': xml.length,
                //'Authorization': auth
            }
        }

        logger.info(`Отправляем запрос`);
        const res = await axios.post(this.url, xml, config)
        const result = await res;

        logger.info(`Получили результат на запрос ${result.data}`);
        if (!result) {
            logger.error('Отсутствует результат');
            return [];
        }
        return result.data;
    };
};

module.exports = Soap;