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
            <button class="tab active" onclick="showTab('about')">About</button>
            <button class="tab" onclick="showTab('stats')">Base Stats</button>
            <button class="tab" onclick="showTab('evolution')">Evolution</button>
        </nav>

        <!-- TAB CONTENT -->
        <section class="dialog-tab-content">

            <div class="tab-panel active" id="about">
                ${generateAboutTemplate(pokemon.about)}
            </div>

            <div class="tab-panel" id="stats">
                  ${generateStatsHTML(pokemon.stats)}
            </div>

            <div class="tab-panel" id="evolution">
                <!-- Evolution -->
            </div>

        </section>`
}

function openDialog(index) {
    pokemonDialog.showModal();
    const pokemon = allPokemon[index];
    dialogContent(pokemon);
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

   // console.log(data.stats.map(pokeStas => pokeStas.base_stat));//
   // console.log(data.stats.map(pokeStas => pokeStas.stat.name));//
   console.log(data);
   

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
        }
    };
}

function generateTypesHTML(typesArray) {
    return typesArray
        .map(type => `<span class="type type-${type}">${type}</span>`)
        .join("");
}

function generateAboutTemplate(about) {
    return `
            <p>Height: ${about.height}</p>
            <p>Weight: ${about.weight}</p>
            <p>Base Experience: ${about.experience}</p>
            <p>Abilities: ${about.abilities.join(", ")}</p>
    `
}

function generateStatsHTML(statsArray) {
    return statsArray
        .map(stat => `
            <div class="stat-row">
                <span class="stat-name">${stat.name}</span>
                <span class="stat-value">${stat.value}</span>
            </div>
        `)
        .join("");
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.dialog-tabs .tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));

    document.querySelector(`.tab-panel#${tabId}`).classList.add('active');
    document.querySelector(`.dialog-tabs .tab[onclick="showTab('${tabId}')"]`).classList.add('active');
}


