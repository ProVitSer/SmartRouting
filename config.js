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
config.xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ret="ReturnNumber">
<soap:Header/>
<soap:Body>
   <ret:ReturnNumber>
      <ret:Number>${params[0]}</ret:Number>
      <ret:Number1>${params[1]}</ret:Number1>
      <ret:DateTime>${params[2]}</ret:DateTime>
   </ret:ReturnNumber>
</soap:Body>
</soap:Envelope>`

module.exports = config;