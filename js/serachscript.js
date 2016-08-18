jQuery(document).ready(function(){

  //jQuery('.header_nav_search .search-icon').unbind('click').click(function(i) {
  //  alert("test");
  //  i.stopPropagation();
  //  var t = 'slide',
  //    a = {
  //      direction: 'left'
  //    };
  //  var s = 500;
  //  jQuery('.header_nav_search .st-default-search-input').toggle(t, a, s, function() {
  //    jQuery('.header_nav_search .st-default-search-input').is(':visible') ? jQuery('.header_nav_search .search-icon.icon-muletheme-search2').css('background-position', 'calc(-190px) -33px') : jQuery('.header_nav_search .search-icon.icon-muletheme-search2').css('background-position', 'calc(-888px) -33px')
  //  }).focus()
  //});

  jQuery( ".header_nav_search .search-icon" ).click(function() {
    //alert("test");
    var t = 'slide',
        a = {
          direction: 'left'
        };
      var s = 500;
    jQuery(".header_nav_search .searchbox").toggle(t, a, s);
    //jQuery(".header_nav_search .searchbox").slideToggle("slow");
    //$(".header_nav_search .searchbox").animate({
    //  width: "toggle"
    //});
  });

});