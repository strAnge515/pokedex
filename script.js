let allPokemon = [];


const pokemonDialog = document.getElementById('pokemon-dialog');



const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0"


async function init() {
    await getPokemon();
}

async function getPokemon(path = "") {
    let response = await fetch(POKEMON_LIST_URL + path);
    let data = await response.json();

    for (let i = 0; i < 20 && i < data.results.length; i++) {
        loadPokemonDetails(data.results[i], i);
         
    }
   
}

function genrateTemplate(i) {
    return `
            <article onclick="openDialog()" class="pokemon-card" data-id="${i}">
                <header class="card-header">
                    <h2 class="pokemon-name">${allPokemon[i].name}</h2>
                    <span class="pokemon-id">#${formatedId(i)}</span>
                 </header>

                <main class="card-main type-${allPokemon[i].types[0]}">
                    <img src="${allPokemon[i].image}" alt="${allPokemon[i].name}" class="pokemon-image">
                </main>

       
                <footer  footer class="card-footer">
                   ${generateTypesHTML(allPokemon[i].types)}
                </footer>
            </article>`
            
}

function openDialog() {
  pokemonDialog.showModal();
}

function closeDialog() {
    pokemonDialog.close();
}

pokemonDialog.addEventListener('click', (event) => {
    if (event.target === pokemonDialog) {
        pokemonDialog.close();
    }
});

function pokemonDialogContent() {
    
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

async function loadPokemonDetails(listPokemon, index) {
    let response = await fetch(listPokemon.url);
    let data = await response.json();


    let pokemon = {
        id: index + 1,
        name: listPokemon.name,
        image: data.sprites.front_default,
        types: data.types.map(pokeType => pokeType.type.name),
        abilities: data.abilities.map(pokeAbility => pokeAbility.ability.name),
        stats: {}
        };


    allPokemon.push(pokemon);
    renderPokemon();
    if (allPokemon.length === 20) {
        renderPokemon();
    };
}

function generateTypesHTML(typesArray) {
 return typesArray
        .map(type => `<span class="type type-${type}">${type}</span>`)
        .join("");
}

