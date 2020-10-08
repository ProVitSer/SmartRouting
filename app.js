"use strict";
const convert = require('xml-js'),
    util = require('util'),
    client = require(`ari-client`),
    moment = require('moment'),
    Soap = require('./soap'),
    logger = require('./logger/logger'),
    trunkDialplan = require('./trunk'),
    config = require(`./config/config`);

const LOCAL_ROUTING = 'RouteToLocalUser';
const DEFAULT_ROUTING = 'RouteToDefaultIncomingRoute';
const soap = new Soap();
let channelId, dialExtension, incomingNumber, dialTrunk = [];

client.connect(config.ari.host, config.ari.username, config.ari.secret,
    function(err, ari) {
        ari.on('StasisStart',
            function(event, incoming) {
                let timestamp = moment().format("YYYY-MM-DDTHH:mm:ss");
                channelId = event.channel.id;
                logger.info(`Вызов попал в Stasis ${util.inspect(event)}`);
                if (event.channel.dialplan.context == 'beronet') {
                    dialExtension = event.args[0];
		    dialTrunk[channelId] = { 'context': event.args[0]};
                } else {
                    dialExtension = trunkDialplan[event.channel.dialplan.context];
		    dialTrunk[channelId] = { 'context': event.channel.dialplan.context};
                }
                if (event.channel.caller.number.length == 10) {
                    incomingNumber = '8' + event.channel.caller.number
                } else {
                    incomingNumber = event.channel.caller.number.replace("7", "8").replace(/\D+/g, "")
                }
                logger.info(`${incomingNumber} ${timestamp} ${dialExtension} ${channelId}`);
                soap.getNumber(incomingNumber, dialExtension, timestamp, channelId)
                    .then(
                        result => {
                            logger.info(`Со стороны 1С вернулся результат ${result}`);
                            let jsonResult = JSON.parse(convert.xml2json(result, { compact: true, spaces: 7 }));
                            jsonResult = jsonResult['soap:Envelope']['soap:Body']['m:ReturnNumberResponse']['m:return']['_text'].split(';');
                            logger.info(`После преобразования получаем объект в котором находиться внутренний номер или  его отсутствие ${jsonResult}`);
                            if (jsonResult && jsonResult[0].length == 3 && jsonResult[0] != "000") {
                                //let returnDialExtension = jsonResult[0];
                                //let returnChannelId = jsonResult[1];
                                logger.info(`Был найден привязанный внутренний номер ${jsonResult[0]} ${jsonResult[1]} вызов пошел по маршруту ${LOCAL_ROUTING}`);
                                continueDialplan(jsonResult[1], LOCAL_ROUTING, jsonResult[0]);
                            } else {
                                logger.info(`Привязка не найдена ${jsonResult[1]} вызов пошел по маршруту ${DEFAULT_ROUTING}`);
                                //let returnChannelId = jsonResult[1];
                                continueDialplan(jsonResult[1], DEFAULT_ROUTING,dialExtension);
                            }
                        }
                    )
                    .catch(error => {
                        logger.error(`На запрос внутреннего номера вернулась ошибка ${error}`);
                        logger.error(`Ошибка, вызов идет по ${DEFAULT_ROUTING}`);
                        continueDialplan(channelId, DEFAULT_ROUTING, dialExtension);
                    });
            });

        function continueDialplan(returnChannelId, dialplanContext, returnDialExtension) {
            logger.info(`Перенаправляем вызов в по нужному маршруту ${returnChannelId}  ${dialplanContext}  ${returnDialExtension}`);
	    logger.info(`${util.inspect(dialTrunk)}`);
	    delete dialTrunk[returnChannelId];
            ari.channels.continueInDialplan({ channelId: returnChannelId, context: dialplanContext, extension: returnDialExtension },
                function(err) {
                    logger.info(`Ошибка отправки вызова через ari ${err}`);
                }
            )
        }
        ari.start('app');
    });
