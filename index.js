const { client } = require('websocket');
const logger = new NIL.Logger('FakePlayerManager');
if(NIL.IO.exists("./Data/fp-manager") == false){
    NIL.IO.createDir("./Data/fp-manager");
    NIL.IO.WriteTo("./Data/fp-manager/config.json",JSON.stringify({url:"ws://127.0.0.1:54321",admin:[114514],version:1},null,4));
}

const config = JSON.parse(NIL.IO.readFrom("./Data/fp-manager/config.json"));

const ws = new client();

let connect;

function sendMsg(str){
    NIL.bots.getBot(NIL._vanilla.cfg.self_id).sendGroupMsg(NIL._vanilla.cfg.group.main,str);
}

function sendWS(str){
    connect.send(str);
}

ws.on("connectFailed",(err)=>{
    logger.error(err);
    logger.warn('与假人客户端连接失败，请检查假人是否开启以及端口是否正确');
    logger.info("将在5秒后重新连接");
    setTimeout(() => {
        ws.connect(config.url);
    }, 5e3);
});

ws.on("connect",(conn)=>{
    connect = conn;
    logger.info('假人客户端连接成功');
    conn.on("message",(data)=>{
        console.log(data.utf8Data);
    })
});

function onMain(e){
    if(e.group.id !== NIL._vanilla.cfg.group.main)return;
    let msg = e.raw_message.split(' ');
    if(msg[0] != '/fp')return;
    switch(msg[1]){
        case 'list':
            connect.send('{"type":"list"}')
            break;
    }
}

class fpmanager extends NIL.ModuleBase{
    can_be_reload = false;
    can_reload_require = false;
    onStart(api){
        ws.connect(config.url);
        api.listen('onMainMessageReceived',onMain);
    }
    onStop(){
        ws.abort();
    }
}

module.exports = new fpmanager;