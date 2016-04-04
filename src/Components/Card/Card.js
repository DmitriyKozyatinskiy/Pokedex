import $ from 'jquery';
import Mustache from 'mustache';
import 'jquery-sticky';
import cardTemplate from './Card.html';
import detailsTemplate from './DetailsTable.html';
import './Card.scss';

export default class Card {
    constructor(containerId, pokemonData, isExtended = false) {
        this.data = pokemonData;
        this.data.totalMoves = this.data.moves.length;
        this.container = $('#' + containerId);
        this.card = null;
        this.isExtended = isExtended;
        this.isVisible = true;
        this.render();
    }

    get pokeData () {
        return this.data;
    }
    
    get visible () {
        return this.isVisible;
    }

    get cardObject () {
        return this.card;
    }

    setOnClickEvent(callback) {
        this.card
            .on('click', callback)
            .find('.js-details-table')
            .on('click', event => event.stopImmediatePropagation());
        return this;
    }

    showDetails() {
        this.card.find('.js-details-table').removeClass('hidden-xs-up');
        return this;
    }

    toggleDetails() {
        this.card.find('.js-details-table').toggleClass('hidden-xs-up');
        return this;
    }

    scrollToCard() {
        $('body').animate({
            scrollTop: this.card.offset().top
        }, 1000);
        return this;
    }

    setSticky() {
        this.card.sticky({topSpacing: 1}).sticky('update');
        return this;
    }

    render() {
        let $parentContainer = this.container;

        this.card = $(Mustache.render(cardTemplate, this.data, {
            details: detailsTemplate
        }));

        if (this.isExtended) {
            $parentContainer.html(this.card);
        } else {
            $parentContainer.append(this.card);
        }
        return this;
    }

    toggleCard() {
        this.card.toggle();
    }
    
    hideCard() {
        this.card.hide();
        this.isVisible = false;
    }

    showCard() {
        this.card.show();
        this.isVisible = true;
    }
}