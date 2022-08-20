function createCodeBlock(){
    let block = document.createElement('p')
    block.contentEditable = true
    document.querySelector('.Field .CodesInput').insertBefore(block, document.querySelector('.Field .CodesInput').children[0])
    block.autofocus = true
}
const getCategories = async ()=>{
    let res = await fetch("/getCategories")
    let data = await res.json()
    
    for(let category of data.categories){
      let option = document.createElement("option")
      option.value = category
      option.textContent = category
      document.querySelector("#CategoryChoice").appendChild(option)
    }
  
    console.log("%c End of the function", "color: green; font-weight: bold;")
}
  
getCategories()


//* IMPORTANT VARIABLES
let titleBox = document.querySelector('#TitleBox')
let quantityBox = document.querySelector('#QuantityBox')
let addBTN = document.querySelector('.AddBTN')
let codesInput = document.querySelector('.CodesInput')
let authorBox = document.querySelector('#AuthorBox')
let publisherBox = document.querySelector('#PublisherBox')
let shelfBox = document.querySelector('#ShelfBox')
let curriculumChoice = document.querySelector('#CurriculumChoice')
let categoryChoice =  document.querySelector('#CategoryChoice')
let selectedId = null




addBTN.addEventListener('click', createCodeBlock)
let popUp = document.querySelector('.popUp')
function toSend(){

}
fetch("/getBooks")
.then(res => res.json())
.then((data)=>{
  let request = {
    theData: data.results
  }
  console.log(data)
  // return
  request.heads = Object.keys(request.theData[0]).map((x)=>{
      if((x=="_id") || (x=="__v") || (x=="password")) return null
      return x
  })
  buildTable(request.heads, request.theData, {title: "Click on book to edit"}, bookClick)
})
function bookClick(e){    
  selectedId = this.getAttribute('_id')
  let popUpDiv = document.createElement('div')
  //!Filling in the info when a book is clicked
  for(let td of e.target.parentElement.children){
    console.log(td.getAttribute('head'))
    if(td.getAttribute('head') == 'title'){
        titleBox.value = td.textContent
    }else if(td.getAttribute('head') == 'codes'){
        let theCodes = td.textContent.split(',')
        for(let code of theCodes){
            addBTN.click()
            codesInput.children[0].textContent = code
        }
    }else if(td.getAttribute('head') == 'authors'){
        authorBox.value = td.textContent
    }else if(td.getAttribute('head') == 'quantity'){
        quantityBox.value = td.textContent
    }else if(td.getAttribute('head') == 'inLibrary'){
        document.querySelector('#InLibBox').value = td.textContent
    }else if(td.getAttribute('head') == 'category'){
        for(let option of categoryChoice.children){
            if(option.textContent.toLowerCase() == td.textContent.toLowerCase()){
                option.selected = true
                break
            }
        }
    }else if(td.getAttribute('head') == 'publisher'){
        publisherBox.value = td.textContent
    }else if(td.getAttribute('head') == 'shelf'){
        shelfBox.value = td.textContent
    }else if(td.getAttribute('head') == 'curriculum'){
        for(let option of curriculumChoice.children){
            if(option.textContent.toLowerCase() == td.textContent.toLowerCase()){
                option.selected = true
                break
            }
        }
    }
  }

  popUpDiv.classList.add('popUpDIV')
  popUpDiv.addEventListener('click', ()=>{
      popUp.classList.remove('popUpMode')
      document.body.removeChild(popUpDiv)
      selectedId = null
      // selected = {}
  }, {once: true})
  popUp.classList.add("popUpMode")
  document.querySelector('body').appendChild(popUpDiv)
  // console.log(this)
}

//! Adding event listeners
document.querySelector('#EditBTN').addEventListener('click', ()=>{
    let codes = []
    for(let code of document.querySelectorAll('.CodesInput p')){
        if(code.textContent == ''){
            AlertAlt('Empty Code boxes are considered as removed book codes')
        }else{
            codes.push(code.textContent)
        }
    }
    const toSend = {
        title: titleBox.value,
        codes: codes,
        authors: authorBox.value,
        quantity: quantityBox.value,
        inLibrary: document.querySelector('#InLibBox').value,
        category: categoryChoice.selectedOptions[0].value,
        publisher: publisherBox.value,
        shelfBox: shelfBox.value,
        curriculum: curriculumChoice.selectedOptions[0].value,
        _id: selectedId
    }
    // return console.log(toSend)
    if(confirm("Confirm that you want to update this book's info:")){
        fetch('/updateBook/false', {
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
    }

})
    document.querySelector('#DeleteBTN').addEventListener('click', ()=>{
    const toSend = {
        
    }
    fetch('/updateBook/true', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({title: titleBox.value, _id: selectedId})
    })
    .then(res => res.json())
    .then((data) => {
        console.log(data)
        if(data.code == "#Success"){
            AlertAlt("Successfully deleted the book "+ titleBox.value)
            setTimeout(()=>{
                location.reload()
            }, 2000)
        }else if(data.code == "#BorrowedBook"){
            AlertAlt("The book you're trying to delete is borrowed, so by deleting it you might lose some valuable records")
        }else{
            AlertAlt("Something went wrong. Please try again.")
        }
        document.querySelector('.popUpDIV').click()
    })
  
})