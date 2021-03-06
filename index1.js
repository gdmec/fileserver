var fs = require('fs');
var express    = require('express')
var serveIndex = require('serve-index')
const bodyParser = require("body-parser")
var cors=require('cors');


var app = express()
app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
  });

app.use(cors({
    origin:['*'],  //指定接收的地址
    methods:['GET','POST','OPTIONS'],  //指定接收的请求类型
    // alloweHeaders:['Content-Type','Authorization']  //指定header
}))
// app.use(cors())

// app.use('/', express.static('ftp'), serveIndex('ftp', {'icons': true}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('../uploads'))
const multer  = require('multer');
var storage = multer.diskStorage({
  //设置上传后文件路径，会自动创建一个upload目录，与jswork同级目录。
  destination: function (req, file, cb) {
    cb(null, '../uploads')
  }, 
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});
let upload = multer({ storage: storage })  
//单文件上传获取信息
app.post('/upload',upload.single('file'),function(req,res,next){
  var file=req.file;
  console.log("original file name is "+file.originalname);
  console.log("file name is " + file.filename);
  res.json('/'+file.filename);//这行代码必须要有，否则Browser会处于wait状态。
})


app.post('/formBuilder', function (req, res) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.json("hello 这是通过设置express header进行跨域")    
  console.log(req.body)
  res.send(req.body)
})
app.get("/hi",(req, res) => res.send('Hello World!'))

let ajaxData=require("./ajaxData")
let count = ajaxData.length
app.post('/ajax', function (req, res) {
  let sno = req.body.sno
  let name = req.body.name
  let content = req.body.content
  let comment = {
    id: count + 1,
    sno: sno,
    user: name,
    time: new Date().toLocaleString(),
    content: content
  }
  console.log(comment)
  ajaxData.push(comment)
  count = ajaxData.length
  res.json(ajaxData)
})

app.get('/ajax', function (req, res) {
  let page = req.query.page?Math.max(req.query.page,1):1
  let size = 5
  let maxpage = Math.ceil(ajaxData.length/size)
  result={data:ajaxData.slice((page-1)*size,page*size),
    maxPage:maxpage
  }
  res.json(result)
})

//订单请求post
app.post("/api/food/order",function(req,res){
  res.json({error:0,order_id:3})
 });

//支付post请求
app.post("/api/food/pay",function(req,res){  
  res.json({error:0,order_id:3})
 });




//get请求首页信息
app.get('/api/food/index',function (req,res) {
  console.log(req.query);
fs.readFile('index.json', 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
          res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        //res.end(data);
        res.end(data);
    }
});
});

//get请求菜单列表
app.get('/api/food/list',function (req,res) {
  console.log(req.query);
fs.readFile('list.json', 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
          res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        //res.end(data);
        res.end(data);
    }
});
});
//get请求订单列表
app.get('/api/food/orderlist',function (req,res) {
  console.log(req.query);

var filename = 'orderlist-0.json';

 if (req.query.last_id === "10")  {
    // 10 : 11~20
  filename = 'orderlist-10.json';

  }else if (req.query.last_id === "20")  {
    // 20: 21~30
  filename = 'orderlist-20.json';

  }

fs.readFile(filename, 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
          res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        //res.end(data);
        res.end(JSON.stringify(JSON.parse(data)));
    }
});
});

app.get("/api/food/order",function(req,res){
 fs.readFile('order.json', 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
          res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        //res.end(data);
        // res.end(JSON.stringify(JSON.parse(data)[0]));
        // 因为搭建服务器比较麻烦，这里采用模拟数据
         res.end(JSON.stringify(JSON.parse(data)[0])); // 表示未取餐
         // res.end(JSON.stringify(JSON.parse(data)[2])); 表示已取餐
    }
});
});

//get请求消费记录
app.get('/api/food/record',function (req,res) {
  console.log(req.query);
fs.readFile('record.json', 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
          res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        //res.end(data);
        res.end(data);
    }
});
});

app.listen(8083)


var ws = require("nodejs-websocket")
let id=0

var server = ws.createServer(function (conn) {
    id++
    conn.name = "p"+id
    broadcast(server,'有新人加入.')
    conn.on("text", function (str) {
        if(str.slice(0,9)=='nickname|'){
          conn.name=str.split('|')[1]
          broadcast(server,conn.name+'上线了。')
          return
        }
        broadcast(server,conn.name+':'+str)
    })
    conn.on('connect',function(){
        conn.name = "name"
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(8084,()=>console.log('socket server listening on:8081'))

function broadcast(server, msg) {
    server.connections.forEach(function (conn) {
        conn.sendText(msg)
    })
}
