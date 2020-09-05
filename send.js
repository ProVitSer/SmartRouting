"use strict";
const Soap = require('./soap'),
       logger = require('./logger'),
       util = require('util'),
       url = require(`url`),
       moment = require('moment'),
       bodyParser = require('body-parser'),
       express = require('express'),
       port = 3000,
       app = express();

const soap = new Soap();

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.get('/rest*',(req, res) => {
    let queryData = url.parse(req.url, true).query;
    res.sendStatus(200);
    let timestamp = moment().format("YYYY-MM-DDTHH:mm:ss");
    let dialExtension = queryData.dialExtension > 8 ? queryData.dialExtension : "8495" + queryData.dialExtension;
    let incomingNumber
    if (queryData.incomingNumber.length == 10){
    	incomingNumber = '8' + queryData.incomingNumber
    } else {
    	incomingNumber = queryData.incomingNumber
    }
    soap.getNumber(incomingNumber, dialExtension, timestamp)
    .then(
    	result => {
          console.log(result)
    	}
    )
    .catch(error => {
    	console.log(error)
    });
});


const server = app.listen(port, (error) => {
    if (error) return logger.error(`Error: ${error}`);
    logger.info(`Server listening on port ${server.address().port}`);
});
