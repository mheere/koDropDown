
function MyBasket() 
{
    var self = this;

    // array of data for sample - Default
    this.actions = Array();
    this.actions.push(new ActionItem("codeA", "Hi, First Option"));
    this.actions.push(new ActionItem("codeB", "2nd Option"));
    this.actions.push(new ActionItem("codeC", "This is the third option"));

    // array of data for sample - List - single select (allow reordering)
    this.itemsOptions = Array();
    this.itemsOptions.push(new OptionItem("codeA", "Dishwashing", true));   // selected item
    this.itemsOptions.push(new OptionItem("codeB", "Laundry", false));
    this.itemsOptions.push(new OptionItem("codeC", "Food shopping", false));
    this.itemsOptions.push(new OptionItem("codeD", "Hovering", false));
    this.itemsOptions.push(new OptionItem("codeE", "Cooking", false));
    this.itemsOptions.push(new OptionItem("codeF", "Dusting", false));

    // array of data for sample - List - multi select
    this.itemsList = Array();
    this.itemsList.push(new OptionItem("codeA", "Dishwashing", true));      // selected item
    this.itemsList.push(new OptionItem("codeB", "Laundry", false));
    this.itemsList.push(new OptionItem("codeC", "Food shopping", false));
    this.itemsList.push(new OptionItem("codeD", "Hovering", true));         // selected item
    this.itemsList.push(new OptionItem("codeE", "Cooking", false));
    this.itemsList.push(new OptionItem("codeF", "Dusting", false));
    this.chosenListItems = Array();

    // array of data for sample - Mixed
    this.itemsMixedOptions = Array();
    this.itemsMixedOptions.push(new OptionItem("landscape", "Landscape view", true));
    this.itemsMixedOptions.push(new OptionItem("portrait", "Portrait view", false));
    this.itemsMixedOptions.push(new OptionItem("custom", "Custom view", false));

    this.itemsMixedActions = Array();
    this.itemsMixedActions.push(new ActionItem("codeA", "Save as default"));
    this.itemsMixedActions.push(new ActionItem("codeB", "Reset"));


    this.newItemText = ko.observable();
    this.items = ko.observableArray();
    this.items.push(new BasketItem("BAN", "Bananas"));
    this.items.push(new BasketItem("APP", "Apples"));
    this.items.push(new BasketItem("ORA", "Oranges"));

    this.mixedOption = ko.observable("landscape");

    this.getActions = function (context) { return context.actions };
    this.getOptions = function () { return self.itemsOptions };
    this.getList = function () { return self.itemsList };
    this.getMixedOptions = function () { return self.itemsMixedOptions };
    this.getMixedActions = function () { return self.itemsMixedActions };

    // function to call on user selecting an item
    this.chosenAction = function (item, context) {
        toastr.info(item.name + " [" + item.code + "]");
    }

    // function to call on user selecting an item
    this.chosenOption = function (item, context) {
        toastr.info(item.name + " [" + item.code + "]");
    }

    // function to call on user selecting an item
    this.chosenList = function (item, context) {
        var arr = jQuery.grep(context.itemsList, function (x) { return x.isSelected() });
        var blkstr = [];
        jQuery.each(arr, function (index, item) { blkstr.push(item.code); });
        toastr.info(blkstr.join(", "));
    }

    // function to call on user selecting a mixed item
    this.chosenMixed = function (item, context) {
        if (item.constructor === ActionItem) {
            toastr.info(item.name + " [" + item.code + "]");
            return true;    // will close the popup!
        }
        if (item.constructor === OptionItem) {
            context.mixedOption(item.code);
        }
    }

}

MyBasket.prototype.add = function () {
    var item = this.newItemText();
    if (!item || item.length == 0) return;
    this.items.push(new BasketItem(item.toUpperCase(), item));
}

// -----------------------------------------------------
// Called by the custom knockout binding (koDropDown) when the element is bound and rendered.  All it does it to provide
// a proper kodropdown settings object that is given to the drop down widget.  These returned settings override default
// given by the custom binding which in turn override defaults set in the widget itself!
// -----------------------------------------------------
MyBasket.prototype.getDynamicOptions = function (item, context) {

    return {
        // This is called upon when user clicks the drop down glyph - it is given the current item and the context in which it lives.
        // It should return an array with context relevant option items.
        data: function (item, context) {

            var actions = Array();
            actions.push(new ActionItem("buy", "Buy more " + item.name));
            actions.push(new ActionItem("other", "Other actions"));
            actions.push(new ActionItem("remove", "Remove " + item.name + " [" + item.code + "]"));
            return actions;

        },

        // Called by the custom binding (bsPopUp) when a drop down item is selected. It submits the item (the drop down
        // item that was clicked), the contextCurrent (the originating item from which it was clicked) and the 
        // contextRoot (the entire model).
        selectedItem: function (item, contextCurrent, contextRoot) {

            // display to user
            toastr.info(item.name + " [" + contextCurrent.code + "]");

            // take appropriate action
            if (item.code == "remove")
                contextRoot.items.remove(contextCurrent);
        },

        position: "LeftDown",           // drop down from the left of the item downwards
        closeOnSelectionMade: true      // close the drop down after a selection is made
    };

}

function BasketItem(code, name) {
    this.code = code;
    this.name = name;
}
