const config = {}
config.webServer = {};
config.ari = {};
config.db = {};


//Данные для подключения к ARI Asterisk
config.ari.username = 'stali';
config.ari.secret = '90Nm2LqVg4084UV';
config.ari.port = '8088';
config.ari.host = 'http://127.0.0.1:8088';

//Данные по сервису 1С
config.webServer.username = 'WsUser';
config.webServer.secret = 'Ab123456';
config.webServer.url = 'http://172.16.0.10:8185/upp82_new/ws/ReturnNumber.1cws';

//Доступ в БД 3СХ
config.db.host = '172.16.0.2';
config.db.port = 5480;
config.db.database = 'database_single';
config.db.user = 'phonesystem';
config.db.password = 'c0kcaxw772Zsc';

module.exports = config;