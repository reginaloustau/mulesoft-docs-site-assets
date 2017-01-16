var SCREEN_SMALL_MAX = 992;
$.fn.reverse = Array.prototype.reverse;

$(function() {
    initSubHeader();
    // QUESTION should initSiteNav come before initSubHeader? Keep in mind, initSubHeader collapses nav
    initSiteNav();
    initContentToc();
    fixEncoding();
    $('body').show();
});

$(window).load(function() {
    initFancyBox();
});

function initFancyBox() {
    $(document).bind('page:change', function() {
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
    var header = $('.header'),
        subHeader = $('.sub-header'),
        container = $('.container'),
        footer = $('.footer'),
        treeIcon = $('.tree-icon'),
        searchField = $('.search-field'),
        updateSubHeaderStatus = function(e) {
            container.toggleClass('affixed-sub-header', e.type !== 'affixed-top');
        },
        onResize = function() {
            subHeader.css('width', container.css('width'));
            updateAffixOffset(); // NOTE header and footer height change based on screen size
            if (isSmallScreen() && !treeIcon.hasClass('tree-closed')) toggleSiteNav();
        },
        calcAffixOffset = function() {
            return { top: header.height(), bottom: footer.outerHeight() };
        },
        updateAffixOffset = function() {
            subHeader.data('bs.affix').options.offset = calcAffixOffset();
        };

    treeIcon.click(toggleSiteNav);

    subHeader.affix({ offset: calcAffixOffset() });
    updateSubHeaderStatus({ type: subHeader.hasClass('affix-top') ? 'affixed-top' : 'affixed' });
    // NOTE capture transition between static and fixed/absolute positioning of sub-header
    subHeader.on('affixed-top.bs.affix affixed.bs.affix affixed-bottom.bs.affix', updateSubHeaderStatus);
    onResize();
    $(window).resize(onResize);

    searchField.data('placeholder', searchField.attr('placeholder'));
    searchField.focus(function() {
        searchField.attr('placeholder', '');
    });
    searchField.blur(function() {
        searchField.attr('placeholder', searchField.data('placeholder'));
    });
}

function initContentToc() {
    var toc = $('.scroll-menu');
    if (!toc.length) return;

    var header = $('.header'),
        subHeader = $('.sub-header'),
        footer = $('.footer'),
        notificationBar = $('.older-version-notification'),
        tocMargin = { top: parseFloat(toc.css('margin-top')), bottom: parseFloat(toc.css('margin-bottom')) },
        flowTocHeight = function(force) {
            if (!(force || toc.hasClass('affix-top'))) return; // guards against race condition w/ scroll event
            toc.css('max-height', window.innerHeight - (toc.offset().top - $(window).scrollTop()) - tocMargin.bottom);
        },
        lockTocHeight = function() {
           toc.css('max-height', window.innerHeight - subHeader.height() - tocMargin.top - tocMargin.bottom);
        },
        updateTocHeight = function(e) {
            if (isSmallScreen()) { // !toc.is(':visible') is implied
                if (e.type === 'resize') {
                    updateAffixOffset(); // NOTE header and footer height change based on screen size
                    $(window).off('scroll', flowTocHeight);
                    toc.css('max-height', '');
                }
                return;
            }
            var type = e.type;
            if (type === 'resize') {
                updateAffixOffset(); // NOTE header and footer height change based on screen size
                // NOTE for drastic movements, the positioning logic sometimes needs a little nudge.
                // Specifically, trigger deferred handler one extra time to correct affix-bottom
                // positioning when toggling window between small & large screen size.
                toc.trigger('click.bs.affix.data-api');
            }
            if (type === 'affixed-top' || (type === 'resize' && toc.hasClass('affix-top'))) {
                $(window).off('scroll', flowTocHeight).scroll(flowTocHeight);
                flowTocHeight(true);
            }
            else {
                $(window).off('scroll', flowTocHeight);
                lockTocHeight();
            }
        },
        calcAffixOffset = function() {
            return { top: header.height() + notificationBar.outerHeight(), bottom: footer.outerHeight() + tocMargin.bottom };
        },
        updateAffixOffset = function() {
            toc.data('bs.affix').options.offset = calcAffixOffset();
        },
        // TODO might be nicer to scroll only when necessary to bring element into view
        scrollToActiveLink = function(scrollTo) {
            if (toc.data('scrolling-to') === scrollTo) return;
            toc.stop('fx.toc.scroll', true).data('scrolling-to', scrollTo).animate({ scrollTop: scrollTo }, {
                queue: 'fx.toc.scroll',
                duration: 250,
                complete: function() { $(this).removeData('scrolling-to'); }
            }).dequeue('fx.toc.scroll');
        };

    // NOTE order of event registration is intentional; affixed events only triggered if subject is visible
    toc.on('affixed-top.bs.affix affixed.bs.affix affixed-bottom.bs.affix', updateTocHeight);
    toc.affix({ offset: calcAffixOffset() });
    $(window).resize(updateTocHeight);

    // TODO update active link on resize as well
    // TODO disable while page is being scrolled to target of clicked item
    $(window).scroll(function() {
        if (!toc.is(':visible')) return;
        var links = toc.find('.scroll-menu-link'),
            windowScrollY = $(this).scrollTop(),
            // QUESTION is there a more stable way to calculate cushion?
            cushion = parseFloat($('.sub-header + .row').css('margin-top')) + 20,
            scrollMax = toc[0].scrollHeight - toc.height(),
            scrollable = scrollMax > 0,
            matchFound, linkTop;
        links.removeClass('active').reverse().each(function() {
            var target = $(this.hash);
            if (target.length && windowScrollY >= target.offset().top - cushion) {
                $(this).addClass('active');
                if (scrollable && (linkTop = $(this).position().top)) {
                    var scrollFrom = toc.scrollTop(),
                        scrollTo = scrollFrom + linkTop;
                    if (scrollTo < scrollMax || (scrollTo >= scrollMax && scrollFrom < scrollMax)) {
                        scrollToActiveLink(scrollTo);
                    }
                }
                return !(matchFound = true);
            }
        });
        if (!matchFound && links.length) {
            if (scrollable && toc.scrollTop()) scrollToActiveLink(0);
            // NOTE enable the following line to highlight first element if no element is matched
            //links.last().addClass('active');
        }
    });

    toc.find('.scroll-menu-link').click(function(e) {
        e.preventDefault();
        var target = $(this.hash);
        if (target.length) {
            // NOTE we assume that any amount of scrolling pushes us to a fixed sub-header
            $('html, body').animate({ scrollTop: target.offset().top - subHeader.height() }, 250);
            history.pushState({}, '', this.hash);
        }
    });
}

function toggleSiteNav(e) {
    if (e) e.preventDefault();
    (e ? $(this) : $('.tree-icon')).toggleClass('tree-closed');
    var navColumn = $('.sidebar-nav'),
        nav = navColumn.find('nav');
        action = navColumn.is(':visible') ? 'close' : 'open',
        toc = $('.scroll-menu'),
        tocContainer = null,
        articleContentColumn = $('.article-content'),
        articleCols = action === 'open' ? { from: 'col-md-10', to: 'col-md-7' } : { from: 'col-md-7', to: 'col-md-10' },
        speed = 250;
    if (isSmallScreen()) {
        navColumn.toggle();
        articleContentColumn.removeClass(articleCols.from).addClass(articleCols.to);
        // TODO can we skip placing scroll marker if it's already placed?
        if (action === 'open') place_scroll_marker(nav.find('li.active'), 'active-marker');
        return;
    }
    // NOTE keep toc from jumping while width of sidebar transitions
    if (toc.length) {
        var tocContainerOffset = (tocContainer = toc.parent()).offset();
        tocContainer.css({ position: 'absolute', top: tocContainerOffset.top, left: tocContainerOffset.left });
        if (toc.hasClass('affix')) toc.css('left', toc.offset().left);
    }
    var fromContentWidth = articleContentColumn[0].getBoundingClientRect().width;
    articleContentColumn.removeClass(articleCols.from).addClass(articleCols.to);
    if (action === 'open') {
        // NOTE open menu temporarily to collect measurements
        navColumn.show();
        nav.trigger('init');
        // TODO can we skip placing scroll marker if it's already placed?
        place_scroll_marker(nav.find('li.active'), 'active-marker');
        navColumn.hide();
    }
    var toContentWidth = articleContentColumn[0].getBoundingClientRect().width;
    articleContentColumn.css('width', fromContentWidth);
    navColumn.animate({ width: 'toggle', opacity: 'toggle' }, {
        queue: 'fx.sidebar',
        duration: speed,
        // NOTE set overflow to visible to prevent nav in fixed position from disappearing in WebKit
        start: function() { navColumn.css('overflow', 'visible'); },
        // NOTE keep toc position synchronized throughout animation (used primarily when near bottom of page)
        progress: function() { toc.trigger('scroll.bs.affix.data-api'); },
        complete: function() {
            if (toc.length) {
                tocContainer.css({ position: '', top: '', left: '' })
                toc.css('left', '');
            }
            toc.trigger('scroll.bs.affix.data-api');
        }
    });
    articleContentColumn.animate({ width: toContentWidth }, {
        queue: 'fx.sidebar',
        duration: speed,
        complete: function() {
            articleContentColumn.css('width', '');
            toc.trigger('scroll.bs.affix.data-api');
        }
    });
    $([navColumn[0], articleContentColumn[0]]).dequeue('fx.sidebar');
}

function initSiteNav() {
    var nav = $('.sidebar-nav nav'),
        header = $('.header'),
        subHeader = $('.sub-header'),
        footer = $('.footer'),
        article = $('.article-content'),
        notificationBar = $('.older-version-notification'),
        calcArticleHeight = function() {
            return article.outerHeight() + notificationBar.outerHeight();
        },
        articleHeight = calcArticleHeight(),
        flowNavHeight = function(force) {
            if (!(force || nav.hasClass('affix-top'))) return; // guards against race condition w/ scroll event
            var navHeight = Math.min(articleHeight, window.innerHeight - (nav.offset().top - $(window).scrollTop()));
            // NOTE using height instead of max-height provides a slighly smoother experience
            // NOTE due to layout, height of sidebar column must exceed height of notification bar
            //nav.css('height', navHeight).parent().css('height', navHeight);
        },
        lockNavHeight = function() {
            var navHeight = Math.min(articleHeight, window.innerHeight - subHeader.height());
            // NOTE using height instead of max-height provides a slighly smoother experience
            // NOTE due to layout, height of sidebar column must exceed height of notification bar
            //nav.css('height', navHeight).parent().css('height', navHeight);
        },
        updateNavWidth = function() {
            nav.css('width', Math.floor(nav.parent()[0].getBoundingClientRect().width));
        },
        electAffixBehavior = function(e) {
          // NOTE effectively disable affix behavior when nav height is constrained to article column height
          if (nav.height() === articleHeight) {
            nav.data('bs.affix').affixed = false;
            nav.removeClass('affix affix-bottom').addClass('affix-top');
            e.preventDefault();
          }
        },
        updateNavDimensions = function(e) {
            if (isSmallScreen()) {
                if (e.type === 'resize') {
                    updateAffixOffset(); // NOTE header and footer height change based on screen size
                    $(window).off('scroll', flowNavHeight);
                    nav.css({ 'width': '', 'height': '' }).parent().css('height', '');
                }
                return;
            }
            var type = e.type;
            if (type === 'resize') {
                updateAffixOffset(); // NOTE header and footer height change based on screen size
                if (!nav.is(':visible')) return;
                updateNavWidth(); // NOTE always set width as it corrects bleed in WebKit caused by scrollbar
                articleHeight = calcArticleHeight();
                if (nav.hasClass('affix-top')) type = 'affixed-top';
            }
            else if (type === 'init') {
                updateNavWidth(); // NOTE always set width as it corrects bleed in WebKit caused by scrollbar
                articleHeight = calcArticleHeight();
                if (nav.hasClass('affix-top')) type = 'affixed-top';
            }
            // NOTE for drastic movements, the positioning logic sometimes needs a little nudge
            else if (type !== 'affixed') nav.trigger('click.bs.affix.data-api');

            if (type === 'affixed-top') {
                $(window).off('scroll', flowNavHeight).scroll(flowNavHeight);
                flowNavHeight(true);
            }
            else {
                $(window).off('scroll', flowNavHeight);
                lockNavHeight();
            }
        },
        calcAffixOffset = function() {
            return { top: header.height(), bottom: footer.outerHeight() };
        },
        updateAffixOffset = function() {
            nav.data('bs.affix').options.offset = calcAffixOffset();
        };

    // NOTE order of event registration is intentional
    nav.on('affix.bs.affix', electAffixBehavior);
    //nav.affix({ offset: calcAffixOffset() });
    // NOTE affixed events only triggered if subject is visible
    nav.on('init affixed-top.bs.affix affixed.bs.affix affixed-bottom.bs.affix', updateNavDimensions).trigger('init');
    $(window).resize(updateNavDimensions);

    //Collapse all lists
    nav.find('li:has(ul)').addClass('parent_li');
    openExpandedSubtree();

    if (isNotSmallScreen()) place_scroll_marker(nav.find('li.active'), 'active-marker');

    nav.find('li.parent_li > i').click(function(e) {
        e.preventDefault();
        if (nav.data('sliding')) return;
        var arrow = $(this),
            parent = arrow.parent(),
            children = parent.find('> ul'),
            activeItem = nav.find('li.active');

        nav.data('sliding', true);

        // Hide sublist
        if (children.is(':visible')) {
            children.slideUp({
              duration: 'fast',
              progress: function() { place_scroll_marker(activeItem, 'active-marker'); },
              complete: function() {
                // Remove active trail from the node to the children
                parent.removeClass('expanded').find('li.expanded').removeClass('expanded');
                arrow.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
                nav.removeData('sliding');
              }
            });

            // Hide active-marker
            if (children.find('li.active').length) {
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 100);
            }
        }
        // Show sublist
        else {
            children.slideDown({
              duration: 'fast',
              progress: function() { place_scroll_marker(activeItem, 'active-marker'); },
              complete: function() { nav.removeData('sliding'); }
            });
            parent.addClass('expanded');
            arrow.removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

            if (children.find('li.active').is(':visible')) {
                $('.active-marker').animate({ width: 'toggle', opacity: 'toggle' }, 250);
            }
        }
    });

    nav.find('li').hover(function() {
        // NOTE we seem to have to show before placing for this to work
        nav.find('.marker').show();
        place_scroll_marker($(this), 'marker');
    }, function() {
        if (!$('.tree').is(':hover')) nav.find('.marker').hide();
    });

    function openExpandedSubtree() {
        nav.find('li.parent_li > ul').hide(0);
        nav.find('li.parent_li > i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
        nav.find('li.parent_li.expanded > ul').show(0);
        nav.find('li.parent_li.expanded > i').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
    }
}

function place_scroll_marker(el, markerClass) {
    if (!el.length) return;
    var nav = $('.sidebar-nav nav'),
        link = el.find('> a'),
        height = link.innerHeight() + parseInt(el.css('padding-top'), 10) + parseInt(el.css('padding-bottom'), 10);
    return nav.find('.' + markerClass)
        .offset({ top: el.offset().top })
        .height(height);
}

function isSmallScreen() {
    return window.innerWidth <= SCREEN_SMALL_MAX;
}

function isNotSmallScreen() {
    return window.innerWidth > SCREEN_SMALL_MAX;
}

function fixEncoding() {
    $('.article-content .listingblock .CodeRay .entity').each(function() {
        var curCont = $(this).text();
        $(this).html(curCont.replace('&amp;', '&'));
    });
}

// Marketo Last campaing
tsh = new trafficSourceHelper();
tsh.createCookies();
lastCampaign({domain: '.mulesoft.com'});

if (typeof MktoForms2 === 'object') {
    MktoForms2.whenReady(function (form) {

        // Add hidden fields
        form.addHiddenFields({
            Web_Campaign__c: getCookieForMarketo('utm_campaign'),
            Web_Source__c: getCookieForMarketo('utm_source'),
            Webmeduim__c: getCookieForMarketo('utm_medium'),
            Web_Keyword__c: getCookieForMarketo('utm_term'),
            Web_Content__c: getCookieForMarketo('utm_content')
        });
    });
}

