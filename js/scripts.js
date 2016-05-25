var SCREEN_SMALL_MAX = 992;

/* Initialization */
$(function() {
    initSubHeader();
    initSidebarNav();
    initScrollMenu();
    fixEncoding();
    $('body').show();
});

$( window ).load(function() {
    initFancyBox();
});


function initFancyBox () {

    $(document).bind('page:change', function(){
        $('.fancybox').fancybox({ parent: "body"})
    });

    $(".article-content span.image").each(function(index, value) {
        var natImgWidth = $(this).find('img').get(0).naturalWidth;
        if ( natImgWidth > 500 ) {
            var imgSrc = $(this).find('img').attr('src');
            $(this).replaceWith('<span class="image"><a class="fancybox" href="'+imgSrc+'"><img src="'+imgSrc+'"/></a></span>');
        }
    });
    $(".fancybox").fancybox();
}

function initSubHeader() {
    if (window.innerWidth < SCREEN_SMALL_MAX) toggleSidebarNav();

    //Fixed subheader
    $(window).resize(function(){
        $('.sub-header').css('width', $('.container').css('width'));
        scrollbarAdjusting();
        if (window.innerWidth < SCREEN_SMALL_MAX && !$('.tree-icon').hasClass('tree-closed')) {
            toggleSidebarNav();
        }
    });

    $(window).scroll(function() {
        var subheader = $('.sub-header'),
            container = $('.container');

        if ($(this).scrollTop() >= $('.header').height()) {
            subheader.css({
                'position': 'fixed',
                'z-index': '999',
                'top': '0',
                'width': container.css('width')
            });
            //container.css('margin-top', subheader.height());
            container.addClass('sub-header-fixed');
        }
        else {
            subheader.css('position', 'static');
            //container.css('margin-top', 0);
            container.removeClass('sub-header-fixed');
            $('.tree-icon').css('display', 'inline-block');
        }
    });

    //Tree Toggle button
    $('.tree-icon').unbind('click').click(toggleSidebarNav);

    //Remove Search input box placeholder on focus
    $('.search-field').focus(function(){
        $(this).data('placeholder',$(this).attr('placeholder'))
        $(this).attr('placeholder','');
    });
    $('.search-field').blur(function(){
        $(this).attr('placeholder',$(this).data('placeholder'));
    });
}

/*
function scrollbarAdjusting(){
    $('.scroll-menu').css('max-height',$(window).height() * .8 + 'px');
    var y = $(this).scrollTop();


    var collapse = y + $('.scroll-menu').height() > $('.footer').offset().top - 180;
    if(!collapse){
        $('.scroll-menu').css('top', y + 'px');
    }
    else {
        $('.scroll-menu').css('top', $('.footer').offset().top -  $('.scroll-menu').height() - 180 + 'px');
    }
}
*/

function scrollbarAdjusting(){
    $('.scroll-menu').css('max-height',$(window).height() * .8 + 'px');
    var y = $(this).scrollTop();
    var collapse = y + $('.scroll-menu').height() > $('.footer').offset().top - 190;
    if(collapse){
        $('.scroll-menu').css('position','absolute');
        $('.scroll-menu').css('top', $('.footer').offset().top -  $('.scroll-menu').height() - 190 + 'px');
    }
    else {
        $('.scroll-menu').css('position','fixed');
        $('.scroll-menu').css('top', '120px');
    }
}

function toggleSidebarNav(e) {
    if (e) e.preventDefault();
    (e ? $(this) : $('.tree-icon')).toggleClass('tree-closed');
    var sidebarNav = $('.sidebar-nav'),
        sidebarNavOpen = sidebarNav.is(':visible'),
        sidebarNavContent = sidebarNav.find('nav');
        toc = $('.scroll-menu'),
        articleContent = $('.article-content'),
        articleCols = {},
        speed = 250;
    // NOTE keep toc from jumping while width of sidebar transitions
    if (toc.length) toc.css('left', toc.offset().left);
    if (sidebarNavOpen) { // close
        articleCols = { from: 'col-md-7', to: 'col-md-10' }
        sidebarNavContent.css('width', sidebarNavContent[0].getBoundingClientRect().width);
    }
    else { // open
        articleCols = { from: 'col-md-10', to: 'col-md-7' }
        sidebarNav.show();
        sidebarNavContent.css('width', sidebarNavContent[0].getBoundingClientRect().width);
        sidebarNav.hide();
    }
    var fromContentWidth = articleContent[0].getBoundingClientRect().width;
    articleContent.removeClass(articleCols.from).addClass(articleCols.to);
    var toContentWidth = articleContent[0].getBoundingClientRect().width;
    articleContent.css('width', fromContentWidth);
    sidebarNav.animate({ width: 'toggle', opacity: 'toggle' }, { duration: speed, queue: false, complete: function() {
        if (toc.length) toc.css('left', '');
        sidebarNavContent.css('width', '');
        // FIXME think about whether we can skip this step in certain cases; perhaps first time only?
        if (!sidebarNavOpen) place_scroll_marker(sidebarNavContent.find('li.active'), 'active-marker');
    }});
    articleContent.animate({ width: toContentWidth }, { duration: speed, queue: false, complete: function() {
        articleContent.css('width', '');
    }});
}

function initScrollMenu(){

    scrollbarAdjusting();

    //Scroll-menu active links
    $(window).scroll(function () {

        scrollbarAdjusting();
        var y = $(this).scrollTop();

        $('.scroll-menu-link').each(function (event) {
            if (y < $($(this).attr('href')).offset().top) {
                var prev = $(this).prev();
                var activeElement =  prev.length == 0? $(this) : prev;
                $('.scroll-menu-link').removeClass('active');
                activeElement.addClass('active');
                return false;
            }
        });

    });


    //Scroll-menu smooth scroll
    $('.scroll-menu a[href*=#]:not([href=#])').click(function (e) {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            var nameVal = this.hash.slice(1);
            target = target.length ? target : $('[name=' + nameVal + ']');

            if (target.length) {
                $('html,body').animate({
                    scrollTop: (target.offset().top - 150)
                }, 300);
                history.pushState({}, null,'#' + nameVal);
                return false;
            }
        }


    });
}

/* Setting sidebar tree nav */
function initSidebarNav(){


    //Collapse all lists
    $('.sidebar-nav nav li:has(ul)').addClass('parent_li');
    openExpandedSubtree();

    if (window.innerWidth >= SCREEN_SMALL_MAX) {
        // FIXME can we make it work without this setTimeout?
        setTimeout(function() { place_scroll_marker($('.sidebar-nav nav li.active'), 'active-marker'); }, 0);
    }

    $('.sidebar-nav nav li.parent_li > i').on('click', function (e) {
        var parent = $(this).parent('li.parent_li'),
            children = parent.find('> ul');

        place_scroll_marker(parent, 'marker');

        // Show/hide a sublist
        if (children.is(':visible')) {
            children.slideUp('fast');
            $(this).addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');

            /* Remove active trail from the node to the childrens */
            parent.removeClass('expanded');
            parent.find('li.expanded').removeClass('expanded');

            // Hide active-marker
            if (children.find('.active').length) {
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 100);
            }

        } else {
            children.slideDown('fast');
            $(this).addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
            parent.addClass('expanded');

            if (children.find('.active').is(':visible')){
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 250);
            }
        }
        e.stopPropagation();
    });

    $('.sidebar-nav nav li').hover(function() {
        $('.marker').show();
        place_scroll_marker($(this), 'marker');
    },function() {
        if (!$('.tree').is(':hover')) {
            $('.marker').hide();
        }
    });

    function openExpandedSubtree(){
        $('.sidebar-nav nav li.parent_li > ul').hide(0);
        $('.sidebar-nav nav li.parent_li > i').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
        $('.sidebar-nav nav li.parent_li.expanded > ul').show(0);
        $('.sidebar-nav nav li.parent_li.expanded > i').addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
    }
}

function place_scroll_marker(elem, markerClass) {
    if (elem.length == 0) return;
    var offsetTop = elem.offset().top,
        offsetLeft = $(".tree").left,
        height = 0,
        link = elem.find("> a"),
        height = link.innerHeight() + parseInt(elem.css('padding-top'), 10) + parseInt(elem.css('padding-bottom'), 10);
    $(".sidebar-nav ." + markerClass).show();
    $(".sidebar-nav ." + markerClass).offset({top: offsetTop, left: offsetLeft});
    $(".sidebar-nav ." + markerClass).height(height);
}

function fixEncoding(){
    $('.article-content .listingblock .CodeRay .entity').each(function(){
        var curCont = $(this).text();
        $(this).html(curCont.replace('&amp;', '&'));
    });
}
