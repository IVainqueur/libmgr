const mongo =  require('mongoose')

const theSchema = mongo.Schema({
    bookCode: String,
    bookTitle: String,
    ID: String,
    borrower: String,
    condition: String,
    number: Number,
    returnDate: {
        type: Date,
        default: Date.now()
    },
    lateFor: Number
})

module.exports = mongo.model('returnedBooks', theSchema)