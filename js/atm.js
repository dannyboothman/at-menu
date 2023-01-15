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
        "openMenu": "@", // @ - Key to open the menu
        "closeMenu": "Escape" // 27 - Key to close the menu
    };


    //
    // Methods
    //

    /**
     * Merge two or more objects. Returns a new object.
     * @private
     * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
     * @param {Object}   objects  The objects to merge together
     * @returns {Object}          Merged values of defaults and options
     */
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
        if (location.href == 'http://127.0.0.1:5500/index.html'){
            console.log(message);
        }
    }
    // Close Menu
    var closeMenu = function (settings, event) {
        //logger(event);
        if (event.code == settings.closeMenu){
            //logger("Close Menu");
            settings.menu.classList.remove("atm-menu-active");
        }
    };
    // Open Menu
    var openMenu = function (settings, event) {
        //logger(event);
        if (event.data == "@" || event.key == "@"){
            //logger("Open Menu");
            var position = AtMenu.getCaretPosition(settings.target);
            logger(position);
            settings.menu.style.top = position.caret.top + position.target.top + position.html + 20 + "px";
            settings.menu.style.left = position.caret.left + position.target.left + "px";
            settings.menu.classList.add("atm-menu-active");
        }
    };

    /**
     * A public method
     */
    publicMethods.doSomething = function () {
        somePrivateMethod();
        // Code goes here...
        console.log(settings);
    };

    publicMethods.getCaretPosition = function (target) {
        logger(target);
        var caretPos = $(target).textareaHelper('caretPos');
        var targetPos = target.getBoundingClientRect();
        /*logger(caretPos);
        logger(targetPos);*/
        var position = {
            "caret": caretPos,
            "target": targetPos,
            "html": document.querySelector("html").scrollTop
        }
        return position;
    };

    /**
     * Another public method
     */
    publicMethods.init = function ( options ) {
        
        // Merge user options with defaults
        var settings = extend( defaults, options || {} );
        logger(settings);

        // Listen for click events
        settings.target.addEventListener( 'keydown', function (event){
            
            // Check for closing the Menu
            closeMenu(settings, event);

            // Check for opening the Menu
            openMenu(settings, event)
;
        }, false );

        // Code goes here...
        //
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