var sd = require('silly-datetime');
var http = require('http')
var WebSocketServer = require('websocket').server

const httpServer = http.createServer((request, response) => {
  console.log('[' + new Date + '] Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})

const wsServer = new WebSocketServer({
  httpServer,
  autoAcceptConnections: true
})
let id=0
wsServer.on('connect', (connection) => {
  id++
  connection.name='p'+id
  connection.on('message', (message) => {
    console.log('>>message ', message);
    if (message.type === 'utf8') {
      let str =message.utf8Data
      if(str.slice(0,9)=='nickname|'){
        connection.name=str.split('|')[1]
        var data = {'sender':connection.name,'content': connection.name+'上线了。', 'date': sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),'name':connection.name}
        broadcast(wsServer,JSON.stringify(data))
        return
      }
      var data = {'sender':connection.name,'content': str, 'date': sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),'name':connection.name}
      // 服务器返回的信息
      // connection.sendUTF( JSON.stringify(data) )
      broadcast(wsServer,JSON.stringify(data))
    }
  });
  // 连接的关闭监听
  connection.on('close', (reasonCode, description) => {
    console.log('[' + new Date() + '] Peer ' + connection.remoteAddress + ' disconnected.')
  })
  // 接收控制台的输入
  process.stdin.on('data', function(data){
    data = data.toString().trim()
    var data = {'content': data, 'date': sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}
    connection.sendUTF( JSON.stringify(data) )
  })
})

httpServer.listen(8086, () => {
  console.log('[' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + ']  server is listening on port 3000')
})


function broadcast(server, msg) {
  server.connections.forEach(function (conn) {
      conn.sendUTF(msg)
  })
}