"use strict";
const Soap = require('./soap'),
    trunk = require('./trunk'),
    logger = require('./logger/logger'),
    util = require('util'),
    url = require(`url`),
    moment = require('moment'),
    bodyParser = require('body-parser'),
    db = require('./models/db'),
    express = require('express'),
    port = 3001,
    app = express();

const soap = new Soap();

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

//Set(C_RESULT=${CURL(localhost:3001/sendDialExtensionInfo?incomingNumber=${CALLERID(num)}&dialExtension=${EXTEN})});
app.get('/sendNotWorkinTimeInfo*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    let incomingNumber;
    res.sendStatus(200);
    let dialExtension = queryData.dialExtension > 8 ? queryData.dialExtension : "8495" + queryData.dialExtension;
    queryData.incomingNumber.length == 10 ? incomingNumber = '8' + queryData.incomingNumber : incomingNumber = queryData.incomingNumber;
    soap.getNumber(incomingNumber, dialExtension, moment().format("YYYY-MM-DDTHH:mm:ss"))
        .then(
            result => {
                logger.info(result)
            }
        )
        .catch(error => {
            logger.error(error)
        });
});

//Set(C_RESULT=${CURL(localhost:3001/send3cxIdModelId?incomingNumber=${CALLERID(num)}&unicueid=${UNIQUEID})});
app.get('/send3cxIdModelId*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    logger.info(queryData);
    setTimeout(search3cxInfoMobileRedirection, 10000, queryData.incomingNumber.slice(1), queryData.unicueid);
});

//Set(C_RESULT=${CURL(localhost:3001/sendDialExtensionInfo?incomingNumber=${CALLERID(num)}&context=${customContext}&extension=${EXTEN}&unicueid=${UNIQUEID})});
//Set(C_RESULT=${CURL(localhost:3001/sendDialExtensionInfo?incomingNumber=${CALLERID(num)}&context=${CONTEXT}&extension=${EXTEN}&unicueid=${UNIQUEID})});
app.get('/sendDialExtensionInfo*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    let incomingNumber;
    res.sendStatus(200);
    let dialExtension = queryData.context.length > 7 ? trunk.trunkLocalExtension[queryData.context] : "8495" + queryData.context;
    queryData.incomingNumber.length == 10 ? incomingNumber = '8' + queryData.incomingNumber : incomingNumber = queryData.incomingNumber;
    soap.sendInfoDialLocalExtension(queryData.unicueid, incomingNumber, queryData.extension, dialExtension, moment().format("YYYY-MM-DDTHH:mm:ss"));
});

const search3cxInfoMobileRedirection = (incomingNumber, unicueid) => {
    db.any(`SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1);`)
        .then(
            unicue3cxId => {
                logger.info(unicue3cxId);
                logger.info(unicue3cxId[0].call_id, unicueid)
                db.any(`select cl_party_info.dn,cl_party_info.display_name, cl_participants.start_time from cl_party_info, cl_participants WHERE cl_party_info.id = (select info_id from cl_participants WHERE call_id = ${unicue3cxId[0].call_id} ORDER BY info_id DESC LIMIT 1) and  cl_participants.id = (select info_id from cl_participants WHERE call_id = ${unicue3cxId[0].call_id} ORDER BY info_id DESC LIMIT 1);`)
                    .then(
                        outboundRouting => {
                            logger.info(outboundRouting[0].dn, outboundRouting[0].display_name, outboundRouting[0].start_time, unicueid)
                            if (outboundRouting[0].dn && outboundRouting[0].dn.length > 4 && outboundRouting[0].display_name.length > 4) {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, outboundRouting[0].display_name, '000', trunk.idTrunk3CX[outboundRouting[0].dn], outboundRouting[0].start_time);
                            } else {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, '000', outboundRouting[0].dn, '000', outboundRouting[0].start_time);
                                // search3cxInfoExtensionAnswer(unicueid, unicue3cxId[0].call_id, incomingNumber, outboundRouting[0].dn, outboundRouting[0].start_time);
                            }
                        }
                    )
            }
        )
        .catch(error => {
            logger.error(util.inspect(error));
        });
};

// const search3cxInfoExtensionAnswer = (unicueid, unicue3cxId, incomingNumber, extension, startTime) => {
//     db.any(`SELECT did_number FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1;`)
//         .then(
//             localRouting => {
//                 logger.info(unicueid, unicue3cxId, localRouting[0].did_number, extension, startTime);
//                 if (localRouting[0].did_number.length < 8) {
//                     if (localRouting[0].did_number == '2420102') {
//                         soap.sendInfoAfterHangup(unicueid, unicue3cxId, '7351' + localRouting[0].did_number, extension, startTime);
//                     } else {
//                         soap.sendInfoAfterHangup(unicueid, unicue3cxId, '7495' + localRouting[0].did_number, extension, startTime);
//                     }
//                 } else {
//                     soap.sendInfoAfterHangup(unicueid, unicue3cxId, localRouting[0].did_number, extension, startTime);
//                 }
//             }
//         )
// }

const server = app.listen(port, (error) => {
    if (error) return logger.error(`Error: ${error}`);
    logger.info(`Server listening on port ${server.address().port}`);
});