"use strict";
const Soap = require('./soap'),
    trunk = require('../trunk'),
    db = require('../models/db'),
    logger = require('../logger/logger'),
    util = require('util'),
    moment = require('moment');

const soap = new Soap();

const search3cxExtensionCall = (incomingNumber, extension, unicueid) => {
    incomingNumber = incomingNumber.trim();
    extension = extension.trim();
    logger.info(incomingNumber, extension, unicueid)
    db.any(`SELECT dn FROM public.cl_party_info where id IN (SELECT info_id FROM public.cl_participants WHERE call_id = (SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1)) and answer_time is not null) and dn like '%${extension}';`)
        .then(
            extension3cx => {
                logger.info(extension3cx);
                if (extension3cx.length == 0) {
                    search3cxInfoMobileRedirection(incomingNumber, unicueid);
                } else {
                    db.any(`SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1);`)
                        .then(
                            unicue3cxId => {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, '000', extension3cx[0].dn, '000', moment().format("YYYY-MM-DDTHH:mm:ss"));
                            })
                        .catch(error => {
                            logger.error(util.inspect(error));
                        });
                }

            })
        .catch(error => {
            logger.error(util.inspect(error));
        });
};

const search3cxGroupCall = (incomingNumber, unicueid) => {
    incomingNumber = incomingNumber.trim();
    logger.info(incomingNumber, unicueid)
    db.any(`SELECT time_start,to_dialednum FROM public.callcent_queuecalls where from_userpart like '%${incomingNumber}'  ORDER BY idcallcent_queuecalls DESC LIMIT 1;`)
        .then(
            groupExtension3CX => {
                logger.info(groupExtension3CX);
                if (groupExtension3CX[0].to_dialednum == '') {
                    search3cxInfoMobileRedirection(incomingNumber, unicueid);
                } else {
                    db.any(`SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1);`)
                        .then(
                            unicue3cxId => {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, '000', groupExtension3CX[0].to_dialednum, '000', moment(groupExtension3CX[0].start_time).format("YYYY-MM-DDTHH:mm:ss"));
                            })
                        .catch(error => {
                            logger.error(util.inspect(error));
                        });
                }
            })
        .catch(error => {
            logger.error(util.inspect(error));
        });
};

const search3cxInfoMobileRedirection = (incomingNumber, unicueid) => {
    db.any(`SELECT call_id FROM cl_participants WHERE info_id = (SELECT id FROM cl_party_info WHERE caller_number like '%${incomingNumber}' ORDER BY id DESC LIMIT 1);`)
        .then(
            unicue3cxId => {
                logger.info(unicue3cxId);
                logger.info(unicue3cxId[0].call_id, unicueid)
                db.any(`select cl_party_info.dn,cl_party_info.display_name, cl_participants.start_time from cl_party_info, cl_participants WHERE cl_party_info.id = (select info_id from cl_participants WHERE call_id = ${unicue3cxId[0].call_id} ORDER BY info_id DESC LIMIT 1) and  cl_participants.info_id = (select info_id from cl_participants WHERE call_id = ${unicue3cxId[0].call_id} ORDER BY info_id DESC LIMIT 1);`)
                    .then(
                        outboundRouting => {
                            logger.info(outboundRouting[0].dn, outboundRouting[0].display_name, outboundRouting[0].start_time, unicueid)
                            if (outboundRouting[0].dn && outboundRouting[0].dn.length > 4 && outboundRouting[0].display_name.length > 4) {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, outboundRouting[0].display_name, '000', trunk.idTrunk3CX[outboundRouting[0].dn], moment(outboundRouting[0].start_time).format("YYYY-MM-DDTHH:mm:ss"));
                            } else {
                                soap.sendInfoAfterHangup(unicueid, unicue3cxId[0].call_id, '000', outboundRouting[0].dn, '000', moment(outboundRouting[0].start_time).format("YYYY-MM-DDTHH:mm:ss"));
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


module.exports = { search3cxExtensionCall, search3cxGroupCall, search3cxInfoMobileRedirection };