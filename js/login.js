document.querySelector("form input[type=submit]").addEventListener('click', (e)=>{
    e.preventDefault()
    $.ajax({
        // url:`/signin/?ID=${document.querySelector("#IDBox").value.toUpperCase()}&pass=${document.querySelector("#PasswordBox").value}`,
        url: "/signin",
        method: "POST",
        xhrFields: {
            withCredentials: true
         },
        contentType: "application/json",
        data: JSON.stringify({
            ID: document.querySelector("#IDBox").value.toUpperCase(),
            pass: document.querySelector("#PasswordBox").value
        }),
        success: (res)=>{
            console.log(res)
            if(res.code == "#Error"){
                alert("Something went wrong. Please try again later.")
            }else if(res.code == "#UnAuthorized"){
                alert("Incorrect ID or password")
            }else if(res.code == "#NoSuchID"){
                alert("Incorrect email or password")
            }else if(res.code == "#AccessGranted"){
                localStorage.kcslibraryInfo = JSON.stringify(res.info)
                location.href = "/dashboard"
                console.log(res)
            }
        },
        error: (err)=>{
            console.log("%c Something went wrong", "font-size:20px")
        }
    })
    // fetch(`/signin/?ID=${document.querySelector("#IDBox").value.toUpperCase()}&pass=${document.querySelector("#PasswordBox").value}`,{
    //     credentials: "include"
    //   })
    // .then(res => res.json())
    // .then(data => console.log(data))
    // .catch(err => console.log(err))
  })