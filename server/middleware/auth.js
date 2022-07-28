const {User} = require('../models/User');

const auth = (req, res, next) => {
    // 인증 처리를 진행하는 공간이다.

    // 클라이언트의 쿠키에서 토큰을 가져온다.
    const token = req.cookies.x_auth;
    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        // 유저가 없다면 인증이 안된다.
        if (!user) return res.json({ isAuth: false, error: true})
        // 유저가 있으면 인증이 완료된다.
        req.token = token;
        req.user = user;
        next();
    })

}

module.exports = {auth}