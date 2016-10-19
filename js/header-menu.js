(function () {

  var $body = $('body');

  function toggleHeaderMenu() {
    $body.toggleClass('off-canvas--active');

    if (!$body.hasClass('off-canvas--active')) {
      // let animation finish, 1s is enough
      setTimeout(function () {
        $('.menu__item--active').removeClass('menu__item--active');
      }, 1000);
    }
  }

  $('body').click(function () {

    // clicks on body with propagation not stopped will hide headerMenu
    if ($body.hasClass('off-canvas--active')) {
      toggleHeaderMenu();
    }
  });

  $('.header__wrapper').click(function (e) {
    // don't let event propagate to body
    e.stopPropagation();
  });

  $('.header__hamburger').click(function (e) {
    toggleHeaderMenu();
    // don't let event propagate to body
    e.stopPropagation();
  });

  $('.menu__submenu-btn').click(function () {
    $(this).parents('.menu__item').eq(0).addClass('menu__item--active');
  });

  $('.menu__parentmenu-btn').click(function () {
    $(this).parents('.menu__item').eq(0).removeClass('menu__item--active');
  });
})();
