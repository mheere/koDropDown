(function ($) {

    $(document).ready(function () {

        // create a new basket viewmodel
        var model = new MyBasket();

        // load the template shoing the example nicely layed out
        $("#my-dd-template-taster").load("templates/bs-dd-template-taster.html", function () {

            // now create our drop down  - default actions
            $('.my-dd-sample-1').kodropdown({
                data: ["Option A", "Option B", "Option C"],
                selectedItem: function (item) { alert(item.code); }
            });

            $('.my-dd-sample-2').kodropdown({
                data: model.getActions,
                selectedItem: model.chosenAction,
                contextCurrent: model
            });

            // now create our drop down - single selected 
            $('.my-dd-sample-3').kodropdown({
                data: model.getOptions,
                selectedItem: model.chosenOption,
                contextCurrent: model,
                allowReordering: true,
                itemsReordered: function (event, ui) { alert("item was moved"); }
            });

            // now create our drop down - multi selected 
            $('.my-dd-sample-4').kodropdown({
                data: model.getList,
                selectedItem: model.chosenList,
                contextCurrent: model,
                selection: "MultiSelect",
                closeOnSelectionMade: false
            });

            // now create our drop down - mixed
            $('.my-dd-sample-5').kodropdown({
                data: model.getMixedOptions,
                data2: model.getMixedActions,
                selectedItem: model.chosenMixed,
                contextCurrent: model,
                closeOnSelectionMade: false
            });

            ko.applyBindings(model, document.getElementById("my-dd-template-taster"));   // bind it to our model
        });

        // load the template shoing the example nicely layed out
        $("#my-dd-template-dynamic").load("templates/bs-dd-template-dynamic.html", function () {

            ko.applyBindings(model, document.getElementById("my-dd-template-dynamic"));   // bind it to our model

        });

    });

})(jQuery);