const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')
const {User} = require("./models/User");
const bodyParser = require("body-parser");
const config = require('./config/key')

// application/x-www-form-urlencoded 형태의 데이터 분석 및 가져오기
app.use(bodyParser.urlencoded({extended: true}))

// application/json 형태의 파일을 가져올 수 있도록 하는 구문
app.use(bodyParser.json())

mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected!'))
    .catch((e) => console.log('MongoDB Error: ', e))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/register', (req, res) => {

    // 회원가입 할 때 필요한 정보들을 client 에서 가져오고 DB에 저장하기

    const user = new User(req.body)
    user.save((err, doc) => {
        if (err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})