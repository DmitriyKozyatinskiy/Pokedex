import $ from 'jquery';
import Mustache from 'mustache';
import filterTemplate from './Filter.html';
import typeLabelsTemplate from './TypeLabels.html';
import './Filter.scss';

export default class Filter {
  /**
   *
   * @param {string} filterContainerId
   * @param {Array} [existingTypes=[]]
   */
  constructor(filterContainerId, existingTypes = []) {
    this._filter = null;
    this._filterContainer = $(`#${filterContainerId}`);
    this._existingTypes = existingTypes;
    this._render();
  }

  /**
   *
   * @param {function} callback
   * @returns {Filter}
   */
  setFilterAction(callback) {
    $(document).on('click', '.js-filter-label', function () {
      const $label = $(this);
      const type = $label.attr('data-type').trim();
      const isShowAction = $label.hasClass('TypeLabel--Crossed');

      $label.toggleClass('TypeLabel--Crossed');
      callback(type, isShowAction);
    });
    this._filter.on('hidden.bs.collapse', () => this.removeFilters());

    return this;
  }

  /**
   *
   * @param {Array} existingTypes
   * @returns {Filter}
   */
  updateFilter(existingTypes) {
    this._existingTypes = existingTypes;
    const $labels = $(Mustache.render(typeLabelsTemplate, {types: this._existingTypes}));
    $('#js-types-container').html($labels);
    this.removeFilters();

    return this;
  }

  /**
   *
   * @returns {Filter}
   */
  removeFilters() {
    $('.js-filter-label', this._filterContainer).each(function () {
      const $label = $(this);
      const isFiltered = $label.hasClass('TypeLabel--Crossed');

      if (isFiltered) {
        $label.trigger('click');
      }
    });

    return this;
  }

  /**
   * 
   * @returns {Filter}
   * @private
   */
  _render() {
    this._filter = $(Mustache.render(filterTemplate, {types: this._existingTypes}, {
      types: typeLabelsTemplate
    }));
    this._filterContainer.append(this._filter);

    return this;
  }
}
