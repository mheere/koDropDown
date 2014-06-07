ko.bindingHandlers.koDropDown = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        var valueUnwrapped = ko.unwrap(value);
        var options = allBindingsAccessor.get('declarativeOptions')(valueUnwrapped, bindingContext.$parent);

        // ------------------------------------------------
        // create a default object which will be given to the drop down widget - NOTE, these options CAN
        // still be overriden by the returned settings from the above call to 'mdpOptions'
        // ------------------------------------------------
        var defaults = {
            contextCurrent: valueUnwrapped,
            contextRoot: bindingContext.$root,
            offsetElement: undefined,
            closeOnSelectionMade: true,
            position: "LeftDown"
        };

        // ------------------------------------------------
        // allow any specific settings returned by the callback to the model to override our defaults.
        // ------------------------------------------------
        var settings = jQuery.extend(defaults, options);

        // create the drop down element
        jQuery(element).kodropdown(settings);

    }
}
