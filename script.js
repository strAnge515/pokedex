let allPokemon = [];

let pokemon = [];

pokemon = allPokemon;

const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0"


async function init() {
    await getPokemon();
    renderPokemon();

}

async function getPokemon(path = "") {
    let response = await fetch(POKEMON_LIST_URL + path);
    let data = await response.json();

    allPokemon = data.results;
    console.log(allPokemon);

}

function genrateTemplate(i) {
    return `
            <article class="pokemon-card" data-id="1">
                <header class="card-header">
                    <h2 class="pokemon-name">${allPokemon[i].name}</h2>
                    <span class="pokemon-id">#${formatedId(i)}</span>
                 </header>

                <main class="card-main">
                    <img src="" alt="Bulbasaur" class="pokemon-image">
                </main>

       
                <footer  footer class="card-footer">
                    <span class="type grass">Grass</span>
                    <span class="type poison">Poison</span>
                </footer>
            </article>`
}

function renderPokemon() {
    let content = document.getElementById("content");
    content.innerHTML = "";

    for (let i = 0; i < 20 && i < allPokemon.length; i++) {
        content.innerHTML += genrateTemplate(i);
    }
}

function formatedId(number) {
     return (number + 1).toString().padStart(3, "0");
}