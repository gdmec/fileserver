const express = require('express')
const multer = require('multer')
const watermark = require('./watermark.js')

const updir = '../uploads'
let app = express()
app.use(express.static(updir))
app.use(express.static('.'))

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, updir)
  },
  filename: function (req, file, cb) {
    let fileFormat = file.originalname.split('.')
    cb(null, file.fieldname + '-' + Date.now() + '.' + fileFormat.slice(-1)[0])
  }
})

let upload = multer({
  storage
})

app.post('/watermark', upload.single('file'), function (req, res, next) {
  let file = req.file
  watermark(updir + '/' + file.filename, 'watermark.png')
  res.json(file.filename)
})

app.post('/messagewall', upload.single('file'), function (req, res, next) {
  console.log('messagewall')
  let file = req.file
  watermark('bg.png', updir + '/' + file.filename)
  res.json('bg.png')
})
app.listen(8080)