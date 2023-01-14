

var theTextarea = document.getElementById("atm");
var theTextareaMenu = document.getElementById("atm-menu");

AtMenu.init({
    "target": theTextarea,
    "menu": theTextareaMenu,
    "openMenu": "@",
    "closeMenu": "Escape" // 27 keycoe
});


