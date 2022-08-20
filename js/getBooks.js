fetch("/getBooks")
.then(res => res.json())
.then((data)=>{
    console.log(data)
    let head = ["title", "authors", "quantity", "inLibrary", "category"]
    // let head = ["title", "codes", "authors", "quantity", "inLibrary", "category"]
    if(location.pathname != '/explore') head = ["title", "codes", "authors", "quantity", "inLibrary", "category"]
    let functionToSend = null
    if(location.pathname == '/issue'){
        functionToSend = bookClick
    }
    buildTable(head, data.results, {title: "Registered books"}, functionToSend)
})