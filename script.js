let allPokemon = [];
let loadedPokemonCount = 0;

const pokemonDialog = document.getElementById('pokemon-dialog');



const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0"


async function init() {
    await getPokemon();
}

async function getPokemon() {
    let response = await fetch(POKEMON_LIST_URL);
    let data = await response.json();
    for (let i = 0; i < 20 && i < data.results.length; i++) {
        loadPokemonDetails(data.results[i], i);
    }
}

function genrateTemplate(i) {
    return `
            <article onclick="openDialog(${i})" class="pokemon-card" data-id="${i}">
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

function generateDialogTemplate(pokemon) {
    return `
           <!-- HEADER -->
        <header class="dialog-header">
            <button onclick="closeDialog()" class="back-button" aria-label="Close dialog">←</button>
            <h2 class="dialog-pokemon-name">${pokemon.name}</h2>
            <span class="dialog-pokemon-id">${formatedId(pokemon.id - 1)}</span>
        </header>

        <!-- HERO IMAGE -->
        <section class="dialog-hero">
            <img src="${pokemon.image}" alt="Bulbasaur" class="dialog-pokemon-image type-${pokemon.types[0]}">
        </section>

        <!-- TABS -->
        <nav class="dialog-tabs">
            <button data-tab="about" class="tab active">About</button>
            <button data-tab="stats" class="tab">Base Stats</button>
            <button data-tab="evolution" class="tab">Evolution</button>
        </nav>

        <!-- TAB CONTENT -->
        <section class="dialog-tab-content">

            <div class="tab-panel active" id="about">
                <!-- About Content -->
            </div>

            <div class="tab-panel" id="stats">
                <!-- Base Stats -->
            </div>

            <div class="tab-panel" id="evolution">
                <!-- Evolution -->
            </div>

        </section>`
}

function openDialog(index) {
    pokemonDialog.showModal();
    dialogContent(allPokemon[index]);
}

function closeDialog() {
    pokemonDialog.close();
}

function dialogContent(pokemon) {
    let dialogContent = document.getElementById('pokemon-dialog');
    dialogContent.innerHTML = "";
    dialogContent.innerHTML = generateDialogTemplate(pokemon);
}

pokemonDialog.addEventListener('click', (event) => {
    if (event.target === pokemonDialog) {
        pokemonDialog.close();
    }
});

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
    let pokemon = createPokemonObject(data, listPokemon, index);
    allPokemon[index] = pokemon;
    loadedPokemonCount++;
    if (loadedPokemonCount === 20) {
        renderPokemon();
    };
}

function createPokemonObject(data, listPokemon, index) {
    return {
        id: index + 1,
        name: listPokemon.name,
        image: data.sprites.front_default,
        types: data.types.map(pokeType => pokeType.type.name),
        abilities: data.abilities.map(pokeAbility => pokeAbility.ability.name),
        stats: {}
    };
}

function generateTypesHTML(typesArray) {
    return typesArray
        .map(type => `<span class="type type-${type}">${type}</span>`)
        .join("");
}

