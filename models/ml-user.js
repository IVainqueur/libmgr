const mongo = require('mongoose')

const userSchema = mongo.Schema({
    names: String,
    ID: String,
    class: String,
    password: String,
    title: String

})

module.exports = mongo.model('user', userSchema)