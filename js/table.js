document.querySelector('table tbody').innerHTML = "Loading..."
let alreadyBuiltFirstTable = false
if(window.innerWidth <= 1000){
    document.querySelector('.sidebar').classList.add('close')
}

let numberOfTables = 0

window.onresize = (e)=>{
    if(window.innerWidth <= 1000){
        document.querySelector('.sidebar').classList.add('close')
    }
    // document.querySelector('.home-section').style.width = (window.innerWidth <= 480) ? "100%" : ""

}

const buildTable = (heads, theData, options, functionSent)=>{
    // console.log(functionSent)
    // console.log(heads, theData)
    // return
    
    numberOfTables++
    let actualHeads = []
    if(!heads) return
    console.log(heads)
    for(let head of heads){
        if(head) actualHeads.push(head)
    }
    heads = actualHeads
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    let table = null
    if(!alreadyBuiltFirstTable){
        alreadyBuiltFirstTable = true
        table = document.querySelector('table')
        table.children[1].innerHTML = ""
        if(options.title){
            let h1 = document.createElement('h1')
            // h1.textContent = options.title
            // document.querySelector('.filter').insertBefore(h1, document.querySelector('table'))
        }
    }else{
        table = document.createElement('table')
        // table.appendChild(thead)
        // table.appendChild(tbody)
    }
    table.classList.add('printable')
    let toAdd = (options.button != null) ? "Action" : null
    //Build the table head
    for(let head of heads.concat(toAdd)){
        if(head){
            let th = document.createElement('th')
            th.textContent = head
            thead.appendChild(th)
        }
    }
    // console.log(theData)
    
    for(let data of theData){

        let tr = document.createElement('tr')
        if(data._id) tr.setAttribute('_id', data._id)
        if(data.overdue){
            tr.style.backgroundColor = "#d92424"
            tr.style.color = "white"
        }
        for(let i=0; i < (heads.length); i++){
            let td = document.createElement('td')
            td.setAttribute("head", heads[i])
            td.innerHTML = data[heads[i]]
            td.innerHTML = td.textContent.replace(/"(.{2,})"/g, "<strong>$1</strong>").replace(/\[(.{2,})\]/, "$1")
            if(td.textContent == 'undefined') td.textContent = 'unknown'
            tr.appendChild(td)
        }
        if(options.button != null){
            let td = document.createElement('td')
            // console.log(theButton)
            let theButton = document.createElement('button')
            theButton.innerHTML = options.button.innerHTML
            theButton.className = options.button.className
            theButton.addEventListener('click', options.button.eventListener)
            td.appendChild(theButton)
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)
    for(let tr of document.querySelectorAll('tr')){
        
        tr.addEventListener('click', functionSent)
    }
    if(alreadyBuiltFirstTable) {
        let h1 = document.createElement('h1')
        h1.classList.add('printable')
        h1.textContent = options.title
        if(numberOfTables == 1){
            document.querySelector('.Search').insertBefore(h1, document.querySelector('.Search input'))
        }else{
            h1.style.marginLeft = "30px"
            document.querySelector('.filter').appendChild(h1)
        }
        document.querySelector('.filter').appendChild(table)
    }
}

const buildManyTables = (list)=>{
    // console.log(list)
    // return
    for(let oneTable of list){
        buildTable(oneTable.heads, oneTable.theData, {title: oneTable.title})
    }
}
///Searching through the table
function filterTable(value) {
    if (value != "") {
        $("table tbody>tr").hide();
        
        $(`table td:contains-ci('${value}')`).parent("tr").show();
        
    } else {
        $("table tbody>tr").show();
    }
    
}

// jQuery expression for case-insensitive filter
$.extend($.expr[":"], {
    "contains-ci": function (elem, i, match, array) {
        return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

// Event listener
$('#SearchBox').on('keyup', function () {
    filterTable($(this).val());
});


const observer = new ResizeObserver((entries)=>{
    const theTable = entries[0]
    let isSmall = (theTable.contentRect.width < 650) ? true : false
    document.querySelector('thead').style.display = (isSmall) ? "none" : ""
    for(let td of document.querySelectorAll('td')){
        td.className = (isSmall) ? "td" : ""
    }
    for(let thead of document.querySelectorAll('thead')){
        thead.style.display = isSmall ? "none" : ""
    }
    if(document.querySelector('.ActionButton')){
        for(let actionBTN of document.querySelectorAll('.ActionButton')){
            actionBTN.style.marginTop = isSmall ? "-10px" : ""
        }
    }
    // document.querySelector('td').style.display = (isSmall) ? "block" : ""
})

observer.observe(document.querySelector('table'))