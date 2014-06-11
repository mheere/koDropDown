# Knockout Drop-down #


**koDropDown** is a highly configurable, adaptable and fully-featured jQuery plugin - calling on the power of Knockout and jQuery.

The aim of this project is to provide an easy straight forward way of a multi purpose dropdown that can be attached to any DOM element.   

## What makes this dropdown different? ##
This dynamic dropdown plugin distinguishes itself from many others dropdowns in some ways:

### 1. Delayed items retrieval ###
One of the best features of this dropdown is its ability to callback for its data only when it needs to display them.

### 2. Auto-configures the view depending on its data ###
The widget chooses the correct template to display the retrieved data items.

### 3. Enforce close integration with you data model ###
The widget is geared up to work closely with your underlying viewmodel(s).  The option hooks for submitting and retrieving data all are controlled by the model.

### 4. Support for declarative binding ###
By using the supplied custom binding we are able to declaratively connect instances of this plugin with DOM elements that are created at a later point, (i.e. as part of a Knockout foreach loop).  


## Workings ##
The plugin currently supports two types of items; **ActionItems** and **OptionItems**.

**_ActionItems_** are simple js objects with a *code* and *name* property. When they are returned as the model the dropdown could look like this:

![](http://www.blueskycode.com/images/ddActionItem.png) 


**_OptionItems_** are ActionItems with an additional property; the *isSelected* property indicating (surprise surprise) whether or not the item is selected (!) - see below.  A mixture of Action and Option items can also be returned which will be shown as a merged popup which can be very useful at times! 

![](http://www.blueskycode.com/images/ddOptionItems.png)

The widget can also be used ***declaratively*** which offers great benefits when you need dropdowns in items that are part of dynamic lists (like knockout's foreach loop).

![](http://www.blueskycode.com/images/ddDeclarative.png)



## Working examples ##
Working examples can be found by opening the TestPage.html or visiting [www.blueskycode.com](http://www.blueskycode.com/dropdown).

## Pre-requisites ##
One of the most useful libraries (apart from jQuery) I have come across has to be [Knockout.js](http://knockoutjs.com/documentation/introduction.html "Knockout documentation") which I use in this widget in a variety of places from creating the templates to binding to the given data collection.
Therefore these libraries are relied upon and need to be referenced in your project.

## Usage ##
The easiest way to get the dropdown to work would be to submit it an array of strings. Under the hood these will be converted into *ActionItems* and once selected an *ActionItem* is returned:

    $('.my-dd-sample-1').kodropdown({
    	data: ["Option 1", "Second Option", "Third Option"],
    	selectedItem: function (item) { alert(item.code); }
    });

A more generic approach would be to callback to the model requesting for the items by setting the 'data' option to a function in your model.  When a selection is made this is passed back to a function (in this case the chosenOption function on our model) that will handle any further action. The current model is routinely passed on ensuring that when the user handles a selected item it is also given the model back as its context.     

    $('.my-dd-sample-2').kodropdown({
	    data: model.getActions,
	    selectedItem: model.chosenOption,
	    contextCurrent: model
    });

Along the same lines we can callback for **two** data sources that will create a mixed popup. The mixedOptions returns a list of *OptionItems* and the mixedActions returns the *ActionItems*. We have set the  'closeOnSelectionMade' option to false to prevent the widget closing when an option is selected.
To force the widget to close we need to return 'true' when handling the 'selectedItem' function.

    $('.my-dd-sample-5').kodropdown({
	    data: model.getMixedOptions,
	    data2: model.getMixedActions,
	    selectedItem: model.chosenMixed,
	    contextCurrent: model,
	    closeOnSelectionMade: false
    });
 


##Options (required)##

###data###
A function that is called when the dropdown is needed.  It should return the items to display.

###selectedItem###
A function that is called when a selection is made. The selected item is handed over together with any given contexts.

##Options (optional)##

####data2####
A function that is called when a mixed dropdown is needed. If a data2 callback is given it will expect items to be returned (if *data* returns *OptionItems* then *data2* should return *ActionItems* or vice versa!)

####offsetElement####
The jQuery element that instigates the dropdown.  By default this is the dom element the widget was created on. 

####closeOnSelectionMade  (true)####
Since the default is true the popup is closed after a selection is made. To prevent this set it to false.  You now are responsible for closing the widget either by calling the 'close' method on the widget or returning 'true' from the 'selectedItem' callback or simply clicking outside the popup!
The mixed example shows a good use of this by disabling closing on selection so when 'OptionItems' are selected specific logic can be applied leaving the dropdown open. Then when an 'ActionItem' is selected it returns 'true' thereby closing the dropdown.   

####position####
There are four positions that can be given: RightDown, LeftDown (default), RightTop and LeftTop.
 
![](http://www.blueskycode.com/images/ddPositions.png)

####allowReordering####
The user is able to re-order the list of items that is shown in the dropdown. 

####itemsReordered####
Upon re-ordering this event is called allowing the user to take action on the new positions.
 
####onClose####
You can attach a function pointer to this option which is called when the popup closes.  This is useful when the user has made changes to selected items when closing the popup. The caller can then examine the selection that was made.

####openOnCreate####
If this is set to true the drop down will open as soon as it is attached to the DOM element.

####selection####
The default is **'SingleSelect'** which *unselects* other dropdown items ensuring that only a single item can be selected.  When set to '**MultiSelect**' it will allow multiple items to be selected.

####useOwnTemplates####
The default is 'true' ensuring that the widget will use its own string based templates.  If you wish to submit your own templates then set this to 'false' and ensure your templates are pre-loaded.  The widget will then scan for the following templateid's: 'ddTmplStandard', 'ddTmplSelectedItems' and 'ddTmplMixedItems'.  The TestPage.html has these defined (even though they are not used since all samples use the internal defined templates).  If however you set this option to 'false' it would use these!!


## Declarative binding to DOM elements ##
The following code snippet illustrates how a custom binding can be used to hook the plugin to elements that are dynamically created.
The actual custom knockout binding is defined as such:

    ko.bindingHandlers.koDropDown = {
	    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		    var value = valueAccessor();
		    var valueUnwrapped = ko.unwrap(value);
		    var options = allBindingsAccessor.get('declarativeOptions')(valueUnwrapped, bindingContext.$parent);
		    
		    // ------------------------------------------------
		    // create a default object which will be given to the drop down widget - NOTE, these options CAN
		    // still be overriden by the returned settings from the above call to 'declarativeOptions'
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
		    jQuery(element).bsdropdown(settings);
	    }
    }

Then we call upon this custom binding declaratively as such: 

    <div data-bind='foreach: items'>
	    <div class="bs-basket-item">
		    <span data-bind="text: name"></span>
		    <span class="pull-right">
			    <span class="pb-caret" data-bind="koDropDown: $data, declarativeOptions: $parent.getDynamicOptions ">
			    	<i class="fa fa-caret-down"></i>
		    	</span>
		    </span>
	    </div>
    </div>


Note the callback to the $parent.getDynamicOptions which should return a valid options object that can directly be passed on to the plugin.  It will merge with the plugin's own default settings overriding any options that are specified here.

    // Called by the custom knockout binding (koPopUp) when the element is bound and rendered.  All it does 
    // is to provide a proper koDropDown settings object that is given to the dropdown widget.
	// These settings override any default. 
    MyBasket.prototype.getDynamicOptions = function (item, context) {
    
	    return {
		    // This is called upon when user clicks the drop down glyph - it is given the current item and the 
		    // context in which it lives. It should return an array with context relevant option items.
		    data: function (item, context) {
		    
			    var actions = Array();
			    actions.push(new ActionItem("buy", "Buy more " + item.name));
			    actions.push(new ActionItem("other", "Other actions"));
			    actions.push(new ActionItem("remove", "Remove " + item.name + " [" + item.code + "]"));
			    return actions;
		    
		    },
		    
		    // Called by the custom binding (koPopUp) when a drop down item is selected. It submits the item (the drop down
		    // item that was clicked), the contextCurrent (the originating item from which it was clicked) and the 
		    // contextRoot (the entire model).
		    selectedItem: function (item, contextCurrent, contextRoot) {
		    
			    // display to user
			    toastr.info(item.name + " [" + contextCurrent.code + "]");
			    
			    // take appropriate action
			    if (item.code == "remove")
			    	contextRoot.items.remove(contextCurrent);
		    },
		    
		    position: "LeftDown",   // drop down from the left of the item downwards
		    closeOnSelectionMade: true  // close the drop down after a selection is made
	    };
    
    }

## Invitation ##

If you use this dropdown widget and feel you have something to contribute then please fork this code, make your enhancements and become a contributor to this project!

Many thanks

Marcel



