const mongo = require('mongoose')

const bookSchema = mongo.Schema({
    title: String,
    codes: Array,
    authors: String,
    quantity: Number,
    inLibrary: Number,
    category: String,
    publisher: String,
    shelf: String,
    curriculum: String

})

module.exports = mongo.model('book', bookSchema)