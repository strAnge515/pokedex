// Returns the HTML string for a single pokemon card
function genrateTemplate(pokemon, index) {
    return `
        <article onclick="openDialog(${index})" class="pokemon-card" data-id="${pokemon.id}">
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

// Returns the full HTML string for the pokemon detail dialog
function generateDialogTemplate(pokemon) {
    return `
    <div class="dialog-inner">
        <header class="dialog-header type-${pokemon.types[0]}">
            <button onclick="closeDialog()" class="back-button" aria-label="Close dialog">←</button>
            <h2 class="dialog-pokemon-name">${pokemon.name}</h2>
            <span class="dialog-pokemon-id">#${formatedId(pokemon.id - 1)}</span>
        </header>
        <section class="dialog-hero type-${pokemon.types[0]}">
            <button class="button-left button" onclick="previous()">&#8592;</button>
            <img src="${pokemon.image}" alt="${pokemon.name}" class="dialog-pokemon-image">
            <button class="button-right button" onclick="next()">&#8594;</button>
        </section>
        <section class="dialog-tab-content">
            <nav class="dialog-tabs">
                <button class="tab active" onclick="showTab('about')">About</button>
                <button class="tab" onclick="showTab('stats')">Base Stats</button>
                <button class="tab" onclick="showTab('evolution')">Evolution</button>
            </nav>
            <div class="tab-panel active" id="about">${generateAboutTemplate(pokemon.about)}</div>
            <div class="tab-panel" id="stats">${generateStatsHTML(pokemon.stats)}</div>
            <div class="tab-panel" id="evolution">
                <div class="tab-panel-inner">${generateEvolutionTemplate(pokemon.evoChain)}</div>
            </div>
        </section>
    </div>`;
}

// Returns the HTML for the About tab showing height, weight, experience and abilities
function generateAboutTemplate(about) {
    return `
      <dl class="pokemon-about">
        <div><dt>Height:</dt><dd>${about.height}</dd></div>
        <div><dt>Weight:</dt><dd>${about.weight}</dd></div>
        <div><dt>Base Experience:</dt><dd>${about.experience}</dd></div>
        <div><dt>Abilities:</dt><dd>${about.abilities.map(capitalize).join(", ")}</dd></div>
      </dl>`;
}

// Returns the HTML for a single stat row
function statsItemHTML(stat) {
    return `
        <div class="stat-row">
            <span class="stat-name">${stat.name}</span>
            <span class="stat-value">${stat.value}</span>
        </div>`;
}

// Returns the HTML for a single evolution stage item
function evolutionItemHTML(pokemon) {
    return `
        <div class="evolution-item">
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <p>${capitalize(pokemon.name)}</p>
        </div>`;
}