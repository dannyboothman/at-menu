AtMenu.init({
    "target": "#atm",
    "menu": "#atm-menu",
    "onChoose": function(evt){
        var selectMenuItemText = evt.selectedItem.innerText;
        AtMenu.insertContent(evt, selectMenuItemText);
    }
});