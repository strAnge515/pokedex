let allPokemon = [];
let startIndex = 0;
let filteredPokemonArr = [];
const pokemonDialog = document.getElementById('pokemon-dialog');
const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0";



async function init() {
    showSpinner();
    await getPokemon();
    await renderPokemon();
    hideSpinner();
}

async function renderPokemon() {
    showSpinner();
    const array = filteredPokemonArr.length ? filteredPokemonArr : allPokemon;
    filteredPokemonArr.length
        ? await renderFiltered(array)
        : await renderBatch(array);

    hideSpinner();
}

async function renderBatch(array) {
    const content = document.getElementById("content");
    const batchSize = 20;
    let endIndex = Math.min(startIndex + batchSize, array.length);
    for (let i = startIndex; i < endIndex; i++) {
        await loadPokemonDetails(array[i], i);
        content.innerHTML += genrateTemplate(array[i]);
    }
    startIndex = endIndex;
    document.getElementById("load-more").style.display =
        startIndex >= array.length ? "none" : "block";
}

function filterPokemon(allPokemon, searchText) {
    return allPokemon.filter(pokemon =>
        pokemon.name.includes(searchText));
}

function searchPokemon() {
    const searchInput = document.getElementById("search-input");
    const text = searchInput.value.toLowerCase();
    if (text.length >= 3) {
        filteredPokemonArr = filterPokemon(allPokemon, text);
    } else {
        filteredPokemonArr = [];
        startIndex = 0; 
    }
    renderPokemon();
}

async function renderFiltered(array) {
    const content = document.getElementById("content");
    content.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        await loadPokemonDetails(array[i], i);
        content.innerHTML += genrateTemplate(array[i]);
    }
    document.getElementById("load-more").style.display = "none";
}

async function getPokemon() {
    const response = await fetch(POKEMON_LIST_URL);
    const data = await response.json();
    allPokemon = data.results;
}

async function loadPokemonDetails(pokemon, index) {
    if (!pokemon.image) {
        let response = await fetch(pokemon.url);
        let data = await response.json();
        let detailedPokemon = createPokemonObject(data, index);
        detailedPokemon.evoChain = await loadPokeChain(data);
        allPokemon[index] = detailedPokemon;
    }
}

async function loadPokemonDetails(pokemon, index) {
    if (!pokemon.image) {
        const response = await fetch(pokemon.url);
        const data = await response.json();
        const detailedPokemon = createPokemonObject(data);
        detailedPokemon.evoChain = await loadPokeChain(data);

        // Alle Properties vom detaillierten Pokémon ins Original kopieren
        for (let key in detailedPokemon) {
            pokemon[key] = detailedPokemon[key];
        }

        // Optional: Array aktualisieren (Index wird beibehalten)
        allPokemon[index] = pokemon;
    }
}

function genrateTemplate(pokemon) {
    return `
        <article onclick="openDialog(${pokemon.id})" class="pokemon-card" data-id="${pokemon.id}">
            <header class="card-header">
                <h2 class="pokemon-name">${pokemon.name}</h2>
                <span class="pokemon-id">#${pokemon.id}</span>
            </header>

            <main class="card-main type-${pokemon.types[0]}">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </main>

            <footer class="card-footer">
                ${generateTypesHTML(pokemon.types)}
            </footer>
        </article>`;
}

function generateDialogTemplate(pokemon) {
    return `
        <header class="dialog-header">
            <button onclick="closeDialog()" class="back-button" aria-label="Close dialog">←</button>
            <h2 class="dialog-pokemon-name">${pokemon.name}</h2>
            <span class="dialog-pokemon-id">${formatedId(pokemon.id - 1)}</span>
        </header>

        <section class="dialog-hero">
            <img src="${pokemon.image}" alt="${pokemon.name}" class="dialog-pokemon-image type-${pokemon.types[0]}">
        </section>

        <nav class="dialog-tabs">
            <button class="tab active" onclick="showTab('about')">About</button>
            <button class="tab" onclick="showTab('stats')">Base Stats</button>
            <button class="tab" onclick="showTab('evolution')">Evolution</button>
        </nav>

        <section class="dialog-tab-content">
            <div class="tab-panel active" id="about">
                ${generateAboutTemplate(pokemon.about)}
            </div>
            <div class="tab-panel" id="stats">
                ${generateStatsHTML(pokemon.stats)}
            </div>
            <div class="tab-panel" id="evolution">
                ${generateEvolutionTemplate(pokemon.evoChain)}
            </div>
        </section>`;
}

async function openDialog(id) {
    const pokemon = allPokemon.find(pokemon => pokemon.id === id);
    if (!pokemon) return;
    pokemonDialog.showModal();
    await loadPokemonDetails(pokemon, id - 1);
    dialogContent(pokemon);
}

function closeDialog() {
    pokemonDialog.close();
}

function dialogContent(pokemon) {
    let dialogContent = document.getElementById('pokemon-dialog');
    dialogContent.innerHTML = generateDialogTemplate(pokemon);
}

pokemonDialog.addEventListener('click', (event) => {
    if (event.target === pokemonDialog) {
        pokemonDialog.close();
    }
});

function formatedId(number) {
    return (number + 1).toString().padStart(3, "0");
}

function createPokemonObject(data) {
    return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map(pokeType => pokeType.type.name),
        abilities: data.abilities.map(pokeAbility => pokeAbility.ability.name),
        stats: data.stats.map(stat => ({
            name: stat.stat.name.toUpperCase(),
            value: stat.base_stat
        })),
        about: {
            height: data.height,
            weight: data.weight,
            experience: data.base_experience,
            abilities: data.abilities.map(pokeAbility => pokeAbility.ability.name)
        },
        evoChain: []
    };
}

function generateTypesHTML(typesArray) {
    return typesArray.map(type => `<span class="type type-${type}">${type}</span>`).join("");
}

function generateAboutTemplate(about) {
    return `
        <p>Height: ${about.height}</p>
        <p>Weight: ${about.weight}</p>
        <p>Base Experience: ${about.experience}</p>
        <p>Abilities: ${about.abilities.join(", ")}</p>
    `;
}

function generateStatsHTML(statsArray) {
    return statsArray.map(stat => statsItemHTML(stat)).join("");
}

function statsItemHTML(stat) {
    return `
        <div class="stat-row">
            <span class="stat-name">${stat.name}</span>
            <span class="stat-value">${stat.value}</span>
        </div>`
}

function generateEvolutionTemplate(evoChain) {
    let html = '';
    for (let name of evoChain) {
        const evoPokemon = loadPokemonChainImg(name);
        if (evoPokemon) {
            html += evolutionItemHTML(evoPokemon);
        }
    }
    return html;
}

function evolutionItemHTML(pokemon) {
    return `
            <div class="evolution-item">
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
            </div>
        `;
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.dialog-tabs .tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));

    document.querySelector(`.tab-panel#${tabId}`).classList.add('active');
    document.querySelector(`.dialog-tabs .tab[onclick="showTab('${tabId}')"]`).classList.add('active');
}

async function loadPokeChain(data) {
    let response = await fetch(data.species.url);
    let pokeSpeciesFetch = await response.json();
    let evoChainFetch = await fetch(pokeSpeciesFetch.evolution_chain.url);
    let evoChain = await evoChainFetch.json();
    return createPokeChain(evoChain);
}

function createPokeChain(evoChain) {
    let chainNames = [];
    let current = evoChain.chain;

    while (current) {
        chainNames.push(current.species.name);
        current = current.evolves_to.length > 0 ? current.evolves_to[0] : null;
    }
    return chainNames;
}

function loadPokemonChainImg(pokemonName) {
    for (let i = 0; i < allPokemon.length; i++) {
        const pokemon = allPokemon[i];
        if (pokemon.name === pokemonName) return pokemon;
    }
}

function showSpinner() {
    document.getElementById("loading-spinner").classList.add("show");
}

function hideSpinner() {
    document.getElementById("loading-spinner").classList.remove("show");
}




