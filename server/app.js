const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
const { User } = require("./models/User");
const { auth } = require('server/middleware/auth');
const bodyParser = require("body-parser");
const config = require('./config/key');
const cookieParser = require('cookie-parser');

// application/x-www-form-urlencoded 형태의 데이터 분석 및 가져오기
app.use(bodyParser.urlencoded({extended: true}))

// application/json 형태의 파일을 가져올 수 있도록 하는 구문
app.use(bodyParser.json())
app.use(cookieParser())

mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected!'))
    .catch((e) => console.log('MongoDB Error: ', e))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/user/register', (req, res) => {
    // 회원가입 할 때 필요한 정보들을 client 에서 가져오고 DB에 저장하기
    const user = new User(req.body)
    user.save(function (err, doc) {
        console.log(err)
        if (err) {
            return res.json({success: false, err})
        }
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/user/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "입력하신 이메일에 해당하는 유저가 없습니다."
            })
        }
        // 요청된 이메일이 있다면, 비밀번호가 맞는 비밀번호 인지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({loginSuccess: false, message: "비밀번호가 잘못되었습니다."})
            }
            // 비밀번호까지 맞다면 jwt 토큰을 생성한다.
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                // 토큰 생성시 생성한 토큰을 쿠키, 로컬 스토리지, 등에 저장해야 한다. -> 이후 검증절차 거치기 위함
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true,
                        userId: user._id
                    })
            })
        })
    })


})

// authentication 담당하는 auth middleware 를 추가한다.
app.get('/api/user/auth', auth, (req, res) => {
    // auth 를 거쳐서 왔다는 것
    // 이는 user id 를 가지고서 db 에 저장된 유저를 찾고
    // 해당하는 유저의 비밀번호와 발행된 토큰을 decoding 한 결과를 비교해서 같았다는 것
    // 이제 인증이 완료되면 아래와 같은 json 파일을 반환한다. 👇
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role !== 0,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/user/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id:req.user._id}, {
        token: ""
    }, (err, user) => {
        if (err) return res.json({
            success: false,
            err
        })
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})