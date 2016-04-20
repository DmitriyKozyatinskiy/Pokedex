import $ from 'jquery';
import Mustache from 'mustache';
import 'typeahead.js';
import './Search.scss';
import Bloodhound from 'bloodhound-js';
import searchTemplate from './Search.html';
import {SEARCH_SETTINGS, SEARCH_URL} from './SearchSettings';
import emptyResultMessage from './EmptyResultMessage.html';

export default class Search {
  /**
   *
   * @param {string} containerId
   * @param {Array} [loadedData=[]]
   */
  constructor(containerId, loadedData = []) {
    this._search = null;
    this._loadedData = loadedData;
    this._container = $(`#${containerId}`);
    this._render().initSearch();
  }

  /**
   *
   * @returns {Search}
   */
  initSearch() {
    this._destroySearch();
    this._search.typeahead(SEARCH_SETTINGS, {
      source: this._getBloodhound(),
      name: 'name',
      display: suggestion => suggestion.name,
      displayKey: suggestion => suggestion.name,
      limit: 25,
      templates: {
        empty: emptyResultMessage,
      },
    });

    return this;
  }

  /**
   *
   * @param {function} callback
   * @returns {Search}
   */
  handleSearchResultSelection(callback) {
    this._search.on('typeahead:select', (event, suggestion) => callback(suggestion));

    return this;
  }

  /**
   *
   * @param {Array} pokemons
   * @returns {Search}
   */
  updateSearch(pokemons) {
    this._loadedData = pokemons;
    this.initSearch();

    return this;
  }

  /**
   * 
   * @returns {Bloodhound}
   * @private
   */
  _getBloodhound() {
    return new Bloodhound({
      local: this._loadedData,
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
    });
  }
  
  /**
   * 
   * @returns {Search}
   * @private
   */
  _destroySearch() {
    this._search.typeahead('destroy');

    return this;
  }

  /**
   *
   * @param {function} callback
   * @returns {Search}
   */
  setSearchOnlineEvent(callback) {
    $(document).on('click', '#js-search-button', () => {
      this._searchRemotely().then(result => {
        callback(result);
      });
    }).on('submit', '#js-search-form', event => {
      event.preventDefault();
      this._searchRemotely().then(result => {
        callback(result);
      });
    });

    return this;
  }
  
  /**
   * 
   * @returns {Promise}
   * @private
   */
  _searchRemotely() {
    const lowerCasedSearchQuery = this._search.val().toLowerCase();

    return new Promise(resolve => {
      $.ajax({
          url: `${SEARCH_URL}${lowerCasedSearchQuery}/`,
          beforeSend: () => this._search.typeahead('close'),
        })
        .done(response => resolve(response))
        .fail(() => resolve());
    });
  }

  /**
   *
   * @returns {Search}
   * @private
   */
  _render() {
    this._search = $(Mustache.render(searchTemplate));
    this._container.append(this._search);
    this._search = this._search.find('#js-search-input');

    return this;
  }
}
