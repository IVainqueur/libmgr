let popUp = document.querySelector('.popUp')
let selected = {}
fetch("/issuedReport")
.then(res => res.json())
.then((data) => {
    let today = Date.parse(new Date(Date.now()).toString().slice(0,15) + " 00:00:00")
    data.map((x) => {
        // console.log()
        if(Date.parse(new Date(x.returnDate)) - today <= 0){
            x.overdue = true
        }else{
            x.overdue = false
        }
        x.issuedDate = new Date(Date.parse(x.issuedDate)).toString().slice(0, 15)
        x.returnDate = new Date(Date.parse(x.returnDate)).toString().slice(0, 15) //Create an array of all the new 
    })

    //Something is going wrong
    let button = document.createElement('button')
    button.innerHTML = "Returned"
    button.className = "ActionButton"
    button.addEventListener('click', (e)=>{
        console.log("Clicked the icon")
    })
    let buttonContent = {
        innerHTML: "Return",
        className: "ActionButton",
        eventListener: bookClick
    }
    buildTable(["userNames", "userID","bookTitle", "bookCode", "issuedDate", "returnDate", "bookCount"],data, {button: buttonContent, title: "Issued Books"}, bookClick)
})
function bookClick(e){
let popUpDiv = document.createElement('div')
console.log(this)
// return
selected = {
    _id: this.getAttribute("_id"),
    bookCode: this.children[3].textContent,
    bookTitle: this.children[2].textContent,
    borrower: this.children[0].textContent,
    borrowerCode: this.children[1].textContent,
    bookCount: this.children[6].textContent
}
// console.log(this.children[2].textContent)
popUp.children[0].innerHTML = `Returned &nbsp;<span style="color: green; font-weight: 100;">${this.children[2].textContent}</span> &nbsp;in what condition`
popUpDiv.classList.add('popUpDIV')
popUpDiv.addEventListener('click', ()=>{
    popUp.classList.remove('popUpMode')
    document.body.removeChild(popUpDiv)
    selected = {}
}, {once: true})
popUp.classList.add("popUpMode")
document.querySelector('body').appendChild(popUpDiv)
// console.log(this)
}
document.querySelector('#ReturnBTN').addEventListener('click', ()=>{
// console.log(this)
let conditionBox = document.querySelector('#ReturnConditionBox')
if(conditionBox.children[0].value == '') return conditionBox.classList.add('noCondition')
selected.condition = conditionBox.children[0].value
// return
fetch('/returnBook',{
    method: "POST",
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(selected)
})
.then(res => res.json())
.then(data => console.log(data))
document.querySelector('.popUpDIV').click()
AlertAlt("Successfully returned the book")
setTimeout(()=>{
    location.reload()
}, 1000)
})