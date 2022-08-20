// SideBar
let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e)=>{
    // console.log([i])
  let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
  // console.log(arrowParent)
  arrowParent.classList.toggle("showMenu");
  });
}
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
// console.log(sidebarBtn);
sidebarBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("close");
});

document.querySelector("#profile_name").textContent = JSON.parse(localStorage.libraryInfo).names.split(' ')[0]
document.querySelector("#job").textContent = JSON.parse(localStorage.libraryInfo).title

if(window.innerWidth <= 650){
  document.querySelector('.sidebar').classList.add('close')
}
// document.querySelector('.home-section').style.width = (window.innerWidth <= 480) ? "100vw" : ""

window.onresize = (e)=>{
  if(window.innerWidth <= 650){
    document.querySelector('.sidebar').classList.add('close')
  }
  // document.querySelector('.home-section').style.width = (window.innerWidth <= 480) ? "100vw" : ""
}

function AlertAlt(msg){
  //!Positioning it under the last one
  let currentAlertDIV = document.querySelectorAll('.alertDIV')[document.querySelectorAll('.alertDIV').length -1]
  let currentAlertDIVLength = document.querySelectorAll('.alertDIV').length
  let currentPos = (document.querySelectorAll('.alertDIV').length == 0) ? 20 : currentAlertDIVLength*20 + currentAlertDIV.getBoundingClientRect().height*currentAlertDIVLength + 10

  let alertDIV = document.createElement('div')
  alertDIV.className = "alertDIV"
  alertDIV.innerHTML = `<p>${msg}</p> <i class='bx bx-x' style='color:#cb0e0e'  ></i>`
  document.querySelector('body').appendChild(alertDIV)
  alertDIV.setAttribute("cur-count", `${document.querySelectorAll('.alertDIV').length -1}`)

  setTimeout(()=>{
    alertDIV.style.top = `${currentPos}px`
  }, 00)

  alertDIV.children[1].addEventListener('click', ()=>{
    console.log('Called')
    let theOneBelow = document.querySelectorAll('.alertDIV')[parseInt(alertDIV.getAttribute("cur-count"))+1]
    if(theOneBelow){
      let toRePosition = Array.prototype.slice.call(document.querySelectorAll('.alertDIV')).slice(parseInt(alertDIV.getAttribute("cur-count")))
      for(let i=1; i < toRePosition.length; i++){
        console.log({
          i: toRePosition[i].style.top,
          im1: toRePosition[i-1].style.top,
          new: `${parseInt(toRePosition[i].style.top.slice(0, -2)) -  toRePosition[i-1].getBoundingClientRect().height - 10}px`
        })
        toRePosition[i].setAttribute("cur-count", `${parseInt(alertDIV.getAttribute('cur-count')) + (i-1)}`)
        toRePosition[i].style.top = `${parseInt(toRePosition[i].style.top.slice(0, -2)) -  toRePosition[i-1].getBoundingClientRect().height - 10}px`
      }
      // theOneBelow.style.top = `${parseInt(theOneBelow.style.top.slice(0, -2)) - alertDIV.getBoundingClientRect().height - 10}px`
    }
    document.querySelector('body').removeChild(alertDIV)
  })

}


//* Quick link to settings

document.querySelector('.profile-content').addEventListener('click', ()=>{
  location.pathname = '/settings'
})

document.querySelector('body > div.sidebar > ul > li:nth-child(8) > div > i').addEventListener('click', ()=>{
  location.pathname = "/"
})