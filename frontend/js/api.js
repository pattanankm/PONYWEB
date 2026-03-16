const API = "http://localhost:3000"

export async function getPonies() {
  const res = await fetch("http://localhost:3000/ponies");
  return await res.json();
}

async function login(email,password){
  const res = await fetch(API + "/customer/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({email,password})
  })

  return res.json()
}

async function register(username,email,password){
  const res = await fetch(API + "/customer/register",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({username,email,password})
  })

  return res.json()
}