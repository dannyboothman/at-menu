

var theTextarea = document.getElementById("atm");
var theTextareaMenu = document.getElementById("atm-menu");

AtMenu.init({
    "target": theTextarea, // id-class-querySelector of textarea, input, etc
    "menu": theTextareaMenu,  // id-class-querySelector of the menu
    "openMenu": "@", // @ - Key to open the menu
    "closeMenu": "Escape",  // 27 - Key to close the menu
    "menuItem": "atm-item"
});


