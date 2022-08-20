const mongo = require('mongoose')

const borrowedBookSchema = mongo.Schema({
    userID: String,
    userNames: String,
    bookTitle: String,
    bookCode: String,
    issuedDate:Date,
    returnDate: Date,
    bookCount: {
        type: Number,
        default: 1
    }
})

module.exports = mongo.model('borrowedBook', borrowedBookSchema)