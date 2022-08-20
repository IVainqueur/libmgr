const mongo = require('mongoose')

const settingSchema = mongo.Schema({
    key: String,
    values: Array
})

module.exports = mongo.model('setting', settingSchema)