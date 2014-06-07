// ---------------------------
// Definition of ActionItem
// ---------------------------
function ActionItem(code, name) {
    this.code = code;
    this.name = name;
}

// ---------------------------
// Definition of OptionItem
// ---------------------------
function OptionItem(code, name, isSelected) {
    this.isSelected = ko.observable(isSelected);
    this.code = code;
    this.name = name;
}

// ---------------------------
// The main drop down widget
// ---------------------------
(function ($) {
    
    $.widget("blueskycode.kodropdown", {

        // specify default options
        options: {
            offsetElement: undefined,       // the element that instigated the dropdown 
            selectedItem: undefined,        // a function that is called when an item is selected
            data: undefined,                // should return the data for the dropdown
            data2: undefined,               // should return the data for the dropdown (mixed mode)
            closeOnSelectionMade: true,     // if true it will force the widget to close itself after a selection is made
            contextCurrent: undefined,      // the current context that is given to the user through the selectedItem callback
            contextRoot: undefined,         // the current context root that is given to the user through the selectedItem callback
            width: 0,                       // if > 0 it will set the maximum width of the widget
            maxHeight: 0,                   // if > 0 it will limit the maximum height
            position: "LeftDown",           // defines the position of the dropdown in relation to the element
            allowReordering: false,         // if set to true is will allow reordering the items
            itemsReordered: undefined,      // the event fired after the items are reordered
            onClose: undefined,             // if a function is given this will be called after the popup is closed
            openOnCreate: false,            // if set to true it will force the popup to be shown as soon as the widget is created.
            selection: "SingleSelect",      // or "MultiSelect" - applicable only with OptionItems.
            useOwnTemplates: true           // if true it will use its own baked in string based templates - if false you need to have these preloaded!
        },

        _create: function () {
            
            var self = this;                // hang on to myself
            self._vars = {};	            // create an empty object on this instance where we can hold varaiables
            self._vars.isShowing = false;   // initialise us as not showing!

            // assign some default if not set
            if (!self.options.offsetElement)
                self.options.offsetElement = this.element;

            // ---------------------------------------------------------
            // attach a click handler to the offsetElement
            // ---------------------------------------------------------
            $(self.options.offsetElement).click(function (event) {
                // stop click from 'bubbling' up.
                event.stopPropagation();

                // create the widget
                self.create();
            });

            // if caller wishes to show this widget directly then create now
            if (self.options.openOnCreate) {
                // instead of having this open within the same call we allow a small delay allowing underlying code 
                // to execute to completion before we bring this popup up on the screen.
                this.saveTimeOut = setTimeout(function () { self.create(); }, 50);
            }
        },

        create: function () {
            var self = this;
            var v = self._vars;     // reference our variables to v

            // if we are already showing then ignore this call
            if (v.isShowing) return;
                
            // get a ref to the offsetElement
            var $el = $(self.options.offsetElement);

            // retrieve the data we'll need for this widget
            var modelData, modelData2;

            // check if the given data is an array or a function callback
            if (typeof (self.options.data) == "function") {
                // execute the callback to get the viewmodel we need to bind to
                modelData = self.options.data(self.options.contextCurrent, self.options.contextRoot);
                modelData2 = undefined;
                if (self.options.data2)
                    modelData2 = self.options.data2(self.options.contextCurrent, self.options.contextRoot);
            }
            else {
                var tempActions = Array();
                $.each(self.options.data, function (i, itemTmp) { 
                    tempActions.push(new ActionItem(itemTmp, itemTmp));
                });
                modelData = tempActions;
            }

            // if no data can be found at all then ignore 
            if (!modelData || modelData.length == 0) return;

            // specify the model we are going to bind to 
            var model = undefined;

            //// determine the template to use
            //var templateID = "ddTmplStandard";

            //// check the type of item on the zero place to deterine the template to use
            //var item0 = modelData[0];
            //if (item0.constructor === ActionItem) {
            //    templateID = "ddTmplStandard";
            //    model = { actionItems: modelData }
            //}
            //if (item0.constructor === OptionItem) {
            //    templateID = "ddTmplSelectedItems";
            //    model = { optionItems: modelData }
            //}
            
            //// check the type of item on the zero place to deterine the template to use
            //if (modelData2) {
            //    templateID = "ddTmplMixedItems";
            //    item0 = modelData2[0];
            //    if (item0.constructor === ActionItem) {
            //        model = $.extend(model, { actionItems: modelData2 });
            //    }
            //    if (item0.constructor === OptionItem) {
            //        model = $.extend(model, { optionItems: modelData2 });
            //    }
            //}

            // determine the template to use
            var templateID = "ddTmplStandard";

            // check the type of item on the zero place to deterine the template to use
            var item0 = modelData[0];
            if (item0.constructor === ActionItem) {
                templateID = "ddTmplStandard";
                model = { actionItems: modelData }
            }
            if (item0.constructor === OptionItem) {
                templateID = "ddTmplSelectedItems";
                model = { optionItems: modelData }
            }

            // check the type of item on the zero place to deterine the template to use
            if (modelData2) {
                templateID = "ddTmplMixedItems";
                item0 = modelData2[0];
                if (item0.constructor === ActionItem) {
                    model = $.extend(model, { actionItems: modelData2 });
                }
                if (item0.constructor === OptionItem) {
                    model = $.extend(model, { optionItems: modelData2 });
                }
            }

            // define the varaible that will hold the popup
            var $popup;

            // -----------------------------------------------
            // if we are using our own internal fixed templates then do so
            // -----------------------------------------------
            if (self.options.useOwnTemplates) {
                var templ = "";
                if (templateID == "ddTmplStandard")
                    templ = getDefaultTemplate();               // get the default string based template
                else if (templateID == "ddTmplSelectedItems")
                    templ = getSelectedItemsTemplate()          // get the selected items string based template
                else if (templateID == "ddTmplMixedItems")
                    templ = getMixedItemsTemplate();            // the teh mixed string based template

                $popup = $("<div class='bsDropDown'>" + templ + "</div>");  // convert this to a real element
            }
            else
                // we will now try to find the template to instanciate with the name: 'ddTmplStandard', 'ddTmplSelectedItems' or 'ddTmplMixedItems'
                $popup = $("<div class='bsDropDown' data-bind='template: { name: \"" + templateID + "\" }'></div>");

            // append the popup to the offsetElement
            $popup.appendTo($el);

            // hide it straight away (faded in after its position is set)
            $popup.fadeOut(0);

            // bind to the entire options which exposes the Items property to bind to
            ko.applyBindings(model, $popup[0]);

            // create and place the invisible background for the user to click on if needs to close
            var $bg = $("<div style='position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.0); z-index: 999; ' />");
            $bg.appendTo($(self.options.offsetElement));
            $bg.appendTo($el);

            // set the correct width of the popup (if given)
            if (self.options.width > 0)
                $popup.width(self.options.width);

            // set the correct maxHeight of the popup (if given)
            if (self.options.maxHeight > 0)
                $popup.css("maxHeight", self.options.maxHeight);

            // if user wishes the list to be 'jquery sortable' then apply it
            if (self.options.allowReordering) {
                // find an element with class .popdownClickHandler (NOTE: this should be the parent level of the items)
                var $firstTopChild = $('.popdownClickHandler', $el);

                // apply the widget
                $firstTopChild.sortable({
                    placeholder: "ui-state-highlight",
                    containment: "parent",
                    forcePlaceholderSize: true,
                    update: self.options.itemsReordered
                });
            }

            // apply the position of the popdown widget
            var my = "";
            var at = "";
            var position = self.options.position.toLowerCase();

            if (position == 'rightdown') {
                my = "right top";
                at = "right bottom";
            } else if (position == 'rightup') {
                my = "right bottom";
                at = "right top";
            } else if (position == 'leftup') {
                my = "left bottom";
                at = "left top";
            } else {
                my = "left top";
                at = "left bottom";
            }

            var popupoptions = {
                "my": my,
                "at": at,
                "of": $el
            };
            $popup.position(popupoptions);

            // make us visible
            $popup.fadeIn(300);

            // we are now in showing mode
            v.isShowing = true;

            // the 'close this popup' function
            v.closeme = function (event) {
                v.isShowing = false;

                // start the fadout animation
                $popup.fadeOut(300, function () { $popup.remove(); });

                // remove the bg overlay
                $bg.remove();

                // remove click handlers
                $popup.off('click');

                // ko unbind the $popup[0]
                ko.cleanNode($popup[0]);

                // if there is a callback function to call then do so.
                if (self.options.onClose) { self.options.onClose(); }
            };

            // when the user scolls we hide the popup
            $(document).scroll(function () { v.closeme(); });

            // as a one-off place an event handler on the background
            $bg.one("click", function (event) {
                event.stopPropagation();            // stop click from 'bubbling' up.
                v.closeme();
            });

            // get a delegated click handler ready to act on user making a selection
            $popup.on('click', '.dditem', function (event) {
                event.stopPropagation();    // stop click from 'bubbling' up.

                var context = ko.contextFor(this);

                if (context.$data.constructor === OptionItem) {
                    var selection = self.options.selection.substr(0, 5).toLowerCase();
                    if (selection === "singl") {
                        $.each(ko.unwrap(model.optionItems), function (i, itemTmp) { 
                            itemTmp.isSelected(false);
                        });
                        context.$data.isSelected(true);
                    }
                    else if (selection === "multi") {
                        context.$data.isSelected(!context.$data.isSelected());
                    }
                }

                var closeMe = false;
                if (context) {
                    if (self.options.selectedItem) {
                        closeMe = self.options.selectedItem(context.$data, self.options.contextCurrent, self.options.contextRoot);
                    }
                }

                if (closeMe || self.options.closeOnSelectionMade) {
                    v.closeme();
                }
            });
        },
        close: function () {    // a method the user can call externally to force the widget to close
            this._vars.closeme();
        },
        _init: function () {
        },
        _destroy: function () {
            $(this.options.offsetElement).unbind("click");
        }
    });

    var getDefaultTemplate = function () {
        var s = "";
        s += "<div class='popdownClickHandler' data-bind='foreach: actionItems'>";
        s += "    <div class='dditem'>";
        s += "        <span class='dditemtext' data-bind='text: name'></span>";
        s += "    </div>";
        s += "</div>";
        return s;
    }

    var getSelectedItemsTemplate = function () {
        var s = "";
        s += "<div class='popdownClickHandler' data-bind='foreach: optionItems'>";
        s += "    <div class='dditem'>";
        s += "        <span class='selected'><i class='fa fa-check' data-bind='visible: isSelected'></i></span>";
        s += "        <span class='dditemtext' data-bind='text: name'></span>";
        s += "    </div>";
        s += "</div>";
        return s;
    }

    var getMixedItemsTemplate = function () {
        var s = "";
        s += "<div class='popdownClickHandler' data-bind='foreach: optionItems'>";
        s += "    <div class='dditem'>";
        s += "        <span class='selected'><i class='fa fa-check' data-bind='visible: isSelected'></i></span>";
        s += "        <span class='dditemtext' data-bind='text: name'></span>";
        s += "    </div>";
        s += "</div>";
        s += "<div class='ddseperator'></div>";
        s += "<div class='popdownClickHandler' data-bind='foreach: actionItems'>";
        s += "    <div class='dditem'>";
        s += "        <span class='dditemtext' data-bind='text: name'></span>";
        s += "    </div>";
        s += "</div>";
        return s;
    }

})(jQuery);

