import $ from 'jquery';
import Mustache from 'mustache';
import 'jquery-sticky';
import cardTemplate from './Card.html';
import detailsTemplate from './DetailsTable.html';
import {SCROLL_TO_CARD_DURATION} from './CardSettings';
import './Card.scss';

export default class Card {
  /**
   *
   * @param {string} containerId
   * @param {Object} pokemonData
   * @param {boolean} [isExtended = false]
   */
  constructor(containerId, pokemonData, {isExtended = false} = {}) {
    this._data = pokemonData;
    this._data.totalMoves = this._data.moves.length;
    this._container = $(`#${containerId}`);
    this._card = null;
    this._isExtended = isExtended;
    this._isVisible = true;
    this._render();
  }

  /**
   *
   * @returns {Object}
   */
  get data() {
    return this._data;
  }

  /**
   *
   * @returns {boolean}
   */
  get isVisible() {
    return this._isVisible;
  }

  /**
   *
   * @returns {Object}
   */
  get card() {
    return this._card;
  }

  /**
   *
   * @param {function} callback
   * @returns {Card}
   */
  setOnClickEvent(callback) {
    this._card
      .on('click', callback)
      .find('.js-details-table')
      .on('click', event => event.stopImmediatePropagation());

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  showDetails() {
    this._card.find('.js-details-table').removeClass('hidden-xs-up');

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  toggleDetails() {
    this._card.find('.js-details-table').toggleClass('hidden-xs-up');

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  scrollToCard() {
    $('body').animate({
      scrollTop: this._card.offset().top
    }, SCROLL_TO_CARD_DURATION);

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  setSticky() {
    console.log(this._card);
    this._card.sticky({topSpacing: 1}).sticky('update');
    console.log(this._card);
    console.log(this._card.parent());
    console.log(this._card.parent().offset());
    return this;
  }

  /**
   *
   * @returns {Card}
   */
  toggleCard() {
    this._card.toggle();

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  hideCard() {
    this._card.hide();
    this._isVisible = false;

    return this;
  }

  /**
   *
   * @returns {Card}
   */
  showCard() {
    this._card.show();
    this._isVisible = true;

    return this;
  }

  /**
   *
   * @returns {Card}
   * @private
   */
  _render() {
    this._card = $(Mustache.render(cardTemplate, this._data, {
      details: detailsTemplate
    }));

    if (this._isExtended) {
      this._container.html(this._card);
    } else {
      this._container.append(this._card);
    }

    return this;
  }
}
