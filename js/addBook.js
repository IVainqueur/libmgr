function createCodeBlock(){
    let block = document.createElement('p')
    block.contentEditable = true
    document.querySelector('form .Field .CodesInput').insertBefore(block, document.querySelector('form .Field .CodesInput').children[0])
    block.autofocus = true
}

document.querySelector('form .Field .AddBTN').addEventListener('click', (e)=>{
    e.preventDefault()
    createCodeBlock()
})

window.onresize = (e)=>{
    if(window.innerWidth <= 650){
      document.querySelector('.sidebar').classList.add('close')
    }
    if(window.innerWidth <= 480){
        console.log("Reached here")
    }
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


///Sending the DATA to add a book to the Database
let formInputs = document.querySelectorAll('form input')
let codesInput = document.querySelector('.CodesInput')
let categoryChoice = document.querySelector('#CategoryChoice')
let curriculumChoice = document.querySelector('#CurriculumChoice')
let codes = []
document.querySelector("#AddBookBTN").addEventListener('click', (e)=>{
  e.preventDefault()
  codes = []
  //!Check if any field is empty
  let unFilled = false
  for(let input of formInputs){
    if((input.value == '') && (input.id != "AuthorBox")){
      unFilled = true
      input.parentElement.classList.add("unFilled")
      input.addEventListener('click', ()=>{
        input.parentElement.classList.remove("unFilled")
      }, {once: true})
    }
  }
  if(codesInput.children.length == 1) {
    // unFilled = true
    // codesInput.parentElement.classList.add('noCodes')
    // codesInput.addEventListener('click', ()=>{
    //   codesInput.parentElement.classList.remove('noCodes')
    // }, {once: true})
    console.log("No codes entered")
  }else{
    let i = 0
    for(let code of codesInput.children){
      if(codesInput.children.length-1 != i) codes.push(code.textContent)
      if(code.textContent == ''){
        // console.log(code)
        unFilled = true
        code.style.boxShadow = "0px 0px 10px rgba(192, 0, 0, 0.753)"
        code.addEventListener('click', ()=>{
          code.style.boxShadow = "none"
        }, {once: true})
      }
      i++
    }
  }
  if(categoryChoice.selectedIndex == 0) {
    unFilled = true
    categoryChoice.parentElement.classList.add('noCategory')
    categoryChoice.addEventListener('click', ()=>{
      categoryChoice.parentElement.classList.remove('noCategory')
    }, {once: true})
  }

  if(unFilled) return

  //? This here below was supposed to check if the number of book codes entered matched the number of copies specified
  //? Instead, the librarian should be able to add a new book when he's going to issue it!
  
  // if(codesInput.children.length-1 != document.querySelector('#QuantityBox').valueAsNumber){
  //   codesInput.classList.add('booksDontMatchCodes')
  //   AlertAlt("The number of book codes given should match the number of books said to be present")
  //   return
  // }

  //!If the fields are all filled properly, then send the info
  let bookInfo = {
    title: document.querySelector('#TitleBox').value,
    codes: codes,
    authors: document.querySelector('#AuthorBox').value,
    quantity: document.querySelector('#QuantityBox').value,
    category: document.querySelector('#CategoryChoice').selectedOptions[0].value,
    publisher: document.querySelector('#PublisherBox').value,
    shelf: document.querySelector('#ShelfBox').value,
    curriculum: document.querySelector('#CurriculumChoice').selectedOptions[0].value
  }
  // console.log(bookInfo)
  // return
  fetch("/addBook", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookInfo)
  })
  .then(res => res.json())
  .then((data)=>{
    console.log(data)
    clearForm()
    location.reload()
  })
  .catch(err => console.log(err))
})

function clearForm(){
  for(let input of formInputs){
    input.value = ""
  }
  for(let code of codesInput.children){
    if(codesInput.children.length != 1){
      codesInput.removeChild(codesInput.firstChild)
    }
  }
  categoryChoice.selectedIndex = 0

}