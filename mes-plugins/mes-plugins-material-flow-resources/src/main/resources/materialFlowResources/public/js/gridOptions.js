/*
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function ($, h, c) {
    var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow";
    e[b] = 250;
    e[f] = true;
    $.event.special[j] = {setup: function () {
            if (!e[f] && this[k]) {
                return false
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {w: l.width(), h: l.height()});
            if (a.length === 1) {
                g()
            }
        }, teardown: function () {
            if (!e[f] && this[k]) {
                return false
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
                clearTimeout(i)
            }
        }, add: function (l) {
            if (!e[f] && this[k]) {
                return false
            }
            var n;
            function m(s, o, p) {
                var q = $(this), r = $.data(this, d);
                r.w = o !== c ? o : q.width();
                r.h = p !== c ? p : q.height();
                n.apply(this, arguments)
            }
            if ($.isFunction(l)) {
                n = l;
                return m
            } else {
                n = l.handler;
                l.handler = m
            }
        }};
    function g() {
        i = h[k](function () {
            a.each(function () {
                var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d);
                if (m !== o.w || l !== o.h) {
                    n.trigger(j, [o.w = m, o.h = l])
                }
            });
            g()
        }, e[b])
    }}
)(jQuery, this);

var myApp = angular.module('gridApp', []);

myApp.directive('ngJqGrid', function ($window) {
    return {
        restrict: 'E',
        scope: {
            config: '=',
            data: '=',
        },
        link: function (scope, element, attrs) {
            var table;

            scope.$watch('config', function (newValue) {
                if (newValue) {
                    element.children().empty();
                    table = angular.element('<table id="grid"></table>');
                    element.append(table);
                    element.append(angular.element('<div id="jqGridPager"></div>'));
                    $(table).jqGrid(newValue);

                    var positionsHeader = QCD.translate('qcadooView.gridHeader.positions');
                    var newHeader = QCD.translate('qcadooView.gridHeader.new');
                    var addNewRowButton = '<div id="add_new_row" class="headerActionButton" onclick="return addNewRow();"> <a href="#"><span>' +
                            '<div id="add_new_icon""></div>' +
                            '<div class="hasIcon">' + newHeader + '</div></div>';
                    $(addNewRowButton).bind('click', scope.addNewRow);

                    var gridTitle = '<div class="gridTitle">' + positionsHeader + '</div>';

                    $('#t_grid').append(gridTitle);
                    $('#t_grid').append(addNewRowButton);

                    $(table).jqGrid('filterToolbar');

                    $(table).navGrid('#jqGridPager',
                            // the buttons to appear on the toolbar of the grid
                                    {edit: true, add: true, del: true, search: false, refresh: false, view: false, position: "left", cloneToTop: false},
                            // options for the Edit Dialog
                            {
                                ajaxEditOptions: {contentType: "application/json"},
                                mtype: 'PUT',
                                closeAfterEdit: true,
                                resize: false,
                                serializeEditData: function (data) {
                                    delete data.oper;
                                    return JSON.stringify(data);
                                },
                                onclickSubmit: function (params, postdata) {
                                    params.url = '../../integration/rest/documentPositions/' + postdata.grid_id + ".html";
                                },
                                errorTextFormat: function (response) {
                                    return translateMessages(JSON.parse(response.responseText).message);
                                },
                                beforeShowForm: function (form) {
                                    var dlgDiv = $("#editmodgrid");
                                    var dlgWidth = 586;
                                    var dlgHeight = dlgDiv.height();
                                    var parentWidth = $(window).width();
                                    var parentHeight = $(window).height();
                                    dlgDiv[0].style.left = Math.round((parentWidth - dlgWidth) / 2) + "px";
                                    dlgDiv[0].style.top = Math.round((parentHeight - dlgHeight) / 2) + "px";
                                    dlgDiv[0].style.width = dlgWidth + "px";
                                }
                            },
                            // options for the Add Dialog
                            {
                                ajaxEditOptions: {contentType: "application/json"},
                                mtype: "PUT",
                                closeAfterEdit: true,
                                resize: false,
                                reloadAfterSubmit: true,
                                serializeEditData: function (data) {
                                    delete data.oper;
                                    delete data.id;
                                    return JSON.stringify(data);
                                },
                                onclickSubmit: function (params, postdata) {
                                    params.url = '../../integration/rest/documentPositions.html';
                                },
                                errorTextFormat: function (response) {
                                    return translateMessages(JSON.parse(response.responseText).message);
                                },
                                beforeShowForm: function (form) {
                                    var dlgDiv = $("#editmodgrid");
                                    var dlgWidth = 586;
                                    var dlgHeight = dlgDiv.height();
                                    var parentWidth = $(window).width();
                                    var parentHeight = $(window).height();
                                    dlgDiv[0].style.left = Math.round((parentWidth - dlgWidth) / 2) + "px";
                                    dlgDiv[0].style.top = Math.round((parentHeight - dlgHeight) / 2) + "px";
                                    dlgDiv[0].style.width = dlgWidth + "px";
                                }
                            },
                            // options for the Delete Dailog
                            {
                                mtype: "DELETE",
                                serializeDelData: function () {
                                    return ""; // don't send and body for the HTTP DELETE
                                },
                                onclickSubmit: function (params, postdata) {
                                    params.url = '../../integration/rest/documentPositions/' + encodeURIComponent(postdata) + ".html";
                                },
                                errorTextFormat: function (response) {
                                    return translateMessages(JSON.parse(response.responseText).message);
                                }
                            });
                        }
            });

            scope.$watch('data', function (newValue, oldValue) {
                var i;
                for (i = oldValue.length - 1; i >= 0; i--) {
                    $(table).jqGrid('delRowData', i);
                }
                for (i = 0; i < newValue.length; i++) {
                    $(table).jqGrid('addRowData', i, newValue[i]);
                }
            });
        }
    };
});

function translateMessages(messages) {
    var message = [];
    if (messages) {
        var messageArray = messages.split('\n');
        for (var i in messageArray) {
            message.push(QCD.translate(messageArray[i]));
        }
    }
    message = message.join('\n');

    return message;
}

function documentIdChanged(id) {
    angular.element($("#GridController")).scope().documentIdChanged(id);
}

function addNewRow() {
    angular.element($("#GridController")).scope().addNewRow();
}

myApp.controller('GridController', ['$scope', '$window', '$http', function ($scope, $window, $http) {
        var _this = this;
        var lookupWindow;
        var productIdElement;

        var messagesController = new QCD.MessagesController();

        function showMessage(message) {
            messagesController.addMessage(message);
        }

        function getDocumentId() {
            if (context) {
                var contextObject = JSON.parse(context);
                if (contextObject && contextObject['window.generalTab.form.id']) {
                    return contextObject['window.generalTab.form.id'];
                }
            }

            return 0;
        }

        function validatePositive(value, column) {
            if (isNaN(value) && value < 0)
                return [false, "Please enter a positive value"];
            else
                return [true, ""];
        }

        this.onGridLinkClicked = function (entityId) {
            var grid = lookupWindow.mainController.getComponent("window.mainTab.grid");
//		var lookupData = grid.getLookupData(entityId);
            productIdElement.val(entityId);
            mainController.closeThisModalWindow();
        }

        function onModalClose() {
            lookupWindow = null;
        }

        function onModalRender(modalWindow) {
            modalWindow.getComponent("window.mainTab.grid").setLinkListener(_this);
        }

        function editProductId_openLookup() {
            lookupWindow = mainController.openModal('body', 'materialFlowResources/productsLookup.html', null, onModalClose, onModalRender, {width: 1000, height: 560})
        }

        function createLookupElement(inputId, value, url) {
            var $ac = $('<input id="' + inputId + '" class="eac-square"/>');
            $ac.val(value);
            $ac.autoComplete({
                source: function (query, response) {
                    try {
                        xhr.abort();
                    } catch (e) {
                    }
                    xhr = $.getJSON(url, {query: query}, function (data) {
                        response(data);
                    });
                },
                renderItem: function (item, search) {
                    var code = item.code || item.number;
                    var id = item.id;
                    // escape special characters
                    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                    return '<div class="autocomplete-suggestion" data-id="' + id + '" data-val="' + code + '">' + code.replace(re, "<b>$1</b>") + '</div>';
                },
                onSelect: function (e, term, item, that) {
                    $(that).trigger('change');
                }
            });

//            var button = $('<button>Szukaj</button>');
//            button.bind('click', function () {
//                editProductId_openLookup();
//            });
//            button.insertAfter($ac);

            return $ac;
        }

        function storageLocationLookup_createElement(value, options) {
            return createLookupElement('storageLocation', value, '/integration/rest/documentPositions/storagelocations.html');
        }

        function palletNumbersLookup_createElement(value, options) {
            return createLookupElement('palletnumber', value, '/rest/palletnumbers');
        }

        function updateFieldValue(field, value, rowId) {
            var productInput = $('#product');

            if (productInput.length) {
                // edit form
                $('#' + field).val(value);

            } else {
                // edit inline
                $('#' + rowId + '_' + field).val(value);
            }
        }

        function getFieldValue(field, rowId) {
            var productInput = $('#product');

            if (productInput.length) {
                // edit form
                return $('#' + field).val();

            } else {
                // edit inline
                return $('#' + rowId + '_' + field).val();
            }
        }

        var available_additionalunits = null;
        function updateUnitsInGridByProduct(productNumber, additionalUnitValue) {
            $.get('/integration/rest/documentPositions/units/' + productNumber + ".html", function (units) {
                available_additionalunits = units['available_additionalunits'];
                var gridData = $('#grid').jqGrid('getRowData');

                var productInput = $('#product');

                if (productInput.length) {
                    // edit form
                    var unitInput = $('#unit').val(units['unit']);

                    var additionalUnitInput = $('#givenunit');
                    additionalUnitInput[0].options.length = 0;
                    angular.forEach(units['available_additionalunits'], function (value, key) {
                        additionalUnitInput.append('<option value="' + value.key + '">' + value.value + '</option>');
                    });
                    if (!additionalUnitValue) {
                        additionalUnitValue = units['additionalunit'];
                    }
                    additionalUnitInput.val(additionalUnitValue);
                    updateConversionByGivenUnitValue(additionalUnitValue);

                } else {
                    // edit inline
                    var patternProduct = /(id=\".+_product\")/ig;
                    for (var i = 0; i < gridData.length; i++) {
                        var product = gridData[i]['product'];
                        if (product.toLowerCase().indexOf('<input') >= 0) {
                            var matched = product.match(patternProduct)[0];
                            var numberOfInput = matched.toUpperCase().replace("ID=\"", "").replace("_PRODUCT\"", "");
                            var productValue = $('#' + numberOfInput + '_product').val();

                            if (productValue === productNumber) {
                                // update input
                                $('#' + numberOfInput + '_unit').val(units['unit']);

                                // set additionalunit available options                        
                                var additionalUnitInput = $('#' + numberOfInput + '_givenunit');

                                additionalUnitInput[0].options.length = 0;
                                angular.forEach(units['available_additionalunits'], function (value, key) {
                                    additionalUnitInput.append('<option value="' + value.key + '">' + value.value + '</option>');
                                });

                                // update additionalunit
                                if (!additionalUnitValue) {
                                    additionalUnitValue = units['additionalunit'];
                                }
                                additionalUnitInput.val(additionalUnitValue);

                                // update conversion           
                                updateConversionByGivenUnitValue(additionalUnitValue, numberOfInput);
                            }
                        }
                    }
                }
            });
        }

        function productsLookup_createElement(value, options) {
            var lookup = createLookupElement('square', value, '/rest/products');

            $(lookup).bind('change keydown paste input', function () {
                var t = $(this);
                window.clearTimeout(t.data("timeout"));
                $(this).data("timeout", setTimeout(function () {
                    updateUnitsInGridByProduct(t.val());
                }, 500));
            });
            return lookup;
        }

        function additionalCodeLookup_createElement(value, options) {
            return createLookupElement('additionalCode', value, '/rest/additionalcodes');
        }

        function lookup_value(elem, operation, value) {
            if (operation === 'get') {
                return $(elem).val();

            } else if (operation === 'set') {
                return $('input', elem).val(value);
            }
        }

        function input_value(elem, operation, value) {
            if (operation === 'get') {
                return $(elem).val();

            } else if (operation === 'set') {
                return $('input', elem).val(value);
            }
        }

        function touchManuallyQuantityField(rowId) {
            var productInput = $('#product');

            if (productInput.length) {
                // edit form
                $('#quantity').trigger('change');

            } else {
                // edit inline
                $('#' + rowId + '_quantity').trigger('change');
            }
        }

        function updateConversionByGivenUnitValue(givenUnitValue, rowId) {
            var conversion = "";

            if (available_additionalunits) {
                conversion = available_additionalunits.filter(function (element, index) {
                    return element.key === givenUnitValue;
                })[0];
                if (conversion) {
                    conversion = conversion.conversion;
                }
            }

            updateFieldValue('conversion', conversion, rowId);
            touchManuallyQuantityField(rowId);
        }

        function quantity_createElement(value, options) {
            var $input = $('<input id="' + options.id + '" name="' + options.name + '" rowId="' + options.rowId + '" />');
            $input.val(value);

            $($input).bind('change keydown paste input', function () {
                var t = $(this);
                window.clearTimeout(t.data("timeout"));
                $(this).data("timeout", setTimeout(function () {
                    var newGivenQuantity = parseFloat(t.val()) * parseFloat(getFieldValue('conversion', t.attr('rowId')));
                    if (!newGivenQuantity) {
                        newGivenQuantity = '';
                    }

                    updateFieldValue('givenquantity', newGivenQuantity, t.attr('rowId'));
                }, 500));
            });

            return $input;
        }

        function givenquantity_createElement(value, options) {
            var $input = $('<input id="' + options.id + '" name="' + options.name + '" rowId="' + options.rowId + '" />');
            $input.val(value);

            $($input).bind('change keydown paste input', function () {
                var t = $(this);
                window.clearTimeout(t.data("timeout"));
                $(this).data("timeout", setTimeout(function () {
                    var newQuantity = parseFloat(t.val()) / parseFloat(getFieldValue('conversion', t.attr('rowId')));
                    if (!newQuantity) {
                        newQuantity = '';
                    }

                    updateFieldValue('quantity', newQuantity, t.attr('rowId'));
                }, 500));
            });

            return $input;
        }

        function givenunit_createElement(value, options) {
            var $select = $('<select id="' + options.id + '" name="' + options.name + '" rowId="' + options.rowId + '">');

            var rowId = options.rowId;
            var gridData = $('#grid').jqGrid('getRowData');

            var productNumber = gridData.filter(function (element, index) {
                return element.id === rowId;
            })[0].product;

            if (productNumber.toLowerCase().indexOf('<input') >= 0) {
                productNumber = $('#' + rowId + '_product').val();
            }

            updateUnitsInGridByProduct(productNumber, value);

            $select.bind('change', function () {
                var newValue = $(this).val();
                updateConversionByGivenUnitValue(newValue, $(this).attr('rowId'));
            });

            return $select;
        }

        function givenunit_value(elem, operation, value) {
            if (operation === 'get') {
                return $(elem).val();

            } else if (operation === 'set') {
                return $('select', elem).val(value);
            }
        }

        function errorfunc(rowID, response) {
            var message = JSON.parse(response.responseText).message;
            message = translateMessages(message);

            showMessage({
                type: "failure",
                content: message
            });

            return true;
        }

        function successfunc(rowID, response) {
            showMessage({
                type: 'success',
                content: QCD.translate('qcadooView.message.saveMessage')
            });

            return true;
        }

        function errorCallback(response) {
            showMessage({
                type: "failure",
                content: response.data.message
            });
        }

        function aftersavefunc() {
            $("#grid").trigger("reloadGrid");
        }

        $scope.resize = function () {
            console.log('resize');
            jQuery('#grid').setGridWidth($("#window\\.positionsGridTab").width() - 25, true);
            jQuery('#grid').setGridHeight($("#window\\.positionsGridTab").height() - 150);
        }
        $("#window\\.positionsGridTab").resize($scope.resize);

        var gridEditOptions = {
            keys: true,
            url: '../../integration/rest/documentPositions.html',
            mtype: 'PUT',
            errorfunc: errorfunc,
            successfunc: successfunc,
            aftersavefunc: aftersavefunc
        };

        var gridAddOptions = {
            rowID: "0",
            initdata: {
            },
            position: "first",
            useDefValues: true,
            useFormatter: false,
            addRowParams: angular.extend({
                extraparam: {}
            }, gridEditOptions)
        };

        var config = {
            url: '../../integration/rest/documentPositions/' + getDocumentId() + '.html',
            datatype: "json",
            height: '100%',
            autowidth: true,
            rowNum: 150,
            sortname: 'id',
            toolbar: [true, "top"],            
            errorTextFormat: function (response) {
                return translateMessages(JSON.parse(response.responseText).message);
            },
            colNames: ['ID', 'document', 'product', 'additional_code', 'quantity', 'unit', 'givenquantity', 'givenunit', 'conversion', 'price', 'expirationdate',
                'productiondate', 'batch', 'pallet', 'type_of_pallet', 'storage_location'/*, 'resource_id'*/],
            colModel: [
                {
                    name: 'id',
                    index: 'id',
                    key: true,
                    hidden: true
                },
                {
                    name: 'document',
                    index: 'document',
                    hidden: true,
                    editable: true,
                    editoptions: {
                        defaultValue: getDocumentId()
                    }

                },
                {
                    name: 'product',
                    index: 'product',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: productsLookup_createElement,
                        custom_value: lookup_value,
                    },
                    formoptions: {
                        rowpos: 2,
                        colpos: 1
                    },
                },
                {
                    name: 'additional_code',
                    index: 'additional_code',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: additionalCodeLookup_createElement,
                        custom_value: lookup_value
                    },
                    formoptions: {
                        rowpos: 3,
                        colpos: 1
                    },
                },
                {
                    name: 'quantity',
                    index: 'quantity',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: quantity_createElement,
                        custom_value: input_value
                    },
                    formoptions: {
                        rowpos: 4,
                        colpos: 1
                    },
                },
                {
                    name: 'unit',
                    index: 'unit',
                    editable: true,
                    editoptions: {readonly: 'readonly'},
                    width: 60,
                    formoptions: {
                        rowpos: 5,
                        colpos: 1
                    },
                },
                {
                    name: 'givenquantity',
                    index: 'givenquantity',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: givenquantity_createElement,
                        custom_value: input_value
                    },
                    formoptions: {
                        rowpos: 6,
                        colpos: 1
                    },
                },
                {
                    name: 'givenunit',
                    index: 'givenunit',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: givenunit_createElement,
                        custom_value: givenunit_value
                    },
                    formoptions: {
                        rowpos: 7,
                        colpos: 1
                    },
                },
                {
                    name: 'conversion',
                    index: 'conversion',
                    editable: true,
                    required: true,
                    editoptions: {readonly: 'readonly'},
                    formoptions: {
                        rowpos: 8,
                        colpos: 1
                    },
                },
                {
                    name: 'price',
                    index: 'price',
                    editable: true,
                    required: true,
                    formatter: 'number',
                    editrules: {
                        custom_func: validatePositive,
                        custom: true,
                        required: false
                    },
                    formoptions: {
                        rowpos: 2,
                        colpos: 2
                    },
                },
                {
                    name: 'expirationdate',
                    index: 'expirationdate',
                    width: 150,
                    editable: true,
                    required: true,
                    edittype: "text",
                    editoptions: {
                        dataInit: function (element) {
                            var options = $.datepicker.regional[window.locale];
                            options.showOn = 'focus';

                            $(element).datepicker(options);
                        }
                    },
                    formoptions: {
                        rowpos: 3,
                        colpos: 2
                    },
                },
                {
                    name: 'productiondate',
                    index: 'productiondate',
                    width: 150,
                    editable: true,
                    required: true,
                    edittype: "text",
                    editoptions: {
                        dataInit: function (element) {
                            var options = $.datepicker.regional[window.locale];
                            options.showOn = 'focus';

                            $(element).datepicker(options);
                        }
                    },
                    formoptions: {
                        rowpos: 4,
                        colpos: 2
                    },
                },
                {
                    name: 'batch',
                    index: 'batch',
                    editable: true,
                    required: true,
                    formoptions: {
                        rowpos: 5,
                        colpos: 2
                    },
                },
                {
                    name: 'pallet',
                    index: 'pallet',
                    editable: true,
                    required: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: palletNumbersLookup_createElement,
                        custom_value: lookup_value
                    },
                    formoptions: {
                        rowpos: 6,
                        colpos: 2
                    },
                },
                {
                    name: 'type_of_pallet',
                    index: 'type_of_pallet',
                    editable: true,
                    required: true,
                    edittype: 'select',
                    editoptions: {
                        /*
                         aysnc: false,
                         dataUrl: '../../rest/typeOfPallets',
                         buildSelect: function (response) {
                         var data = $.parseJSON(response);
                         var s = "<select>";
                         
                         s += '<option value="0">--</option>';
                         $.each(data, function () {
                         s += '<option value="' + this.key + '">' + this.value + '</option>';
                         });
                         
                         return s + "</select>";
                         }*/
                    },
                    formoptions: {
                        rowpos: 7,
                        colpos: 2
                    },
                },
                {
                    name: 'storage_location',
                    index: 'storage_location',
                    editable: true,
                    edittype: 'custom',
                    editoptions: {
                        custom_element: storageLocationLookup_createElement,
                        custom_value: lookup_value
                    },
                    formoptions: {
                        rowpos: 8,
                        colpos: 2
                    },
                }/*,
                 {
                 name: 'resource_id',
                 index: 'resource_id',
                 editable: true,
                 edittype: 'custom',
                 editoptions: {
                 // TODO
                 custom_element: editProductId_createElement,
                 custom_value: editProductId_value
                 }
                 }*/
            ],
            pager: "#jqGridPager",
            gridComplete: function () {
                //setTimeout(function() { $scope.resize(); }, 1000);                
            },
            onSelectRow: function (id) {
                gridEditOptions.url = '../../integration/rest/documentPositions/' + id + '.html';
                jQuery('#grid').editRow(id, gridEditOptions);
            },
            ajaxRowOptions: {contentType: "application/json"},
            serializeRowData: function (postdata) {
                delete postdata.oper;
                return JSON.stringify(postdata);
            },
            beforeSubmit: function (postdata, formid) {
                //more validations
//                if ($('#exec').val() == "") {
//                    $('#exec').addClass("ui-state-highlight");
//                    return [false, 'ERROR MESSAGE']; //error
//                }
                return [false, 'ble'];
            }
        };

        function prepareGridConfig(config) {
            var hideColumnInGrid = function (columnIndex, responseDate) {
                if (columnIndex === 'storage_location' && !responseDate.showstoragelocation) {
                    return true;
                }
                if (columnIndex === 'additional_code' && !responseDate.showadditionalcode) {
                    return true;
                }
                if (columnIndex === 'productiondate' && !responseDate.showproductiondate) {
                    return true;
                }
                if (columnIndex === 'expirationdate' && !responseDate.showexpiratindate) {
                    return true;
                }
                if (columnIndex === 'pallet' && !responseDate.showpallet) {
                    return true;
                }
                if (columnIndex === 'type_of_pallet' && !responseDate.showtypeofpallet) {
                    return true;
                }
                if (columnIndex === 'batch' && !responseDate.showbatch) {
                    return true;
                }

                return false;
            };

            $http({
                method: 'GET',
                url: '../../integration/rest/documentPositions/gridConfig.html'

            }).then(function successCallback(response) {
                angular.forEach(config.colModel, function (value, key) {
                    if (hideColumnInGrid(value.index, response.data)) {
                        config.colModel[key].hidden = true;
                        config.colModel[key].editrules = config.colModel[key].editrules || {};
                        config.colModel[key].editrules.edithidden = true;
                    }
                });

                angular.forEach(config.colNames, function (value, key) {
                    config.colNames[key] = QCD.translate('qcadooView.gridColumn.' + value);
                });

                $http({
                    method: 'GET',
                    url: '../../rest/typeOfPallets'

                }).then(function successCallback(response) {
                    selectOptionsTypeOfPallets = [];
                    angular.forEach(response.data, function (value, key) {
                        selectOptionsTypeOfPallets.push(value.key + ':' + value.value);
                    });

                    config.colModel.filter(function (element, index) {
                        return element.index === 'type_of_pallet';
                    })[0].editoptions.value = selectOptionsTypeOfPallets.join(';');

                    $scope.config = config;

                    $('#gridWrapper').unblock();

                }, errorCallback);
            }, errorCallback);

            return config;
        }

        $scope.documentIdChanged = function (id) {
            config.url = '../../integration/rest/documentPositions/' + id + '.html';

            config.colModel.filter(function (element, index) {
                return element.index === 'document';
            })[0].editoptions.defaultValue = id;

            prepareGridConfig(config);
        };

        $scope.addNewRow = function () {
            jQuery('#grid').addRow(gridAddOptions);
        }

        $scope.data = [];

        // disable close modal on off click
        $.jqm.params.closeoverlay = false;

        $('#gridWrapper').block({
            message: '<h2>Grid dostępny po zapisie dokumentu</h2>',
            centerY: false,
            centerX: false,
            css: {
                top: '70px',
                left: ($(window).width() / 2) - 300 + 'px',
            }
        });

    }]);
