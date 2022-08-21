const express = require('express')
const app = express()
const cors = require('cors')
const { json } = require('body-parser')
const path = require('path')
const { connect } = require('mongoose')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const queryString = require('querystring')

//middleware
app.use(cors())
app.use(json())
app.use(cookieParser())
app.use('/html', express.static('html'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use('/img', express.static('img'))
require('dotenv').config()

//Connecting to the database
connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) return console.log(err)
    // if(err) return console.log('#FailedConnectionToDB')
    console.log('#ConnectedToDB')
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/login.html'))
})

// ! Getting in
app.post('/signin', (req, res) => {
    console.log(`${req.body.ID} : ${req.body.pass}`)
    req.body.ID = new RegExp(["^", req.body.ID, "$"].join(""), "i");
    require('./models/ml-user').findOne({ ID: req.body.ID }, (err, result) => {
        if (err) return res.json({
            code: "#Error"
        })
        if (result == null) return res.json({
            code: "#NoSuchID"
        })
        if (result.password !== req.body.pass) return res.json({
            code: "#UnAuthorized"
        })

        let token = jwt.sign({ title: result.title, ID: result.ID }, "librarySecret")
        res.cookie("jwt", token, {
            maxAge: 7200000
        })
        res.send({
            code: "#AccessGranted",
            info: {
                _id: result._id,
                names: result.names,
                ID: result.ID,
                title: result.title
            }
        })
    })
})


app.get('/dashboard', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == "student") return res.sendFile(path.join(__dirname, '/html/student/explore.html'))
        res.sendFile(path.join(__dirname, `/html/${which}/dashboard.html`))
    })
})

app.get('/issued', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(__dirname, '/html/admin/errorPage.html')
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/issued.html`))
    })
})
app.get("/addBook", authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(__dirname, "/html/admin/errorPage.html")
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/addBook.html`))
    })
    // res.send("trial")
})

app.post("/addBook", (req, res) => {
    const newBook = require('./models/ml-book')({
        title: `${req.body.title}`,
        codes: req.body.codes,
        authors: req.body.authors,
        quantity: req.body.quantity,
        inLibrary: req.body.quantity,
        category: req.body.category,
        publisher: req.body.publisher,
        shelf: req.body.shelf,
        curriculum: req.body.curriculum,

    })
    newBook.save((err, doc) => {
        if (err) return res.json({
            code: "#Error"
        })
        res.json({
            code: "#Success"
        })
    })

})
app.get('/manageUsers', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/manageUsers.html`))

    })
})
app.get('/addUser', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/addUser.html`))

    })
})
app.post("/addUser", (req, res) => {
    //!First check if the user doesn't already exist or the code used doesn't
    require('./models/ml-user').findOne({ $or: [{ names: req.body.names }, { ID: req.body.ID }] }, (err, doc) => {
        if (err) return res.send({ code: "#Error" })
        if (doc != null) {
            return res.send({ code: "#AlreadyTaken", data: `The entered names or code are already registered in the system` })
        }
        const newStudent = require('./models/ml-user')({
            names: req.body.names,
            ID: req.body.ID,
            class: req.body.class,
            password: process.env.DEFAULT_PASSWORD,
            title: req.body.title
        })
        newStudent.save((err, doc) => {
            if (err) return res.send({ code: "#Error" })
            console.log(doc)
            res.send({ code: "#Success" })
        })

    })

})
app.post('/editUser', authToken, (req, res) => {
    console.log(req.body)
    // return res.send({code: "#Success"})
    require('./models/ml-user').updateOne({ ID: req.body.ID }, {
        $set: {
            names: req.body.name,
            ID: req.body.ID,
            class: req.body.class,
            title: req.body.title
        }
    }, (err, doc) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: doc })
    })
})
app.post('/deleteUser', authToken, (req, res) => {
    console.log(req.body.ID)
    // return res.send({code: "#Success"})
    require('./models/ml-user').deleteOne({ ID: req.body.ID }, (err, doc) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: doc })
    })
})
app.get('/getUsers', authToken, (req, res) => {
    require('./models/ml-user').find({}, (err, doc) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: doc })
    })
})
app.get('/issue', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/issue.html`))

    })
})
app.post('/checkForBook', (req, res) => {
    let re = new RegExp(`${JSON.stringify(req.body.code).slice(1, -1).split(',').join("|")}`)
    console.log(re)


    // require('./models/ml-borrowedBook').find({bookTitle: req.body.title}, (err, result)=>{
    //     if(err) return res.json({code: "#Error"})
    //     // if(result.length != 0) return res.json({code: "#AlreadyBorrowed"})
    //     for(let book of result){
    //         if(req.body.code.includes(JSON.parse(book.bookCode))) return res.json({code: "#AlreadyBorrowed", which: book.bookCode})
    //     }
    //     require("./models/ml-book").findOne({title: req.body.title}, (err2, doc)=>{
    //         if(err2) return res.json({code: "#Error"})
    //         let newArray = req.body.code.map(x => {return {value: x, existence: null}})
    //         // for(let code of doc.codes){
    //         //     console.log(code)
    //         //     // if(code == req.body.code) return res.json({code: "#ExistsAndNotBorrowed"})
    //         //     if(!req.body.code.includes(code)) return res.json({
    //         //         code: "#NonExistent",
    //         //         which: code
    //         //     })
    //         // }
    //         for(let code of req.body.code){
    //             if(!doc.codes.includes(code)) return res.json({
    //                 code: "#NonExistent",
    //                 which: code
    //             })
    //         }
    //         res.send({
    //             code: "#ExistAndNotBorrowed"
    //         })
    //     })
    // })
    require('./models/ml-borrowedBook').findOne({ bookTitle: { $regex: req.body.title }, bookCode: { $regex: re } }, async (err, doc) => {
        console.log(err, doc)
        if (doc) return res.json({ code: "#AlreadyBorrowed", which: doc.bookCode })
        try {
            let bookExists = await require('./models/ml-book').findOne({ title: { $regex: req.body.title } })
            if (!bookExists) return res.send({ code: "#NonExistent" })
            res.send({ code: "#ExistAndNotBorrowed" })

        } catch (e) {
            console.log("Something went wrong!", e)
            return res.json({ code: "#Error", message: err })
        }
        // return res.send({code: "#Error"})

    })
    // console.log(req.body)
    // res.send({code: "Success"})
})
app.post('/checkForUser', (req, res) => {
    if (req.body.what == "names") {
        require('./models/ml-user').find({ names: { $regex: req.body.data, $options: "i" } }, (err, result) => {
            if (err) return res.send({ code: "#Error" })
            if (result == null) return res.send({ code: "#NonExistent" })
            res.json({ code: "#Found", data: result })
        })
    } else if (req.body.what == "code") {
        require('./models/ml-user').findOne({ ID: req.body.data }, (err, result) => {
            if (err) return res.send({ code: "#Error" })
            if (result == null) return res.send({ code: "#NonExistent" })
            res.json({
                code: "#Found", data: [{
                    names: result.names,
                    class: result.class,
                    ID: result.ID
                }]
            })
        })
    }
    // console.log(req.body)
    // res.send({code: "Success"})
})
app.post('/issueBook', (req, res) => {
    //Create an array of all the books being issued
    // for(let one of req.body.data)

    const issueBook = require('./models/ml-borrowedBook')({
        userID: req.body.ID,
        userNames: req.body.userNames,
        bookTitle: req.body.title,
        bookCode: JSON.stringify(req.body.bookCode),
        issuedDate: req.body.issueDate,
        returnDate: req.body.returnDate,
        bookCount: Number(req.body.bookCount)
    })

    require('./models/ml-book').findOne({ title: req.body.title }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        let theBookCount = result.inLibrary
        require('./models/ml-book').updateOne({ title: req.body.title }, { inLibrary: theBookCount - Number(req.body.bookCount) }, (err1, doc) => {
            if (err1) return res.send({ code: "#Error" })
            issueBook.save((err2, doc2) => {
                if (err2) return res.send({ code: "#Error" })
                res.send({ code: "#Success" })
            })
        })
    })

})
app.get('/updateBook', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/updateBook.html`))

    })
})
app.post('/updateBook/:delete', authToken, async (req, res) => {
    console.log(req.body, req.params)

    if (req.params.delete == 'true') {
        try {
            let borrowedBook = await require('./models/ml-borrowedBook').findOne({ bookTitle: req.body.title })
            if (borrowedBook) return res.send({ code: "#BorrowedBook" })
            require('./models/ml-book').deleteOne({ _id: req.body._id }, (err, doc) => {
                if (err) return res.send({ code: '#Error' })
                res.send({ code: "#Success", data: doc })
            })
        }
        catch (e) {
            return res.json({ code: "#Error" })
        }
    } else {
        require('./models/ml-book').replaceOne({ _id: req.body._id }, {
            title: req.body.title,
            codes: req.body.codes,
            authors: req.body.authors,
            quantity: req.body.quantity,
            inLibrary: req.body.inLibrary,
            category: req.body.category,
            publisher: req.body.publisher,
            shelf: req.body.shelf,
            curriculum: req.body.curriculum
        }, (err, doc) => {
            if (err) return res.send({ code: "#Error" })
            res.send({ code: "#Success", data: doc })
        })
    }
})
app.get('/explore', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        // if(which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/explore.html`))
    })
})
app.get('/getBooks', (req, res) => {
    require('./models/ml-book').find({}, (err, result) => {
        if (err) return res.send("#Error")
        res.send({
            results: result
        })
    })
})
app.get('/getBookCodes/:title', (req, res) => {
    require('./models/ml-book').findOne({ title: req.params.title }, (err, doc) => {
        if (err) return res.send({ code: "#Error" })

    })
})
app.post('/newCode', (req, res) => {
    console.log(req.body)
    // return res.send({code: "#Success"})
    require('./models/ml-book').updateOne({ title: req.body.title }, { $push: { codes: req.body.newCode } }, (err, doc) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success" })
        addToQuantity()

    })
    function addToQuantity() {
        require('./models/ml-book').updateOne({ title: req.body.title }, { $inc: { quantity: 1, inLibrary: 1 } }, (err, doc) => {
            if (err) addToQuantity()
        })
    }
})
app.post('/addCategory', (req, res) => {
    let { newCategory } = req.body
    if (!newCategory) {
        console.log("No New Category Was Set")
        res.json({ code: "#NoNewCategory" })
    }
    require('./models/ml-setting').updateOne({ key: "categories" }, { $push: { values: newCategory } }, (err, data) => {
        if (err) return res.json({ code: "#Error", message: err.message })
        return res.json({ code: "#Success", message: data })
    })
})
app.get('/getCategories', authToken, (req, res) => {
    require('./models/ml-setting').findOne({ key: "categories" }, (err, result) => {
        if (err) return res.json({
            code: "#Error"
        })
        console.log(result)
        res.json({
            code: "#Success",
            categories: result.values
        })
    })
})
app.post('/returnBook', (req, res) => {
    // req.body.bookCount = 
    // console.log(req.body)
    // return res.send({code: "#Success"})
    // console.log(req.body)
    // res.send({code: "#Success"})
    require('./models/ml-book').findOne({ title: req.body.bookTitle }, (err, result) => {
        if (err) return res.send({ code: "#Error1" })
        let theBookCount = result.inLibrary
        require('./models/ml-book').updateOne({ title: req.body.bookTitle }, { inLibrary: theBookCount + Number(req.body.bookCount) }, (err1, doc) => {
            if (err1) return res.send({ code: "#Error2" })
            //Instead of using the code, let's use the id
            require('./models/ml-borrowedBook').findOne({ _id: req.body._id }, (err2, doc) => {
                if (err2) return res.send({ code: "#Error3" })
                if (doc == null) return res.send({ code: "#NoSuchEntry" })
                const newReturnedBook = require('./models/ml-returnedBook')({
                    bookCode: req.body.bookCode,
                    bookTitle: req.body.bookTitle,
                    condition: req.body.condition,
                    ID: req.body.borrowerCode,
                    borrower: req.body.borrower,
                    number: Number(req.body.bookCount),
                    lateFor: Date.now() - Date.parse(doc.returnDate)
                })
                newReturnedBook.save((err3, doc1) => {
                    if (err3) return res.send({ code: "#Error4" })
                    require('./models/ml-borrowedBook').deleteOne({ _id: req.body._id }, (err4, doc2) => {
                        if (err4) return res.send({ code: '#Error5' })
                        res.send({ code: "#Done" })
                    })
                })
            })
        })
    })

})


app.get('/issuedReport', (req, res) => {
    require('./models/ml-borrowedBook').find({}, (err, result) => {
        if (err) return res.send("#Error")
        res.send(result)
    })
})
app.get('/returnedReport', authToken, (req, res) => [
    require('./models/ml-returnedBook').find({}, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: result })
    })
])
app.get('/dueToDayReport/:count/:time/:milliseconds', (req, res) => {
    // console.log(new Date(Number(req.params.time) + Number(req.params.milliseconds)))
    require('./models/ml-borrowedBook').find({ returnDate: new Date(Number(req.params.time) + Number(req.params.milliseconds)) }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        if (req.params.count == 'true') return res.send({ code: "#Success", data: result.length })
        res.send({ code: "#Success", data: result })
    })
})

app.get('/issuedToDayReport/:time/:milliseconds', (req, res) => {
    // console.log(new Date(Number(req.params.time) + Number(req.params.milliseconds)))
    require('./models/ml-borrowedBook').find({ issuedDate: new Date(Number(req.params.time) + Number(req.params.milliseconds)) }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: result.length })
    })
})
app.get('/overdueReport/:count/:time/:milliseconds', (req, res) => {
    require('./models/ml-borrowedBook').find({ returnDate: { $lt: new Date(Number(req.params.time) + Number(req.params.milliseconds)) } }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        if (req.params.count == 'true') return res.send({ code: "#Success", data: result.length })
        res.send({ code: "#Success", data: result })
    })
})

app.get('/dueToday', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/dueToday.html`))

    })
})
app.get('/overdue', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, '/html/admin/errorPage.html'))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/overdue.html`))

    })
})
app.get('/settings', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, "/html/admin/errorPage.html"))
        let which = (result.title == "student") ? "student" : "admin"
        res.sendFile(path.join(__dirname, `/html/${which}/settings.html`))
    })
})
app.post('/getSettings', (req, res) => {
    require('./models/ml-user').findOne({ _id: req.body._id }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success", data: result })
    })
})
app.post('/updateSettings', (req, res) => {
    require('./models/ml-user').updateOne({ _id: req.body._id }, {
        names: req.body.body.names,
        ID: req.body.body.ID,
        class: req.body.body.class,
        password: req.body.body.password,
        title: req.body.body.title
    }, (err, result) => {
        if (err) return res.send({ code: "#Error" })
        res.send({ code: "#Success" })
    })
})
app.get('/history', authToken, (req, res) => {
    jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, "/html/admin/errorPage.html"))
        let which = (result.title == "student") ? "student" : "admin"
        if (which == 'student') return res.status(403).send(`<h1 style="text-align: center;  margin-top: 30px;">Only admin users can access this feature</h1>`)
        res.sendFile(path.join(__dirname, `/html/${which}/history.html`))
    })
})
app.get('/underConstruction', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, "/html/underConstruction.html"))
})


// TESTING ONLY ///
const signUp = (toUse) => {
    let theStudents = require('./output-onlinepngtools.json')
    let newArr = []
    for (let student of theStudents) {
        newArr.push({
            names: student["Lastname"],
            ID: `KCS-${student["Student ID"]}`,
            class: "1 A",
            password: process.env.DEFAULT_PASSWORD,
            title: "student"
        })
    }
    require('./models/ml-user').insertMany(newArr, (err, doc) => {
        if (err) return console.log(err)
        console.log(doc)
    })
    // return console.log(newArr)
    // const newStudent = require('./models/ml-user')({
    //     names: toUse.names,
    //     studentID: toUse.ID,
    //     class: toUse.class,
    //     password: process.env.DEFAULT_PASSWORD,
    //     title: toUse.title
    // })
    // newStudent.save((err, doc)=>{
    //     if(err) return console.log(err)
    //     console.log(doc)
    // })
}

// signUp()


const addBook = () => {
    console.log()
}




app.listen(process.env.PORT, (err) => {
    console.log(`@ServerRunningOnPORT${process.env.PORT}`)
})

// ! Checking tokens
function authToken(req, res, next) {
    // console.log(req.cookies.jwt == '')
    if ((req.cookies.jwt == undefined) || (req.cookies.jwt == '')) return res.sendFile(path.join(__dirname, "/html/admin/redirect.html"))
    // console.log(req.cookies.jwt)
    let token = jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.sendFile(path.join(__dirname, "/html/admin/redirect.html"))

    })
    next()
}

function authTokenForPost(req, res, next) {
    if (req.cookies.jwt == undefined) return res.json({
        code: "#NoTokenNoService"
    })

    let token = jwt.verify(req.cookies.jwt, "librarySecret", (err, result) => {
        if (err) return res.json({
            code: "#Error"
        })
        if (result.title == "student") return res.json({
            code: "#NoAdminPrivilegesNoService"
        })
        next()

    })
}

