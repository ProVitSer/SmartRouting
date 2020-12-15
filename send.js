"use strict";
const Soap = require('./src/soap'),
    trunk = require('./trunk'),
    searchInDB = require('./src/searchInDB'),
    logger = require('./logger/logger'),
    util = require('util'),
    url = require(`url`),
    moment = require('moment'),
    bodyParser = require('body-parser'),
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

//Set(C_RESULT=${CURL(localhost:3001/sendGroupCallInfo?incomingNumber=${CALLERID(num)}&unicueid=${UNIQUEID})});
app.get('/sendGroupCallInfo*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    setTimeout(searchInDB.search3cxGroupCall, 10000, queryData.incomingNumber, queryData.unicueid);
});

//Set(C_RESULT=${CURL(localhost:3001/sendExtensionCallInfo?incomingNumber=${CALLERID(num)}&unicueid=${UNIQUEID}&extension=${EXTEN})});
app.get('/sendExtensionCallInfo*', (req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    setTimeout(searchInDB.search3cxExtensionCall, 10000, queryData.incomingNumber, queryData.extension, queryData.unicueid);
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




const server = app.listen(port, (error) => {
    if (error) return logger.error(`Error: ${error}`);
    logger.info(`Server listening on port ${server.address().port}`);
});