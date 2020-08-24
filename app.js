"use strict";
const convert = require('xml-js'),
    util = require('util'),
    client = require(`ari-client`),
    Soap = require('./soap'),
    logger = require('./logger'),
    trunkDialplan = require('./trunk');

const LOCAL_ROUTING = 'RouteToLocalUser';
const DEFAULT_ROUTING = 'RouteToDefaultIncomingRoute';
const soap = new Soap();
let channelId;
let dialExtension;

client.connect('http://127.0.0.1:8088', 'stali', '90Nm2LqVg4084UV',
    function(err, ari) {
        ari.on('StasisStart',
            function(event, incoming) {
                let incomingNumber = event.channel.caller.number;
                channelId = event.channel.id;
                logger.info(`Вызов попал в Stasis ${util.inspect(event)}`);
		if (event.channel.dialplan.context == 'beronet'){
			dialExtension = event.args[0];
		}else {
	        	dialExtension = trunkDialplan[event.channel.dialplan.context];
		}
		if (incomingNumber.length == 10) {
  			incomingNumber = '8' + incomingNumber
		} else {
  			incomingNumber = incomingNumber.replace("7", "8").replace(/\D+/g, "")
		}
		logger.info(`Номер после преобразования ${incomingNumber}`);
                soap.getNumber(incomingNumber)
                    .then(
                        result => {
                            logger.info(`Со стороны 1С вернулся результат ${result}`);
                            let jsonResult = JSON.parse(convert.xml2json(result, { compact: true, spaces: 7 }));
                            jsonResult = jsonResult['soap:Envelope']['soap:Body']['m:ReturnNumberResponse']['m:return']['_text'];
                            logger.info(`После преобразования получаем объект в котором находиться внутренний номер или  его отсутствие ${jsonResult}`);
                            if (jsonResult && jsonResult.length == 3) {
                                dialExtension = jsonResult;
                                logger.info(`Был найден привязанный внутренний номер ${dialExtension} вызов пошел по маршруту ${LOCAL_ROUTING}`);
                                continueDialplan(channelId, LOCAL_ROUTING, dialExtension);
                            } else {
                                logger.info(`Привязка не найдена вызов пошел по маршруту ${DEFAULT_ROUTING}`);
                                continueDialplan(channelId, DEFAULT_ROUTING, dialExtension);
                            }
                        }
                    )
                    .catch(error => {
                        logger.error(`На запрос внутреннего номера вернулась ошибка ${error}`);
                        logger.error(`Ошибка, вызов идет по ${DEFAULT_ROUTING}`);
                        continueDialplan(channelId, DEFAULT_ROUTING, dialExtension);
                    });
            });

        function continueDialplan(channelId, dialplanContext, dialExtension) {
            logger.info(`Перенаправляем вызов в по нужному маршруту ${channelId}  ${dialplanContext}  ${dialExtension}`);
            ari.channels.continueInDialplan({ channelId: channelId, context: dialplanContext, extension: dialExtension },
                function(err) {
                    logger.info(`Ошибка отправки вызова через ari ${err}`);
                }
            )
        }
        ari.start('app');
    });
