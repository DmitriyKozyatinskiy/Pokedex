import $ from 'jquery';
import Mustache from 'mustache';
import filterTemplate from './Filter.html';
import typeLabelsTemplate from './TypeLabels.html';
import './Filter.scss';

export default class Filter {
    constructor(filterContainerId, existingTypes = []) {
        this.filter = null;
        this.filterContainer = $('#' + filterContainerId);
        this.existingTypes = existingTypes;
        this.render();
    }

    setFilterAction(callback) {
        $(document).on('click', '.js-filter-label', function () {
            let $label = $(this);
            let type = $label.attr('data-type').trim();
            let isShowAction = $label.hasClass('TypeLabel--Crossed');
            $label.toggleClass('TypeLabel--Crossed');
            callback(type, isShowAction);
        });
        this.filter.on('hidden.bs.collapse', () => this.removeFilters());
    }

    updateFilter(existingTypes) {
        this.existingTypes = existingTypes;
        let $labels = $(Mustache.render(typeLabelsTemplate, {types: this.existingTypes}));
        $('#js-types-container').html($labels);
        this.removeFilters();
    }

    removeFilters() {
        $('.js-filter-label', this.filterContainer).each(function () {
            let $label = $(this);
            let isFiltered = $label.hasClass('TypeLabel--Crossed');
            if (isFiltered) {
                $label.trigger('click');
            }
        });
    }

    render() {
        this.filter = $(Mustache.render(filterTemplate, {types: this.existingTypes}, {
            types: typeLabelsTemplate
        }));
        this.filterContainer.append(this.filter);
        //this.filter = this.search.find('#js-search-input');
        return this;
    }
}