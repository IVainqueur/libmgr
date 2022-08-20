document.querySelector('form').addEventListener('submit', (e)=> {
    e.preventDefault()
})
document.querySelector('form').addEventListener('keydown', (e)=> {
    if(e.key == 'Enter') e.preventDefault()

})
document.querySelector('form').addEventListener('keyUp', (e)=> {
    if(e.key == 'Enter') e.preventDefault()
})
let popUp = document.querySelector('.popUp')
let checkedBookCode = false
let checkedUser = false
let goodToGo = false
let toSend = {
    bookCode: '',
    ID: '',
    title: ''
}

let selectedTr = null
let foundMultiple = false

document.querySelector('#CodeBoxInput').addEventListener('keyup', (e)=>{
    checkedBookCode = false
    goodToGo = false
    toSend.bookCode = ''
    if(e.key != "Enter") return
    checkForBook()
})
document.querySelector('#StudentCodeOrNameBoxInput').addEventListener('keyup', (e)=>{
    checkedUser = false
    goodToGo = false
    toSend.ID = ''
    if(e.key != "Enter") return
    checkForUser()
})

document.querySelector('#IssueBTN').addEventListener('click', async (e)=>{
    //! Checking whether the fields are filled and with appropriate info
    if(document.querySelector('#CodeBoxInput').value == "") return document.querySelector('#CodeBox').className = "notFilled"
    if(document.querySelector('#StudentCodeOrNameBoxInput').value == "") return document.querySelector('#StudentCodeOrNameBox').className = "notFilled"
    if(document.querySelector('#ReturnBoxInput').value == "") return document.querySelector('#ReturnBox').className = "notFilled"
    if(!checkedBookCode) await checkForBook()
    if(!checkedUser) await checkForUser()

    toSend.bookCode = document.querySelector('#CodeBoxInput').value.split(';').map(x => x.split(' ').join(''))
    toSend.title = document.querySelector('#BookNameInput').value
    
    //! Making issue date
    let now = new Date(Date.now())
    let issueDate = Date.now() - (now.getMilliseconds() + now.getSeconds()*1000 + now.getMinutes()*60*1000 + now.getHours()*60*60*1000)
    
    
    toSend.returnDate = document.querySelector('#ReturnBoxInput').valueAsNumber
    toSend.issueDate = issueDate
    //? Here we set the number of books to issue
    toSend.bookCount = document.querySelector('#CodeBoxInput').value.split(';').length
    // return console.log(toSend)

    goodToGo = (checkedUser && checkedBookCode && !foundMultiple)
    if(!goodToGo){
        if(foundMultiple){
            foundMultiple = false
            return AlertAlt("There were multiple matches for the ID or name you entered, please make sure the one you want is selected")
        }
       return AlertAlt("Please fill all the fields appropriately")
    }
    // console.log({goodToGo: goodToGo, checkedForBook: checkedBookCode, checkedUser: checkedUser})
    // return
    // return console.log(toSend)
    // return console.log("reached here")
    await fetch("/issueBook", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(toSend)
    })
    .then(res => res.json())
    .then(data => console.log(data))
    AlertAlt("Book successfully issued")
    document.querySelector('form').reset()
    checkedBookCode = false
    checkedUser = false
    document.querySelector('.popUpDIV').click()
    setTimeout(()=>{
        location.reload()
    }, 1000)
})

async function checkForBook(){
    document.querySelector('#CodeBox').className = "checking"
    await fetch("/checkForBook", {
        method: "POST",
        headers: {
        'Content-Type': "application/json"
        },
        body:JSON.stringify({
        title: document.querySelector('#BookName input').value,
        code: document.querySelector('#CodeBoxInput').value.split(';').map(x => x.split(' ').join(''))
        })
    })
    .then(res => res.json())
    .then((data)=>{
        console.log(data)
        if(data.code == "#ExistAndNotBorrowed"){
            checkedBookCode = true
            toSend.bookCode = document.querySelector('#CodeBoxInput').value
            goodToGo = true
        }else if(data.code == "#NonExistent"){
            console.log(`The book with code ${data.which} does not exist`)
            AlertAlt(`The book with code ${data.which} does not exist`)
        }else if(data.code == "#AlreadyBorrowed"){

            console.log(`The book with code ${data.which} is already borrowed`)
            console.log(data.which)
            AlertAlt(`The book with code ${data.which} is already borrowed`)
        }
        document.querySelector('#CodeBox').className = `${data.code.slice(1)}`
    })
}
async function checkForUser(){
    document.querySelector('#StudentCodeOrNameBox').className = "checking"
    let what = parseInt(document.querySelector('#StudentCodeOrNameBoxInput').value) ? "code" : "names"
    await fetch("/checkForUser", {
        method: "POST",
        headers: {
        'Content-Type': "application/json"
        },
        body:JSON.stringify({
        what: what,
        data: document.querySelector('#StudentCodeOrNameBoxInput').value
        })
    })
    .then(res => res.json())
    .then((data)=>{
        console.log(data)
        if(data.code == "#Found"){
            let toDisplay = ""
            if(data.data.length == 0){
                toDisplay = "No such user in the database"
                // document.querySelector('#StudentCodeOrNameBox').setAttribute("todisplay", toDisplay)
                document.querySelector('#StudentCodeOrNameBox').className = `noSuchUser`

                return
            }
            goodToGo = true
            checkedUser = true
            toSend.ID = data.data[0].ID
            toSend.userNames = data.data[0].names
            toDisplay = `${data.data[0].names} -> ${data.data[0].ID}`
            if(data.data.length > 1){
                // checkedUser = false
                foundMultiple = true
                toDisplay = "Multiple matches were found"
                if(document.querySelector('#StudentCodeOrNameBox select')){
                    document.querySelector('#StudentCodeOrNameBox').removeChild(document.querySelector('#StudentCodeOrNameBox select'))
                }
                let select = document.createElement('select')
                for(let person of data.data){
                    let option = document.createElement('option')
                    option.value = `${person.ID}`
                    option.textContent = `${person.names} -> ${person.ID}`
                    select.appendChild(option)
                }
                document.querySelector('#StudentCodeOrNameBox').appendChild(select)
                select.addEventListener('change', ()=>{
                    let toSplice = select.selectedOptions[0].textContent.search("->")
                    toSend.ID = select.selectedOptions[0].value
                    toSend.userNames = select.selectedOptions[0].textContent.slice(0, toSplice-1)
                })
                toSend.ID = select.selectedOptions[0].value
            }
            document.querySelector('#StudentCodeOrNameBox').setAttribute("todisplay", toDisplay)
        }
        document.querySelector('#StudentCodeOrNameBox').className = `${data.code.slice(1)}`
        
    })
}


function bookClick(e){
    let popUpDiv = document.createElement('div')
    document.querySelector('#BookNameInput').value = this.children[0].textContent
    popUpDiv.classList.add('popUpDIV')
    popUpDiv.addEventListener('click', ()=>{
      popUp.classList.remove('popUpMode')
      document.querySelector('form').reset()
      document.body.removeChild(popUpDiv)
      selectedTr = null
    }, {once: true})
    popUp.classList.add("popUpMode")
    document.querySelector('body').appendChild(popUpDiv)
    // console.log(this)
    selectedTr = this
}

document.querySelector('#NewCodeBTN').addEventListener('click', (e)=>{
    //First check if there is no such code for that book
    let newCode = document.querySelector('#CodeBoxInput').value
    if(newCode == '') return AlertAlt("The code field is empty")
    for(let td of selectedTr.children){
        if(td.getAttribute('head') == 'codes'){
            
            if(td.textContent.split(',').includes(newCode)){
                AlertAlt("The New Code already exists")
                return
            }else{
                break
            }
        }
    }
    document.querySelector('#NewCodeBTN').style.pointerEvents = "none"
    fetch('/newCode', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: document.querySelector('#BookNameInput').value,
            newCode: newCode
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.code == "#Error"){
            AlertAlt("Something went wrong. Please try again.")
        }else if(data.code == "#Success"){
            AlertAlt("Successfully added the new code")
        }
        
    })
})