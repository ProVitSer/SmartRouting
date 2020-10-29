"use strict";
const Soap = require('./soap'),
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

app.get('/sendNotWorkinTimeInfo*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    let timestamp = moment().format("YYYY-MM-DDTHH:mm:ss");
    let dialExtension = queryData.dialExtension > 8 ? queryData.dialExtension : "8495" + queryData.dialExtension;
    let incomingNumber
    if (queryData.incomingNumber.length == 10) {
        incomingNumber = '8' + queryData.incomingNumber
    } else {
        incomingNumber = queryData.incomingNumber
    }
    soap.getNumber(incomingNumber, dialExtension, timestamp)
        .then(
            result => {
                logger.info(result)
            }
        )
        .catch(error => {
            logger.error(error)
        });
});

app.get('/send3cxIdModelId*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    logger.info(queryData);
    setTimeout(search3cxId, 10000, queryData.incomingNumber.slice(1), queryData.unicueid);
    //search3cxId(queryData.incomingNumber.slice(1), queryData.unicueid);
});


const search3cxId = (incomingNumber, unicueid) => {
    db.any(`SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1);`)
        .then(
            unicue3cxId => {
                logger.info(queue);
                logger.info(queue[0].call_id, unicueid)
                db.any(`select dn,display_name from cl_party_info WHERE id = (select info_id from cl_participants WHERE call_id = ${unicue3cxId[0].call_id} ORDER BY info_id DESC LIMIT 1);`)
                    .then(
                        outboundRouting => {
                            if (outboundRouting[0].dn && outboundRouting[0].dn.length > 4 && outboundRouting[0].display_name.length > 4) {
                                soap.sendInfoAfterHangup(unicueid, queue[0].call_id, outboundRouting[0].display_name);
                            } else {
                                soap.sendInfoAfterHangup(unicueid, queue[0].call_id, '000');
                            }
                        }
                    )
            }
        )
        .catch(error => {
            logger.error(util.inspect(error));
        });
};

const server = app.listen(port, (error) => {
    if (error) return logger.error(`Error: ${error}`);
    logger.info(`Server listening on port ${server.address().port}`);
});