require('jquery.cookie');

/**
 * @param scope
 * @param element
 * @param $timeout
 * @param spCF
 * @param tableSelector
 */
module.exports = function (scope, element, $timeout, spCF, tableSelector) {
    // Process select checkbox
    $(element).find(tableSelector).on('click', 'tr td.select-checkbox', function (event) {
        let checkBox = $(event.target).parents('tr').find('td.select-checkbox .checkbox-label');
        let id = $(event.target).parents('tr').find('td.col-id').text();
        id = typeof id != 'undefined' && id.length > 0 ? id : false;

        if (id) {
            scope.$apply(() => {
                if (checkBox.hasClass('active')) {
                    if (scope.selectedItem.indexOf(id) > -1) {
                        scope.selectedItem.splice(scope.selectedItem.indexOf(id), 1);
                        checkBox.removeClass('active');
                    }
                } else {
                    scope.selectedItem.push(id);
                    checkBox.addClass('active');
                }

                let rowOnPage = $(element).find(tableSelector + ' tr td.select-checkbox .checkbox-label').length;
                if (scope.selectedItem.length >= rowOnPage) {
                    $(element).find(tableSelector + ' tr th.select-checkbox .checkbox-label').addClass('active');
                } else {
                    $(element).find(tableSelector + ' tr th.select-checkbox .checkbox-label').removeClass('active');
                }

                let newItems = [];
                let existingIds = [];
                $(element).find(tableSelector + ' tr td.col-id').each(function (key, el) {
                    if (scope.selectedItem.indexOf($(el).text()) > -1) {
                        existingIds.push($(el).text());
                    }
                });
                scope.selectedItem.forEach(function (el) {
                    if (existingIds.indexOf(el) > -1) {
                        newItems.push(el);
                    }
                });
                scope.selectedItem = newItems;
            });
        }
    });

    // Process select all
    $(element).find(tableSelector).on('click', 'tr th.select-checkbox', function (event) {
        scope.$apply(() => {
            if ($(this).find('label').hasClass('active')) {
                $(element).find(tableSelector).find('tr .select-checkbox .checkbox-label').removeClass('active');
                $(this).parents().find('label').removeClass('active');
                scope.selectedItem = [];
            } else {
                $(this).find('label').addClass('active');
                $(element).find(tableSelector).find('tr .select-checkbox .checkbox-label').addClass('active');
                let idsOnPage = [];
                $(element).find(tableSelector + ' tr td.col-id').each(function (key, el) {
                    idsOnPage.push($(el).text());
                });
                scope.selectedItem = idsOnPage;
            }
        });
    });

    $(element).find(tableSelector).on('length.dt', function (e, settings, len) {
        scope.$apply(() => {
            $(element).find(tableSelector).find('tr .select-checkbox .checkbox-label').removeClass('active');
            $(this).parents().find('label').removeClass('active');
            scope.selectedItem = [];
        });
    });

    // Process table row click
    $(element).find(tableSelector).on('dblclick', 'tr td:not(.select-checkbox)', function (event) {
        let rowId = $(event.target).parents('tr').find('.col-id').text();
        if (typeof rowId == 'string' && rowId.length > 0) {
            if (typeof scope.oneItemUrl == 'string') {
                window.location = scope.oneItemUrl + '/' + rowId;
            } else {
                if (spCF.isArray(scope.selectedItem)) {
                    if (scope.selectedItem.indexOf(rowId) > -1) {
                        delete scope.selectedItem[scope.selectedItem.indexOf(rowId)];
                    } else {
                        scope.selectedItem.push(rowId);
                    }
                } else {
                    scope.selectedItem = [rowId];
                }
            }
        }
    });

    $(element).find(tableSelector).on('draw.dt', function (event, settings) {
        $timeout(function () {
            scope.selectedItem = [];
        });

        // Save table state in cookie
        if (!$(event.target).hasClass('initiated')) {
            scope.initTable(event.target);
        } else {
            let requestSettings = settings.oAjaxData || {};
            requestSettings['orderColumn'] = undefined;
            requestSettings['orderDir'] = undefined;
            if (spCF.isObject(requestSettings.order) && spCF.isObject(requestSettings.order[0])) {
                requestSettings['orderColumn'] =
                    spCF.isNumber(requestSettings.order[0]['column']) ? requestSettings.order[0]['column'] : undefined;
                requestSettings['orderDir'] =
                    spCF.isString(requestSettings.order[0]['dir']) ? requestSettings.order[0]['dir'] : undefined;
            }

            requestSettings['searchValue'] = spCF.isObject(requestSettings.search) && spCF.isString(requestSettings.search.value) ?
                requestSettings.search.value : undefined;

            let tableState = {
                'search': requestSettings['searchValue'],
                'sort': requestSettings['orderColumn'],
                'dir': requestSettings['orderDir'],
                'size': requestSettings['length'],
                'from': requestSettings['start']
            };

            $.cookie(scope.tableStateCookieName, JSON.stringify(tableState), {expires: 365, path: '/'});
        }

        scope.updateColumnsVisibility(scope.tableId, scope.availableFields, (spCF.isArray(scope.selectedFields) ? scope.selectedFields : []));
    });
};