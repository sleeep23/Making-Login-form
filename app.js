const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://user1:abcd1234@boilerplate-1.ggdcjup.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('MongoDB connected!'))
    .catch((e) => console.log('MongoDB Error: ', e))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})