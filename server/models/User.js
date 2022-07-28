const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {hash} = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretKey').secretKey

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minLength: 5
    },
    lastname: {
        type: String,
        maxLength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

UserSchema.pre('save', function (next) {
    const user = this;
    // If only 'password' changes,
    if (user.isModified('password')) {
        // Password encryption goes on
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return (err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

UserSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

UserSchema.methods.generateToken = function (cb) {
    const user = this
    // jwt 를 이용하여 token 생성하기
    // user 의 id 는 객체 생성시 자동으로 부여되는 듯?
    // secretToken 이라는 string 을 뒤에 붙여 token 화를 시키는 것!
    user.token = jwt.sign(user._id.toHexString(), "secretToken")
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}

UserSchema.statics.findByToken = function (token, cb) {
    const user = this
    // 토큰을 decoding 하는 과정
    jwt.verify(token, 'secretToken', function (err, decoded) {
        // user 객체의 _id 를 이용하여 user 를 찾은 뒤
        user.findOne({"_id": decoded, "token": token}, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        });
    });
}

const User = mongoose.model('User', UserSchema)

module.exports = {User}