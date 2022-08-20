if(window.innerWidth < 1000){
    document.querySelector('.sidebar').classList.add('close')
}

window.onresize = ()=>{
    let isSmall =  (window.innerWidth < 1000) 
    if(isSmall){
        document.querySelector('.sidebar').classList.add('close')
    }
}

let observer = new ResizeObserver((entries)=>{
    let theBtns = entries[0]
    console.log(theBtns.contentRect.width)
    let isSmall = theBtns.contentRect.width < 341
    let isTooSmall = theBtns.contentRect.width < 176
    // if(isTooSmall) {
        
    // }
    // document.querySelector('.dash-blocks').style.flexDirection = (isTooSmall) ? "column-reverse" : ""
    if(isSmall){
        document.querySelector('.btns').classList.add('smallBtns')
    }else{
        document.querySelector('.btns').classList.remove('smallBtns')
    }
})

observer.observe(document.querySelector('.btns'))


//! Getting summary info

const getSummaryInfo = async ()=>{
  //get DueToDayReport
  let one = Date.now()
  let two = new Date(one)
  let milliSecLess = one - (two.getMilliseconds()+two.getSeconds()*1000 + two.getMinutes()*1000*60 + two.getHours()*1000*60*60)

  await fetch(`/dueToDayReport/true/${milliSecLess}/000`)
  .then(res => res.json())
  .then((data)=>{
    //   console.log(data)/
    document.querySelector('#DueToDay').textContent = data.data
  })

  await fetch(`/issuedToDayReport/${milliSecLess}/000`)
  .then(res => res.json())
  .then((data)=>{
    //   console.log(data)
    document.querySelector('#IssuedToDay').textContent = data.data
  })


}

getSummaryInfo()