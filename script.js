let allPokemon = [];
let currentPokemonIndex = 0;
let startIndex = 0;
let filteredPokemonArr = [];
const BATCH_SIZE = 20;
const MAX_POKEMON = 151;
const pokemonDialog = document.getElementById('pokemon-dialog');
const content = document.getElementById("content");

// Initializes the app: fetches all pokemon names, renders the first batch
async function init() {
    showSpinner();
    await fetchAllNames();
    await renderPokemon();
    hideSpinner();
}

// Fetches all pokemon names from the API and stores them in allPokemon
async function fetchAllNames() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}&offset=0`;
    const response = await fetch(url);
    const data = await response.json();
    allPokemon = data.results;
}

// Decides whether to render filtered results or the next batch
async function renderPokemon() {
    showSpinner();
    if (filteredPokemonArr.length) {
        await renderFiltered(filteredPokemonArr);
    } else {
        await renderBatch();
    }
    hideSpinner();
}

// Fetches and renders the next 20 pokemon using limit/offset, updates the load-more button
async function renderBatch() {
    const end = Math.min(startIndex + BATCH_SIZE, MAX_POKEMON);
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${end - startIndex}&offset=${startIndex}`;
    const response = await fetch(url);
    const data = await response.json();
    await appendPokemonCards(data.results, startIndex);
    startIndex = end;
    document.getElementById("load-more").style.display =
        startIndex >= MAX_POKEMON ? "none" : "block";
}

// Loads details for each pokemon in a batch and appends their cards to the grid
async function appendPokemonCards(batch, offsetIndex) {
    for (let i = 0; i < batch.length; i++) {
        const globalIndex = offsetIndex + i;
        const pokemon = allPokemon[globalIndex];
        await loadPokemonDetails(pokemon, globalIndex);
        content.innerHTML += genrateTemplate(pokemon, globalIndex);
    }
}

// Clears the grid and renders only the pokemon matching the current search
async function renderFiltered(array) {
    content.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const globalIndex = allPokemon.findIndex((pokemon) => pokemon.name === array[i].name);
        await loadPokemonDetails(array[i], globalIndex);
        content.innerHTML += genrateTemplate(array[i], globalIndex);
    }
    document.getElementById("load-more").style.display = "none";
}

// Reads the search input, filters allPokemon by name and triggers a re-render
function searchPokemon() {
    const searchInput = document.getElementById("search-input");
    const text = searchInput.value.toLowerCase().trim();
    if (text.length >= 3) {
        filteredPokemonArr = allPokemon.filter((pokemon) => pokemon.name.includes(text));
        if (filteredPokemonArr.length === 0) {
            handleNoMatch();
        } else {
            renderPokemon();
        }
    } else {
        reset()
    }
    searchInput.value = "";
}

// set filter, startindex and arr back to 0
function reset() {
    filteredPokemonArr = [];
    content.innerHTML = "";
    startIndex = 0;
    renderPokemon();
}

// Function for no matches in search
function handleNoMatch() {
    content.innerHTML = "<p>No match found</p>";
    document.getElementById("load-more").style.display = "none";
}

// Fetches full details for a pokemon if not already loaded, enriches the allPokemon entry
async function loadPokemonDetails(pokemon, index) {
    if (!pokemon.image) {
        const response = await fetch(pokemon.url);
        const data = await response.json();
        const detailedPokemon = createPokemonObject(data);
        detailedPokemon.evoChain = await loadPokeChain(data);
        for (let key in detailedPokemon) {
            pokemon[key] = detailedPokemon[key];
        }
        allPokemon[index] = pokemon;
        for (let i = 0; i < detailedPokemon.evoChain.length; i++) {
            const name = detailedPokemon.evoChain[i];
            const evoIndex = allPokemon.findIndex((element) => element.name === name);
            if (evoIndex !== -1) {
                const evoPokemon = allPokemon[evoIndex];
                await loadPokemonDetails(evoPokemon, evoIndex);
            }
        }
    }
}

// Loads pokemon details if needed, then opens and populates the dialog
async function openDialog(index) {
    currentPokemonIndex = index;
    const pokemon = allPokemon[index];
    if (!pokemon) return;
    await loadPokemonDetails(pokemon, index);
    pokemonDialog.showModal();
    dialogContent(pokemon);
    document.body.style.overflow = "hidden";
}

// Closes the pokemon detail dialog
function closeDialog() {
    pokemonDialog.close();
     document.body.style.overflow = "";
}

// Injects the dialog HTML for the given pokemon into the dialog element
function dialogContent(pokemon) {
    pokemonDialog.innerHTML = generateDialogTemplate(pokemon);
}

// Closes the dialog when clicking on the backdrop
pokemonDialog.addEventListener('click', (event) => {
    if (event.target === pokemonDialog) closeDialog();
   });

// Formats a zero-based index into a zero-padded 3-digit ID string
function formatedId(number) {
    return (number + 1).toString().padStart(3, "0");
}

// Maps raw API data into a clean, structured pokemon object
function createPokemonObject(data) {
    return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((pokeType) => pokeType.type.name),
        abilities: data.abilities.map((ability) => ability.ability.name),
        stats: data.stats.map((stat) => ({
            name: stat.stat.name.toUpperCase(),
            value: stat.base_stat
        })),
        about: {
            height: data.height,
            weight: data.weight,
            experience: data.base_experience,
            abilities: data.abilities.map((ability) => ability.ability.name)
        },
        evoChain: []
    };
}

// Capitalizes the first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Returns HTML badge spans for each pokemon type
function generateTypesHTML(typesArray) {
    return typesArray.map((type) => `<span class="type type-${type}">${type}</span>`).join("");
}

// Returns the HTML for all stat rows
function generateStatsHTML(statsArray) {
    return statsArray.map((stat) => statsItemHTML(stat)).join("");
}

// Returns the HTML for the full evolution chain section
function generateEvolutionTemplate(evoChain) {
    let html = '';
    for (let name of evoChain) {
        const evoPokemon = loadPokemonChainImg(name);
        if (evoPokemon) html += evolutionItemHTML(evoPokemon);
    }
    return html;
}

// Activates the clicked tab and hides all others
function showTab(tabId) {
    document.querySelectorAll('.dialog-tabs .tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    document.querySelector(`.tab-panel#${tabId}`).classList.add('active');
    document.querySelector(`.dialog-tabs .tab[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Fetches the species and evolution chain data for a pokemon from the API
async function loadPokeChain(data) {
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    return createPokeChain(evoData);
}

// Walks the evolution chain and returns an ordered array of species names
function createPokeChain(evoChain) {
    let chainNames = [];
    let current = evoChain.chain;
    while (current) {
        chainNames.push(current.species.name);
        current = current.evolves_to.length > 0 ? current.evolves_to[0] : null;
    }
    return chainNames;
}

// Finds and returns a pokemon from allPokemon by its name
function loadPokemonChainImg(pokemonName) {
    return allPokemon.find((pokemon) => pokemon.name === pokemonName);
}

// Shows the loading spinner
function showSpinner() {
    document.getElementById("loading-spinner").classList.add("show");
}

// Hides the loading spinner
function hideSpinner() {
    document.getElementById("loading-spinner").classList.remove("show");
}

// Navigates to the next pokemon in the active array and opens its dialog
function next() {
    const activeArray = filteredPokemonArr.length ? filteredPokemonArr : allPokemon;
    if (currentPokemonIndex < activeArray.length - 1) {
        currentPokemonIndex++;
        openDialog(currentPokemonIndex);
    }
}

// Navigates to the previous pokemon and opens its dialog
function previous() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        openDialog(currentPokemonIndex);
    }
}
// Eventlistener for form tag
document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    searchPokemon();
});