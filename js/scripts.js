var SCREEN_SMALL_MAX = 992;
$.fn.reverse = Array.prototype.reverse;

$(function() {
    initSubHeader();
    // QUESTION should initSidebarNav come before initSubHeader?
    initSidebarNav();
    initSidebarToc();
    fixEncoding();
    $('body').show();
});

$(window).load(function() {
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
    var container = $('.container'),
        subHeader = $('.sub-header'),
        treeIcon = $('.tree-icon'),
        searchField = $('.search-field'),
        updateSubHeaderWidth = function() {
            subHeader.css('width', container.css('width'));
            if (!(window.innerWidth > SCREEN_SMALL_MAX || treeIcon.hasClass('tree-closed'))) toggleSidebarNav();
        };

    treeIcon.click(toggleSidebarNav);

    updateSubHeaderWidth();
    $(window).resize(updateSubHeaderWidth);

    subHeader.affix({ offset: {
        top: $('.header').height(),
        bottom: $('.footer').outerHeight(true)
    }});
    container.toggleClass('affixed-sub-header', !subHeader.hasClass('affix-top'));
    // NOTE capture transition between static and fixed positioning of sub-header
    subHeader.on('affixed-top.bs.affix affixed.bs.affix', function(e) {
        container.toggleClass('affixed-sub-header', e.type !== 'affixed-top');
    });

    searchField.data('placeholder', searchField.attr('placeholder'));
    searchField.focus(function() {
        searchField.attr('placeholder', '');
    });
    searchField.blur(function() {
        searchField.attr('placeholder', searchField.data('placeholder'));
    });
}

function toggleSidebarNav(e) {
    if (e) e.preventDefault();
    (e ? $(this) : $('.tree-icon')).toggleClass('tree-closed');
    var sidebarNav = $('.sidebar-nav'),
        sidebarNavOpen = sidebarNav.is(':visible'),
        sidebarNavContent = sidebarNav.find('nav');
        toc = $('.scroll-menu'),
        tocParent = null,
        articleContent = $('.article-content'),
        articleCols = sidebarNavOpen ? { from: 'col-md-7', to: 'col-md-10' } : { from: 'col-md-10', to: 'col-md-7' },
        speed = 250;
    if (window.innerWidth <= SCREEN_SMALL_MAX) {
        sidebarNav.toggle();
        articleContent.removeClass(articleCols.from).addClass(articleCols.to);
        if (!sidebarNavOpen) place_scroll_marker(sidebarNavContent.find('li.active'), 'active-marker');
        return;
    }
    // NOTE keep toc from jumping while width of sidebar transitions
    if (toc.length) {
        var tocParentOffset = (tocParent = toc.parent()).offset();
        tocParent.css({ position: 'absolute', top: tocParentOffset.top, left: tocParentOffset.left });
        if (toc.hasClass('affix')) toc.css('left', toc.offset().left);
    }
    if (sidebarNavOpen) { // close
        sidebarNavContent.css('width', sidebarNavContent[0].getBoundingClientRect().width);
    }
    else { // open
        sidebarNav.show();
        sidebarNavContent.css('width', sidebarNavContent[0].getBoundingClientRect().width);
        sidebarNav.hide();
    }
    var fromContentWidth = articleContent[0].getBoundingClientRect().width;
    articleContent.removeClass(articleCols.from).addClass(articleCols.to);
    var toContentWidth = articleContent[0].getBoundingClientRect().width;
    articleContent.css('width', fromContentWidth);
    sidebarNav.animate({ width: 'toggle', opacity: 'toggle' }, {
        queue: 'fx.sidebar',
        duration: speed,
        progress: function() {
            // NOTE keep toc position synchronized throughout animation (used primarily when near bottom of page)
            toc.trigger('scroll.bs.affix.data-api');
        },
        complete: function() {
            sidebarNavContent.css('width', '');
            if (toc.length) {
                tocParent.css({ position: '', top: '', left: '' })
                toc.css('left', '');
            }
            toc.trigger('scroll.bs.affix.data-api');
            // FIXME think about whether we can skip this step in certain cases; perhaps first time only?
            if (!sidebarNavOpen) place_scroll_marker(sidebarNavContent.find('li.active'), 'active-marker');
        }
    });
    articleContent.animate({ width: toContentWidth }, {
        queue: 'fx.sidebar',
        duration: speed,
        complete: function() {
            articleContent.css('width', '');
            toc.trigger('scroll.bs.affix.data-api');
        }
    });
    $([sidebarNav[0], articleContent[0]]).dequeue('fx.sidebar');
}

function initSidebarToc() {
    var scrollMenu = $('.scroll-menu');
    if (!scrollMenu.length) return;

    // FIXME update max-height on resize
    scrollMenu.css('max-height', window.innerHeight - scrollMenu.offset().top);
    scrollMenu.affix({ offset: {
        top: $('.header').height(),
        bottom: $('.footer').outerHeight(true) + parseFloat(scrollMenu.css('margin-bottom'))
    }});

    $(window).scroll(function() {
        var menuLinks = $('.scroll-menu .scroll-menu-link'),
            scrollY = $(this).scrollTop(),
            // QUESTION is there a more stable way to calculate cushion?
            cushion = parseFloat($('.sub-header + .row').css('margin-top')) + 20,
            matchFound = false;
        menuLinks.removeClass('active');
        menuLinks.reverse().each(function() {
            if (scrollY >= $(this.hash).offset().top - cushion) {
                $(this).addClass('active');
                return !(matchFound = true);
            }
        });
        // NOTE enable the following code to always highlight first element if no element is matched
        //if (!matchFound && menuLinks.length) menuLinks.last().addClass('active');
    });

    scrollMenu.find('.scroll-menu-link').click(function(e) {
        e.preventDefault();
        var target = $(this.hash);
        if (target.length) {
            // NOTE we assume that any amount of scrolling pushes us to a fixed sub-header
            $('html, body').animate({ scrollTop: target.offset().top - $('.sub-header').height() }, 300);
            history.pushState({}, '', this.hash);
        }
    });
}

/* Setting sidebar tree nav */
function initSidebarNav() {

    //Collapse all lists
    $('.sidebar-nav nav li:has(ul)').addClass('parent_li');
    openExpandedSubtree();

    if (window.innerWidth > SCREEN_SMALL_MAX) {
        // FIXME can we make it work without this setTimeout?
        setTimeout(function() { place_scroll_marker($('.sidebar-nav nav li.active'), 'active-marker'); }, 0);
    }

    $('.sidebar-nav nav li.parent_li > i').click(function(e) {
        e.preventDefault();
        var parent = $(this).parent('li.parent_li'),
            children = parent.find('> ul');

        place_scroll_marker(parent, 'marker');

        // Show/hide a sublist
        if (children.is(':visible')) {
            children.slideUp('fast');
            $(this).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');

            /* Remove active trail from the node to the childrens */
            parent.removeClass('expanded');
            parent.find('li.expanded').removeClass('expanded');

            // Hide active-marker
            if (children.find('.active').length) {
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 100);
            }

        } else {
            children.slideDown('fast');
            $(this).removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
            parent.addClass('expanded');

            if (children.find('.active').is(':visible')){
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 250);
            }
        }
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
        $('.sidebar-nav nav li.parent_li > i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
        $('.sidebar-nav nav li.parent_li.expanded > ul').show(0);
        $('.sidebar-nav nav li.parent_li.expanded > i').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
    }
}

function place_scroll_marker(elem, markerClass) {
    if (!elem.length) return;
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
