import $ from 'jquery';
import _ from 'lodash/array'
import NProgress from 'nprogress-npm';
import '../node_modules/nprogress-npm/nprogress.css';
import enquire from '../node_modules/enquire.js/dist/enquire.js';
import randomColor from 'randomcolor';
import Card from './Components/Card/Card';
import Search from './Components/Search/Search';
import Filter from './Components/Filter/Filter';
import {POKEMONS_URL, MEDIA_QUERIES} from './settings';


let typeColors = {};
let currentCards = [];
let currentlyShowedPokemons = [];
let $loadMoreButton = null;

function getAllPossibleType() {
    return new Promise(resolve => {
        $.get('http://pokeapi.co/api/v1/type/?limit=999', response => resolve(response.objects));
    });
}

function getTypeColors(types) {
    let typesObj = {};

    types.forEach(type => {
        typesObj[type.name.toLowerCase()] = randomColor({
            luminosity: 'dark'
        });
    });

    return typesObj;
}

function loadPokemons(offset = 0) {
    return new Promise(resolve => {
        $.ajax({
                url: POKEMONS_URL + offset,
                beforeSend: () => $loadMoreButton.attr('disabled', true)
            })
            .done(response => resolve(response.objects))
            .always(() => $loadMoreButton.removeAttr('disabled'));
    });
}

function setCards(pokemons) {
    pokemons.forEach((pokemon, i) => {
        pokemon = setTypeColors(pokemon);
        let pokeCard = new Card('js-pokemons-list', pokemon, false, typeColors);
        currentCards.push(pokeCard);
        
        currentlyShowedPokemons.push(pokemon);
        pokeCard.setOnClickEvent(() => {
            enquire.register(MEDIA_QUERIES.xs, {
                match: () => {
                    pokeCard.toggleDetails();
                }
            }).register(MEDIA_QUERIES.sm, {
                match: () => {
                    createExtendedCard(pokemon);
                }
            });
        });

        if (i == 0) {
            pokeCard.scrollToCard();
        }
    });
}

function createExtendedCard(pokemon) {
    return pokemon ? new Card('js-pokemons-info', pokemon, true, typeColors).showDetails().setSticky() : '';
}

function getExistingTypes(currentPokemons) {
    let types = _.flatten(currentPokemons.map(pokemon => {
        return pokemon.types;
    }));
    return _.uniqBy(types, 'name');
}

function setTypeColors(pokemon) {
    pokemon.types.forEach((type, i) => {
        pokemon.types[i].color = typeColors[type.name.toLowerCase()];
    });
    return pokemon;
}

$(() => {
    let search = null;
    let filter = null;
    $loadMoreButton = $('#js-load-more-button');

    getAllPossibleType().then(types => {
        typeColors = getTypeColors(types);
        loadPokemons().then(pokemons => {
            setCards(pokemons);
            search = new Search('js-header', currentlyShowedPokemons);
            search
                .setSearchOnlineEvent(searchResult => createExtendedCard(searchResult))
                .handleSearchResultSelection(searchResult => createExtendedCard(searchResult));
            let existingTypes = getExistingTypes(currentlyShowedPokemons);
            filter = new Filter('js-header', existingTypes);
            filter.setFilterAction((typeToFilter, isShowAction) => {
                currentCards.forEach((card) => {
                    let types = card.pokeData.types.map(type => type.name).join(' ');
                    if (types.includes(typeToFilter) ) {
                        if (isShowAction) {
                            card.showCard();
                        } else {
                            card.hideCard();
                        }
                    }
                });
            });

            $('#js-progress-bar').hide();
            $loadMoreButton.removeClass('hidden-xs-up');
        });
    });

    $(document)
        .ajaxSend(() => NProgress.start())
        .ajaxComplete(() => NProgress.done())
        .on('click', '#js-load-more-button', () => {
            loadPokemons(currentlyShowedPokemons.length).then(pokemons => {
                setCards(pokemons);
                search.updateSearch(currentlyShowedPokemons);
                let existingTypes = getExistingTypes(currentlyShowedPokemons);
                filter.updateFilter(existingTypes);
            });
        });
});
