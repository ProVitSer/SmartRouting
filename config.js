const config = {}
config.webServer = {};
config.ari = {};

//Данные для подключения к ARI Asterisk
config.ari.username = 'stali';
config.ari.secret = '90Nm2LqVg4084UV';
config.ari.port = '8088';
config.ari.host = 'http://127.0.0.1:8088';

//Данные по сервису 1С
config.webServer.username = 'WsUser';
config.webServer.secret = 'Ab123456';
config.webServer.url = 'http://172.16.0.10:8185/upp82_new/ws/ReturnNumber.1cws';

//params[0] - Входящий номер, params[1] - номер куда звонят, params[2] время вызова
//Парсинг ответа ['soap:Envelope']['soap:Body']['m:ReturnNumberResponse']['m:return']['_text']
config.xml = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="ReturnNumber">
  <SOAP-ENV:Body>
    <ns1:ReturnNumber>
      <ns1:Number>${params[0]}</ns1:Number>
    </ns1:ReturnNumber>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`

module.exports = config;