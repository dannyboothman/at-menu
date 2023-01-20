window.onload = (event) => { 
  document.querySelector("#docs_nav [href='" + location.pathname + "']").classList.add("docs_nav_current");
}

const copyCode = async (el) => {
    var container = el.closest(".ide");
    var code = container.querySelector(".ide_code_item_active pre code").innerText;
    try {
      await navigator.clipboard.writeText(code);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function changeTab(el){

    var tabIndex = [...el.parentElement.children].indexOf(el);
    console.log(tabIndex)
    var container = el.closest(".ide");

    container.querySelector(".ide_header_nav_item_active").classList.remove("ide_header_nav_item_active");
    container.querySelector(".ide_header_nav_item:nth-child(" + (tabIndex+1) + ")").classList.add("ide_header_nav_item_active");

    container.querySelector(".ide_code_item_active").classList.remove("ide_code_item_active");
    container.querySelector(".ide_code_item:nth-child(" + (tabIndex+1) + ")").classList.add("ide_code_item_active");
  }