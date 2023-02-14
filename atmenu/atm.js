
/*
 * At Menu
 * Copyright 2023 Daniel Boothman
 * www.atmenujs.com
 * License: MIT
 */
(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
      define([], factory(root));
  } else if ( typeof exports === 'object' ) {
      module.exports = factory(root);
  } else {
      root.AtMenu = factory(root);
  }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

  'use strict';

  //
  // Variables
  //

  var window = root; // Map window to root to avoid confusion
  var publicMethods = {}; // Placeholder for public methods

  // Default settings
  var defaults = {
      "target": "", // id/ class: textarea, input, etc
      "menu": "", // id/ class of the menu that appears
      "items": ".atm-item",
      "openMenu": "@", // @ - Character to open the menu
      "closeMenu": "Escape", // Esc - Character to close the menu,
      "marginTop": 30 // margin above the menu so that it's not over the line of text/ openMenu key
  };

  var extend = function () {

      // Variables
      var extended = {};
      var deep = false;
      var i = 0;
      var length = arguments.length;

      // Check if a deep merge
      if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
          deep = arguments[0];
          i++;
      }

      // Merge the object into the extended object
      var merge = function (obj) {
          for ( var prop in obj ) {
              if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                  // If deep merge and property is an object, merge properties
                  if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                      extended[prop] = extend( true, extended[prop], obj[prop] );
                  } else {
                      extended[prop] = obj[prop];
                  }
              }
          }
      };

      // Loop through each object and conduct a merge
      for ( ; i < length; i++ ) {
          var obj = arguments[i];
          merge(obj);
      }

      return extended;

  };

  /**
   * A private method
   * @private
   */

  // Logger
  var logger = function(message) {
      //console.log(message);
      //document.getElementById("logger").innerHTML += "<li>" + JSON.stringify(message) + "</li>";
  }

  // Default Classes
  var addDefaultClasses = function(settings){

    var children = settings.menu.children;
    for (var i = 0; i < children.length; i++){
      children[i].classList.add("atm-item");
    }

  }

  // Close Menu
  var closeMenu = function (settings, event) {
      if (event.code == settings.closeMenu){
          settings.menu.classList.remove("atm-menu-active");
          if (settings.onClose != null){
            AtMenu.onCloseRun(settings);
          }
      }
  };

  var closeMenuForced = function (settings){
    settings.menu.classList.remove("atm-menu-active");
    if (settings.onClose != null){
      AtMenu.onCloseRun(settings);
    }
  }

  // Open Menu
  var openMenu = function (settings, event) {

      const text = settings.target.value;
      const cursorPos = settings.target.selectionStart;

      if (text[cursorPos - 1] === settings.openMenu) {
          var position = AtMenu.getCaretPosition(settings);
          
          var marginTop = defaults.marginTop;
          if (settings.marginTop){
            marginTop = settings.marginTop;
          }

          settings.menu.style.top = position.caret.top + position.target.top + position.html + marginTop + "px";
          settings.menu.style.left = position.caret.left + position.target.left - 30 + "px";
          settings.menu.classList.add("atm-menu-active");

          if (settings.onOpen != null){
            AtMenu.onOpenRun(settings);
          }

      }
  };

  var backspaceCheck = function (settings, event){
    if (event.keyCode == 8 || event.key == "Backspace"){
      const text = settings.target.value;
      const cursorPos = settings.target.selectionStart;

      if (text[cursorPos - 1] === settings.openMenu) {
        closeMenuForced(settings);
      }
    }
  }

  var enterCheck = function (settings, event){
    if (settings.onChoose != null){
      if (event.keyCode == 13 || event.key == "Enter" || event.inputType == "insertLineBreak"){
        event.preventDefault();
        AtMenu.onChooseRun(settings);
      }
    }
  }

  var moveUpCheck = function (settings, event){
    if (event.keyCode == 38 || event.key == "ArrowUp"){
      event.preventDefault();
      var upTargetDiv = document.querySelector('.atm-item-active');
      if (upTargetDiv) {
          var previousDiv = upTargetDiv.previousElementSibling;
          while (previousDiv && previousDiv.classList.contains("atm-item-inactive")) {
            previousDiv = previousDiv.previousElementSibling;
          }
          if (previousDiv){
              upTargetDiv.classList.remove("atm-item-active");
              previousDiv.classList.add("atm-item-active");
          }
      }
      checkMenuItemVisible(settings);
    }
  }

  var moveDownCheck = function (settings, event){
    if (event.keyCode == 40 || event.key == "ArrowDown"){
      event.preventDefault();
      var downTargetDiv = document.querySelector('.atm-item-active');
      if (downTargetDiv) {
          var nextDiv = downTargetDiv.nextElementSibling;
          while (nextDiv && nextDiv.classList.contains("atm-item-inactive")) {
            nextDiv = nextDiv.nextElementSibling;
          }
          if (nextDiv){
              downTargetDiv.classList.remove("atm-item-active");
              nextDiv.classList.add("atm-item-active");
          }
      }
      checkMenuItemVisible(settings);
    }
  }

  var checkMenuItemVisible = function(settings){
    var selectedItem = document.querySelector('.atm-item-active');
    if (selectedItem){
      var itemPos = selectedItem.offsetTop;
      settings.menu.scrollTo({ top: itemPos });
    }

  }

  var textAfterSymbol = function(settings){
    var theText = null;
    const text = settings.target.value;
    const atSymbolIndex = text.indexOf(settings.openMenu);
    if (atSymbolIndex >= 0) {
      const caretPosition = settings.target.selectionStart;
      theText = text.substring(atSymbolIndex + 1, caretPosition);
    }
    return theText;
  }

  var filterMenu = function (settings, event){
    var text = textAfterSymbol(settings);
    if (text != null){
      rebuildFilteredMenu(text, settings, event);
      if (settings.onFilter != null){
        if (text.length > 0){
          AtMenu.onFilterRun(settings);
        }
      }
    }
  }

  var rebuildFilteredMenu = function (text, settings, event){

    var allMenuItems = document.querySelectorAll(settings.items);
    var firstActivated = false;

    if (document.querySelector(".atm-item-active") != null){
        document.querySelector(".atm-item-active").classList.remove("atm-item-active");
    }

    for (var i = 0; i < allMenuItems.length; i++){

        var itemText = allMenuItems[i].innerText.toLowerCase();

        if (itemText.includes(text.toLowerCase())){
          allMenuItems[i].classList.remove("atm-item-inactive");
            if (firstActivated == false){
                firstActivated = true;
                allMenuItems[i].classList.add("atm-item-active");
            }
        } else {
          allMenuItems[i].classList.add("atm-item-inactive");
        }

    }

    if (firstActivated == false){
        if (document.querySelector(".atm-item-active") != null){
            document.querySelector(".atm-item-active").classList.remove("atm-item-active");
        }
    }

    checkMenuItemVisible(settings);

  }

  var onChooseSetup = function(settings){
    var allMenuItems = document.querySelectorAll(settings.items);

    [].forEach.call(allMenuItems, function (item) {
      item.setAttribute("onclick", "AtMenu.onChooseRun('" + settings.targetId + "', this)");
    });
  }

  var isObject = function(value) {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  /**
   * A public method
   */

  publicMethods.getCaretPosition = function (settings) {
      
      //var caretPos = $(settings.target).textareaHelper('caretPos');
      var caretPos = getNewCaretPosition(settings.target);
      var targetPos = settings.target.getBoundingClientRect();
      var menuPos = settings.menu.getBoundingClientRect();
      
      var position = {
          "caret": caretPos,
          "target": targetPos,
          "menu": menuPos,
          "html": document.querySelector("html").scrollTop
      }
      return position;
  };

  var getNewCaretPosition = function(textarea){
    // Create a hidden element with the same font and styling as the textarea
    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.style.font = window.getComputedStyle(textarea, null).getPropertyValue("font");
    span.style.fontSize = window.getComputedStyle(textarea, null).getPropertyValue("font-size");
    span.style.padding = window.getComputedStyle(textarea, null).getPropertyValue("padding");
    span.style.margin = window.getComputedStyle(textarea, null).getPropertyValue("margin");
    span.style.boxSizing = window.getComputedStyle(textarea, null).getPropertyValue("box-sizing");
    span.style.wordSpacing = window.getComputedStyle(textarea, null).getPropertyValue("word-spacing");
    span.style.textTransform = window.getComputedStyle(textarea, null).getPropertyValue("text-transform");
    span.style.direction = window.getComputedStyle(textarea, null).getPropertyValue("direction");
    span.style.textIndent = window.getComputedStyle(textarea, null).getPropertyValue("text-indent");
    span.style.lineHeight = window.getComputedStyle(textarea, null).getPropertyValue("line-height");

    // Get the line that the caret is on
    const caret = textarea.selectionStart;
    const lines = textarea.value.substring(0, caret).split("\n");
    const currentLine = lines[lines.length - 1];

    // Insert the text up to the caret position on the current line into the hidden element
    span.textContent = currentLine;

    // Measure the width and height of the text in the hidden element
    document.body.appendChild(span);
    const left = span.offsetWidth;
    document.body.removeChild(span);

    // Get the line height and font size
    const lineHeight = parseFloat(window.getComputedStyle(textarea, null).getPropertyValue("line-height"));
    const fontSize = parseFloat(window.getComputedStyle(textarea, null).getPropertyValue("font-size"));

    // Calculate the top position based on the line height and font size
    const top = (lines.length - 1) * lineHeight + (lineHeight - fontSize) / 2;

    return { left: left, top: top };
  }

  publicMethods.onChooseRun = function (settings, item){

    if (!isObject(settings)){
      settings = allSettings.find(x => x.targetId == settings);
      var selectedItem = item;
    } else {
      var selectedItem = settings.menu.querySelector(".atm-item-active");
    }

    var evt = {
      "settings": settings,
      "event": event,
      "target": settings.target,
      "selectedItem": selectedItem,
      "typedText": textAfterSymbol(settings),
      "caretPos": this.getCaretPosition(settings)
    }

    settings.onChoose(evt)
    
  }

  publicMethods.onOpenRun = function (settings){

    var evt = {
      "settings": settings,
      "event": event,
      "target": settings.target,
      "typedText": textAfterSymbol(settings),
      "caretPos": this.getCaretPosition(settings)
    }

    settings.onOpen(evt)

  }

  publicMethods.onCloseRun = function (settings){

    var evt = {
      "settings": settings,
      "event": event,
      "target": settings.target,
      "typedText": textAfterSymbol(settings),
      "caretPos": this.getCaretPosition(settings)
    }

    settings.onClose(evt)

  }

  publicMethods.onFilterRun = function (settings){

    var evt = {
      "settings": settings,
      "event": event,
      "target": settings.target,
      "typedText": textAfterSymbol(settings),
      "caretPos": this.getCaretPosition(settings)
    }

    settings.onFilter(evt)

  }

  publicMethods.insertContent = function(evt, content, replace = true){
    
    var settings = evt.settings;
    var theText = settings.target.value;
    const atSymbolIndex = theText.indexOf(settings.openMenu);
    const caretPosition = settings.target.selectionStart;

    const theLink = `${content}`;

    const replacedText = caretPosition - atSymbolIndex;
    const newText = theText.substring(0, atSymbolIndex) + theLink + theText.substring(caretPosition);
    settings.target.value = newText;

    closeMenuForced(settings);

    let theLinkPosition = caretPosition - replacedText + theLink.length;
    settings.target.focus();
    settings.target.setSelectionRange(theLinkPosition, theLinkPosition);

  }

  /**
   * Another public method
   */

  var allSettings = new Array();

  publicMethods.init = function ( options ) {
      
      // Merge user options with defaults
      var settings = extend( defaults, options || {} );
      
      settings.targetId = options.target;
      settings.menuId = options.menu;
      settings.target = document.querySelector(options.target);
      settings.menu = document.querySelector(options.menu);

      allSettings.push(settings);

      // Add default class to children
      if (settings.items == ".atm-item"){
        addDefaultClasses(settings);
      }

      // Add Events
      if (settings.onChoose != null){
        onChooseSetup(settings);
      }

      // Listen for input events on the target
      settings.target.addEventListener( 'input', function (event){

          // Check for opening the Menu
          openMenu(settings, event);

          // Filter List
          filterMenu(settings, event);

      }, false );

      // Listen for keydown events on the target
      settings.target.addEventListener( 'keydown', function (event){

        if (settings.menu.classList.contains("atm-menu-active")){
          // Check for closing the Menu
          closeMenu(settings, event);

          // Check Enter
          enterCheck(settings, event);

          // Check Backspace
          backspaceCheck(settings, event);

          // Check Move UP
          moveUpCheck(settings, event);

          // Check Move Down
          moveDownCheck(settings, event);

        }
        
    }, false );

      
  };


  //
  // Public APIs
  //

  return publicMethods;

});
