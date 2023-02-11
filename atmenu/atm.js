
/*
 * At Menu
 * Copyright 2023 Daniel Boothman
 * www.atmenujs.com
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
      "marginTop": 20 // margin above the menu so that it's not over the line of text/ openMenu key
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
      }
  };

  var closeMenuForced = function (settings){
    settings.menu.classList.remove("atm-menu-active");
  }

  // Open Menu
  var openMenu = function (settings, event) {

      const text = settings.target.value;
      const cursorPos = settings.target.selectionStart;

      if (text[cursorPos - 1] === settings.openMenu) {
          var position = AtMenu.getCaretPosition(settings.target);
          
          var marginTop = defaults.marginTop;
          if (settings.marginTop){
            marginTop = settings.marginTop;
          }

          settings.menu.style.top = position.caret.top + position.target.top + position.html + marginTop + "px";
          settings.menu.style.left = position.caret.left + position.target.left + "px";
          settings.menu.classList.add("atm-menu-active");
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

  publicMethods.getCaretPosition = function (target) {
      
      var caretPos = $(target).textareaHelper('caretPos');
      var targetPos = target.getBoundingClientRect();
      
      var position = {
          "caret": caretPos,
          "target": targetPos,
          "html": document.querySelector("html").scrollTop
      }
      return position;
  };

  publicMethods.onChooseRun = function (settings, item){
    
    console.log(settings);
    console.log(item)

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
      "caretPos": this.getCaretPosition(settings.target)
    }

    settings.onChoose(evt)
    
  }

  publicMethods.insertContent = function(evt, content, replace = true){
    
    var settings = evt.settings;
    var theText = settings.target.value;
    const atSymbolIndex = theText.indexOf(settings.openMenu);
    const caretPosition = settings.target.selectionStart;

    const theLink = `${content}`;

    const newText = theText.substring(0, atSymbolIndex) + theLink + theText.substring(caretPosition);
    settings.target.value = newText;

    closeMenuForced(settings);

    let theLinkPosition = settings.target.value.indexOf(theLink);
    theLinkPosition = theLinkPosition + theLink.length;
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




(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
      // Node/CommonJS
      module.exports = factory(require('jquery'));
  } else {
      // Browser globals
      factory(jQuery);
  }
}(function ($) {
  'use strict';
  var caretClass   = 'textarea-helper-caret'
    , dataKey      = 'textarea-helper'

    // Styles that could influence size of the mirrored element.
    , mirrorStyles = [ 
                      // Box Styles.
                      'box-sizing', 'height', 'width', 'padding-bottom'
                    , 'padding-left', 'padding-right', 'padding-top'
  
                      // Font stuff.
                    , 'font-family', 'font-size', 'font-style' 
                    , 'font-variant', 'font-weight'
  
                      // Spacing etc.
                    , 'word-spacing', 'letter-spacing', 'line-height'
                    , 'text-decoration', 'text-indent', 'text-transform' 
                    
                      // The direction.
                    , 'direction'
                    ];

  var TextareaHelper = function (elem) {
    if (elem.nodeName.toLowerCase() !== 'textarea') return;
    this.$text = $(elem);
    this.$mirror = $('<div/>').css({ 'position'    : 'absolute'
                                  , 'overflow'    : 'auto'
                                  , 'white-space' : 'pre-wrap'
                                  , 'word-wrap'   : 'break-word'
                                  , 'top'         : 0
                                  , 'left'        : -9999
                                  }).insertAfter(this.$text);
  };

  (function () {
    this.update = function () {

      // Copy styles.
      var styles = {};
      for (var i = 0, style; style = mirrorStyles[i]; i++) {
        styles[style] = this.$text.css(style);
      }
      this.$mirror.css(styles).empty();
      
      // Update content and insert caret.
      var caretPos = this.getOriginalCaretPos()
        , str      = this.$text.val()
        , pre      = document.createTextNode(str.substring(0, caretPos))
        , post     = document.createTextNode(str.substring(caretPos))
        , $car     = $('<span/>').addClass(caretClass).css('position', 'absolute').html('&nbsp;');
      this.$mirror.append(pre, $car, post)
                  .scrollTop(this.$text.scrollTop());
    };

    this.destroy = function () {
      this.$mirror.remove();
      this.$text.removeData(dataKey);
      return null;
    };

    this.caretPos = function () {
      this.update();
      var $caret = this.$mirror.find('.' + caretClass)
        , pos    = $caret.position();
      if (this.$text.css('direction') === 'rtl') {
        pos.right = this.$mirror.innerWidth() - pos.left - $caret.width();
        pos.left = 'auto';
      }

      return pos;
    };

    this.height = function () {
      this.update();
      this.$mirror.css('height', '');
      return this.$mirror.height();
    };

    // XBrowser caret position
    // Adapted from http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
    this.getOriginalCaretPos = function () {
      var text = this.$text[0];
      if (text.selectionStart) {
        return text.selectionStart;
      } else if (document.selection) {
        text.focus();
        var r = document.selection.createRange();
        if (r == null) {
          return 0;
        }
        var re = text.createTextRange()
          , rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
      } 
      return 0;
    };

  }).call(TextareaHelper.prototype);
  
  $.fn.textareaHelper = function (method) {
    this.each(function () {
      var $this    = $(this)
        , instance = $this.data(dataKey);
      if (!instance) {
        instance = new TextareaHelper(this);
        $this.data(dataKey, instance);
      }
    });
    if (method) {
      var instance = this.first().data(dataKey);
      return instance[method]();
    } else {
      return this;
    }
  };

}));

