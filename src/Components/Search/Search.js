import $ from 'jquery';
import Mustache from 'mustache';
import 'typeahead.js';
import './Search.scss';
import Bloodhound from 'bloodhound-js';
import searchTemplate from './Search.html';
import {SEARCH_SETTINGS, SEARCH_URL} from './SearchSettings';
import emptyResultMessage from './EmptyResultMessage.html';

export default class Search {
    constructor(containerId, loadedData = []) {
        this.search = null;
        this.loadedData = loadedData;
        this.container = $('#' + containerId);
        this.render().initSearch();
    }

    render() {
        this.search = $(Mustache.render(searchTemplate));
        this.container.append(this.search);
        this.search = this.search.find('#js-search-input');
        return this;
    }

    initSearch() {
        this.destroySearch();
        this.search.typeahead(SEARCH_SETTINGS, {
            source: this.getBloodhound(),
            name: 'name',
            display: suggestion => suggestion.name,
            displayKey: suggestion => suggestion.name,
            limit: 25,
            templates: {
                empty: emptyResultMessage
            }
        });
        return this;
    }

    getBloodhound() {
        return new Bloodhound({
            local: this.loadedData,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace
            // remote: {
            //     url: 'http://pokeapi.co/api/v2/pokemon/%QUERY/',
            //     wildcard: '%QUERY',
            //     replace: (url, query) => url.replace('%QUERY', query.toLowerCase())
            // }
        });
    }

    handleSearchResultSelection(callback) {
        this.search.on('typeahead:select', (event, suggestion) => callback(suggestion));
    }

    updateSearch(pokemons) {
        this.loadedData = pokemons;
        this.initSearch();
        return this;
    }

    destroySearch() {
        this.search.typeahead('destroy');
        return this;
    }

    searchRemotely() {
        return new Promise(resolve => {
            $.ajax({
                url: SEARCH_URL + this.search.val().toLowerCase() + '/',
                beforeSend: () => this.search.typeahead('close')
            })
                .done(response => resolve(response))
                .fail(() => resolve());
        });
    }

    setSearchOnlineEvent(callback) {
        $(document).on('click', '#js-search-button', () => {
            this.searchRemotely().then(result => {
                callback(result);
            });
        }).on('submit', '#js-search-form', event => {
            event.preventDefault();
            this.searchRemotely().then(result => {
                callback(result);
            });
        });
        return this;
    }
}