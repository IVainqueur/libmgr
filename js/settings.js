AlertAlt("The data being showed below might not be up-to-date. Please wait while the update data is being loaded")
const getSettings = async()=>{
let request = await fetch('/getSettings', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    _id: JSON.parse(localStorage.libraryInfo)._id
    })
})
let theInfo = await request.json()
if((theInfo.code == "#Success") && (theInfo.data != null)){
    localStorage.libraryInfo = JSON.stringify(theInfo.data)
    document.querySelector('label[for=user-name] p').textContent = JSON.parse(localStorage.libraryInfo).names
    document.querySelector('label[for=user-code] p').textContent = JSON.parse(localStorage.libraryInfo).ID
    document.querySelector('label[for=user-class] p').textContent = (JSON.parse(localStorage.libraryInfo).class) ? (JSON.parse(localStorage.libraryInfo).class) : ''
    document.querySelector('label[for=user-password] p').textContent = JSON.parse(localStorage.libraryInfo).password
    document.querySelector('label[for=user-title] p').textContent = JSON.parse(localStorage.libraryInfo).title

    AlertAlt("Up-to-date data loaded")
    setTimeout(()=>{document.querySelector('.alertDIV').children[1].click()}, 300)
}
}
getSettings()
let editing = false
document.querySelector('label[for=user-name] p').textContent = JSON.parse(localStorage.libraryInfo).names
document.querySelector('label[for=user-code] p').textContent = JSON.parse(localStorage.libraryInfo).ID
document.querySelector('label[for=user-class] p').textContent = (JSON.parse(localStorage.libraryInfo).class) ? (JSON.parse(localStorage.libraryInfo).class) : ''
document.querySelector('label[for=user-password] p').textContent = JSON.parse(localStorage.libraryInfo).password
document.querySelector('label[for=user-title] p').textContent = JSON.parse(localStorage.libraryInfo).title


document.querySelector('#EditBTN').addEventListener('click', (e)=>{
if(!editing){
    editing = true
    document.querySelector('label[for=user-name] p').contentEditable = "true"
    document.querySelector('label[for=user-code] p').contentEditable = "true"
    document.querySelector('label[for=user-class] p').contentEditable = "true"
    document.querySelector('label[for=user-password] p').contentEditable = "true"
    document.querySelector('label[for=user-title] p').contentEditable = "true"
    document.querySelector('#EditBTN').classList.add('Editing')
}else{
    //! Checking if the (probably new) info is valid
    for(let p of document.querySelectorAll('label p')){
    if((p.textContent == '') && (p.previousSibling.textContent != 'Class:')) return AlertAlt(`${p.previousSibling.textContent.slice(0, -1)} is empty`)
    }
    if(!['admin', 'student'].includes(document.querySelector('label[for=user-title] p').textContent)){
    return AlertAlt("The title can only be admin or student")
    }
    // console.log()
    let toSend = {
    _id: JSON.parse(localStorage.libraryInfo)._id,
    body: {
        names: document.querySelector('label[for=user-name] p').textContent,
        ID: document.querySelector('label[for=user-code] p').textContent,
        class: document.querySelector('label[for=user-class] p').textContent,
        password: document.querySelector('label[for=user-password] p').textContent,
        title: document.querySelector('label[for=user-title] p').textContent
    }
    
    }
    console.log("The new info", toSend)
    fetch('/updateSettings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(toSend)
    })
    .then(res => res.json())
    .then(data => {
    console.log(data)
    location.reload()
    })
}
})