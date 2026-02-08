let allPokemon = [];
let startIndex = 0;

const pokemonDialog = document.getElementById('pokemon-dialog');
const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0";


async function init() {
    showSpinner();
    const response = await fetch(POKEMON_LIST_URL);
    const data = await response.json();
    allPokemon = data.results; 
    await loadNextBatch();
    hideSpinner();
}

async function loadPokemonDetailsIfNeeded(pokemon, index) {
    if (!pokemon.image) {
        let response = await fetch(pokemon.url);
        let data = await response.json();
        let detailedPokemon = createPokemonObject(data, index);
        detailedPokemon.evoChain = await loadPokeChain(data);
        allPokemon[index] = detailedPokemon;
    }
}

async function loadNextBatch() {
    showSpinner();
    const content = document.getElementById("content");
    const batchSize = 20;
    let endIndex = Math.min(startIndex + batchSize, allPokemon.length);
    for (let i = startIndex; i < endIndex; i++) {
        await loadPokemonDetailsIfNeeded(allPokemon[i], i);
        content.innerHTML += genrateTemplate(i);
    }
    startIndex = endIndex;

    if (startIndex >= allPokemon.length) {
        document.getElementById("load-more").style.display = "none";
    }
    hideSpinner();
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

            <footer class="card-footer">
                ${generateTypesHTML(allPokemon[i].types)}
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

async function openDialog(index) {
    pokemonDialog.showModal();
    await loadPokemonDetailsIfNeeded(allPokemon[index], index);
    const pokemon = allPokemon[index];
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

function createPokemonObject(data, index) {
    return {
        id: index + 1,
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
    return evoChain.map(name => {
        const evoPokemon = loadPokemonChainImg(name);

        if (!evoPokemon) {
            return '';
        } else {
            return evolutionItemHTML(evoPokemon);
        }
    }).join('');
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


