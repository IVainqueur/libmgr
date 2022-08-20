let issuedReport = null
let returnedReport = null
const getIssuedReport = async ()=>{
    await fetch("/issuedReport")
    .then(res => res.json())
    .then((data)=>{
        data.map((x) => {
            x.issuedDate = new Date(Date.parse(x.issuedDate)).toString().slice(0, 15)
            x.returnDate = new Date(Date.parse(x.returnDate)).toString().slice(0, 15)
        })
        console.log(data)
        issuedReport = data
    })
    .catch(err => console.log(err))
    console.log("Reached1")
    // return data
}

const getReturnedReport = async ()=>{
    await fetch("/returnedReport")
    .then(res => res.json())
    .then((data)=>{
        console.log(data)
        data.data.map((x) => {
            // x.issuedDate = new Date(Date.parse(x.issuedDate)).toString().slice(0, 15)
            x.returnDate = new Date(Date.parse(x.returnDate)).toString().slice(0, 15)
        })
        returnedReport = data
    })
    .catch(err => console.log(err))
    console.log('reached2')
}

const getReports = async ()=>{
    //get all reports including
    //IssuedReport
    //ReturnedReport
    //
    await getIssuedReport()
    await getReturnedReport()
    let request = {
        issuedReport: {
            theData: issuedReport,
            title: "Books that have not been returned"
        },
        returnedReport: {
            theData: returnedReport.data,
            title: "Returned Book Report"
        }
    }

    
    if(issuedReport.length != 0){
        request.issuedReport.heads = Object.keys(issuedReport[0]).map((x)=>{
            if((x=="_id") || (x=="__v") || (x=="bookCount")) return null
            return x
        })
    }
    
    if(returnedReport.data.length != 0){
        request.returnedReport.heads = Object.keys(returnedReport.data[0]).map((x)=>{
            if((x=="_id") || (x=="__v") || (x=="lateFor") ) return null
            return x
        })
    }
    console.log(request.issuedReport.theData.length)
    console.log(request.issuedReport.theData.length)
    if(request.issuedReport.theData.length == 0 && request.returnedReport.theData.length == 0){
        document.querySelector('.filter').children[0].children[1].innerHTML = ""
        let nothingToShow = "Nothing to show..."
        let i = 0
        let theMessage = setInterval(()=>{
            document.querySelector('.filter').children[0].children[1].innerHTML += nothingToShow[i]
            i++
            if(i == nothingToShow.length-1) clearInterval(theMessage)
        }, 100)
    }
    // console.log(request)
    buildManyTables([request.issuedReport, request.returnedReport])
}

getReports()