jQuery(document).ready(function(){
  //alert("hello");
  jQuery('#open-left').sidr({
    side: 'right',
    speed: 200,
    onOpen: function() {
      jQuery('#sidr .search input.form-text').focus()
    },
    onClose: function() {
      jQuery('#sidr ul.menu li a.expanded div').click()
    }
  });
  jQuery('#sidr > ul.menu > li.is-expanded > a').each(function() {
    jQuery(this).addClass('first-links collapsed')
  });
  jQuery('#sidr > ul.menu > li li.is-expanded > a').each(function() {
    jQuery(this).addClass('first-links collapsed')
  });
  jQuery('#sidr ul.menu a.first-links').each(function() {
    jQuery(this).append('<div></div>')
  });
  jQuery('#sidr ul.menu li a.first-links.collapsed div').on('click',function() {
    var a = jQuery(this).parent().next();
    jQuery(this).parent().toggleClass('expanded');
    a.toggle();
    return !1
  });
  jQuery('#sidr ul.menu li a.first-links.expanded div').on('click',function() {
    var a = jQuery(this).parent().next();
    jQuery(this).parent().removeClass('expanded').addClass('collapsed');
    a.toggle();
    return !1
  });
  jQuery('.sidr .menu__item.is-expanded div').on('click',function() {
    jQuery(this).parent().parent().siblings().toggle()
  });
  jQuery('#sidr ul.menu > li ul li a div').on('click',function() {
    jQuery(this).parent().parent().parent().siblings('a').toggle()
  });
  jQuery('#sidr ul.menu > li > a div').on('click',function() {
    jQuery(this).parent().hasClass('expanded') ? jQuery('.search').hide() : jQuery('.search').show()
  })
  jQuery('#sidr ul.menu > li > ul > li > a div').on('click',function() {
    jQuery(this).parent().parent().hasClass('expanded') ? jQuery('.search').hide() : jQuery('.search').show()
  })
   // if(jQuery('#sidr ul.menu li.first a').hasClass('expanded') == TRUE) {
   //   jQuery('#sidr ul.menu li.first').css('margin-top',0);
   // }
   // else {
   //   jQuery('#sidr ul.menu li.first').css('margin-top','15px');
   // }
  jQuery('#sidr ul.menu li.first').css('margin-top', '15px');
  jQuery('#sidr ul.menu li.first a div').on('click',function() {
    //alert(jQuery(this).parent().hasClass('expanded'));
    jQuery(this).parent().hasClass('expanded') ? jQuery(this).parent().parent().css('margin-top', 0) : jQuery(this).parent().parent().css('margin-top', '15px')
  })
  //$('#open-left').sidr({
  //  //name: 'sidr-right',
  //  side: 'right'
  //});
});

