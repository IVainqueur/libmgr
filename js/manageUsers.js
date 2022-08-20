let popUp = document.querySelector('.popUp')
function toSend(){

}
fetch("/getUsers")
.then(res => res.json())
.then((data)=>{
let request = {
    theData: data.data
}
request.heads = Object.keys(request.theData[0]).map((x)=>{
    if((x=="_id") || (x=="__v") || (x=="password")) return null
    return x
})
buildTable(request.heads, request.theData, {title: "Click on user to edit"}, bookClick)
})
function bookClick(e){    
let popUpDiv = document.createElement('div')
document.querySelector('#NameBox').value = e.target.parentElement.children[0].textContent
document.querySelector('#IDBox').value = e.target.parentElement.children[1].textContent
document.querySelector('#ClassBox').value = e.target.parentElement.children[2].textContent

for(let option of document.querySelector('select').children){
    if(option.value == e.target.parentElement.children[3].textContent.toLowerCase()){
    option.selected = true
    break
    }
}

popUpDiv.classList.add('popUpDIV')
popUpDiv.addEventListener('click', ()=>{
    popUp.classList.remove('popUpMode')
    document.body.removeChild(popUpDiv)
    // selected = {}
}, {once: true})
popUp.classList.add("popUpMode")
document.querySelector('body').appendChild(popUpDiv)
// console.log(this)
}

//! Adding event listeners
document.querySelector('#EditBTN').addEventListener('click', ()=>{
const toSend = {
    name: document.querySelector('#NameBox').value,
    ID: document.querySelector('#IDBox').value,
    class: (document.querySelector('#ClassBox').value == '') ? null : document.querySelector('#ClassBox').value,
    title: document.querySelector('select').selectedOptions[0].value
}
// return console.log(toSend)
fetch('/editUser', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(toSend)
})
.then(res => res.json())
.then((data) => {
    console.log(data)
    if(data.code == "#Success"){
    AlertAlt("Success")
    setTimeout(()=>{
        location.reload()
    }, 1000)
    }else{
    AlertAlt("Something went wrong. Please try again.")
    }
    document.querySelector('.popUpDIV').click()
})

})
document.querySelector('#DeleteBTN').addEventListener('click', ()=>{
const toSend = {
    
}
fetch('/deleteUser', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({ID: document.querySelector('#IDBox').value})
})
.then(res => res.json())
.then((data) => {
    console.log(data)
    if(data.code == "#Success"){
    AlertAlt("Success")
    setTimeout(()=>{
        location.reload()
    }, 1000)
    }else{
    AlertAlt("Something went wrong. Please try again.")
    }
    document.querySelector('.popUpDIV').click()
})

})