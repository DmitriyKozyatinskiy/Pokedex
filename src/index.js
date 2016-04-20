import $ from 'jquery';
import _ from 'lodash/array'
import NProgress from 'nprogress-npm';
import '../node_modules/nprogress-npm/nprogress.css';
import enquire from '../node_modules/enquire.js/dist/enquire.js';
import randomColor from 'randomcolor';
import Card from './Components/Card/Card';
import Search from './Components/Search/Search';
import Filter from './Components/Filter/Filter';
import {POKEMONS_URL, ALL_TYPES_URL, MEDIA_QUERIES} from './settings';

/**
 *
 * @type {Object}
 */
let typeColors = {};

/**
 *
 * @type {Array}
 */
const currentCards = [];

/**
 *
 * @type {Array}
 */
const currentlyShowedPokemons = [];

/**
 *
 * @type {jQuery|HTMLElement}
 */
const $loadMoreButton = $('#js-load-more-button');

/**
 *
 * @returns {Promise}
 */
function getAllPossibleTypes() {
  return new Promise(resolve => {
    $.get(ALL_TYPES_URL, response => resolve(response.objects));
  });
}

/**
 *
 * @param {Array} types
 * @returns {Object}
 */
function getTypeColors(types) {
  const typesObj = {};

  types.forEach(type => {
    typesObj[type.name.toLowerCase()] = randomColor({
      luminosity: 'dark'
    });
  });

  return typesObj;
}

/**
 *
 * @param {number} [offset=0]
 * @returns {Promise}
 */
function loadPokemons(offset = 0) {
  return new Promise(resolve => {
    $.ajax({
        url: POKEMONS_URL + offset,
        beforeSend: () => $loadMoreButton.attr('disabled', true),
      })
      .done(response => resolve(response.objects))
      .always(() => $loadMoreButton.removeAttr('disabled'));
  });
}

/**
 *
 * @param {Object} pokemon
 * @returns {Card}
 */
function setCard(pokemon) {
  pokemon = setTypeColors(pokemon);
  const pokeCard = new Card('js-pokemons-list', pokemon, {isExtended: false});
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

  return pokeCard;
}

/**
 *
 * @param {Array} pokemons
 */
function setCards(pokemons) {
  pokemons.forEach((pokemon, i) => {
    const isAlreadyShown = currentlyShowedPokemons
      .find(existingPokemon => existingPokemon.pkdx_id === pokemon.pkdx_id);

    if (isAlreadyShown) {
      return;
    }

    let pokeCard = setCard(pokemon);

    if (i === 0) {
      pokeCard.scrollToCard();
    }
  });
}

/**
 *
 * @param {Search} search
 * @param {Filter} filter
 */
function updateSearchPanel(search, filter) {
  search.updateSearch(currentlyShowedPokemons);
  const existingTypes = getExistingTypes(currentlyShowedPokemons);
  filter.updateFilter(existingTypes);
}

/**
 *
 * @param {Object} [pokemon]
 * @returns {Card|null}
 */
function createExtendedCard(pokemon) {
  return pokemon ? new Card('js-pokemons-info', pokemon, { isExtended: true })
    .showDetails().setSticky() : null;
}

/**
 *
 * @param {Array} currentPokemons
 * @returns {Array}
 */
function getExistingTypes(currentPokemons) {
  const types = _.flatten(currentPokemons.map(pokemon => {
    return pokemon.types;
  }));

  return _.uniqBy(types, 'name');
}

/**
 *
 * @param {Object} pokemon
 * @returns {Object}
 */
function setTypeColors(pokemon) {
  pokemon.types.forEach((type, i) => {
    pokemon.types[i].color = typeColors[type.name.toLowerCase()];
  });

  return pokemon;
}

$(() => {
  $('body').show();

  let search = null;
  let filter = null;

  getAllPossibleTypes().then(types => {
    typeColors = getTypeColors(types);
    loadPokemons().then(pokemons => {
      setCards(pokemons);
      search = new Search('js-header', currentlyShowedPokemons);
      search
        .setSearchOnlineEvent(searchResult => {
          enquire.register(MEDIA_QUERIES.xs, {
            match: () => {
              setCard(searchResult).scrollToCard();
              updateSearchPanel(search, filter);
            }
          }).register(MEDIA_QUERIES.sm, {
            match: () => {
              searchResult = setTypeColors(searchResult);
              createExtendedCard(searchResult);
            }
          });
        })
        .handleSearchResultSelection(searchResult => {
          enquire.register(MEDIA_QUERIES.xs, {
            match: () => {
              const existingCard = currentCards
                .find(card => card.data.pkdx_id === searchResult.pkdx_id);
              existingCard.scrollToCard();
            }
          }).register(MEDIA_QUERIES.sm, {
            match: () => {
              createExtendedCard(searchResult);
            }
          });
        });

      const existingTypes = getExistingTypes(currentlyShowedPokemons);
      filter = new Filter('js-header', existingTypes);
      filter.setFilterAction((typeToFilter, isShowAction) => {
        currentCards.forEach(card => {
          const types = card.data.types.map(type => type.name).join(' ');

          if (types.includes(typeToFilter)) {
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
        updateSearchPanel(search, filter);
      });
    });
});
