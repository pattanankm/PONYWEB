async function loadPonies(){

  const ponies = await getPonies()

  const list = document.getElementById("pony-list")

  ponies.forEach(p => {

    const card = document.createElement("div")

    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.price} Baht</p>
    `

    list.appendChild(card)

  })

}

loadPonies()