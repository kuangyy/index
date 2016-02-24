/**
 * ymframework 1.0.7
 * Full Featured Mobile HTML Framework For Building iOS Apps
 *
 * http://www.idangero.us/ymframework
 *
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under MIT
 *
 * Released on: June 20, 2015
 */
(function() {

    'use strict';
    /*===========================
    Framework
    ===========================*/
    window.ymframework = function(params) {

        // App
        var app = this;

        // Version
        app.version = '1.0.7';

        // Default Parameters
        app.params = {
            cache: true,
            cacheIgnore: [],
            cacheIgnoreGetParameters: false,
            cacheDuration: 1000 * 60 * 10, // Ten minutes
            preloadPreviousPage: true,
            uniqueHistory: false,
            uniqueHistoryIgnoreGetParameters: false,
            dynamicPageUrl: 'content-{{index}}',
            allowDuplicateUrls: false,
            // router: true,

            // Fast clicks
            fastClicks: true,
            fastClicksDistanceThreshold: 0,
            fastClicksDelayBetweenClicks: 50,
            // Tap Hold
            tapHold: false,
            tapHoldDelay: 750,
            tapHoldPreventClicks: true,
            // Active State
            activeState: true,
            activeStateElements: 'a, button, label, span',
            // Animate Nav Back Icon
            animateNavBackIcon: false,

            // Ajax
            ajaxLinks: undefined, // or CSS selector
            // External Links
            externalLinks: '.external', // CSS selector

            // Smart Select Back link template
            smartSelectBackTemplate: '<div class="left sliding"><a href="#" class="back link"><i class="icon icon-back"></i><span>{{backText}}</span></a></div>',
            smartSelectBackText: 'Back',
            smartSelectInPopup: false,
            smartSelectPopupCloseTemplate: '<div class="left"><a href="#" class="link close-popup"><i class="icon icon-back"></i><span>{{closeText}}</span></a></div>',
            smartSelectPopupCloseText: 'Close',
            smartSelectSearchbar: false,
            smartSelectBackOnSelect: false,
            // Tap Navbar or Statusbar to scroll to top
            scrollTopOnNavbarClick: false,
            scrollTopOnStatusbarClick: false,

            // Modals
            modalButtonOk: 'OK',
            modalButtonCancel: 'Cancel',
            modalUsernamePlaceholder: 'Username',
            modalPasswordPlaceholder: 'Password',
            modalTitle: '移民帮',
            modalCloseByOutside: false,
            actionsCloseByOutside: true,
            popupCloseByOutside: true,
            modalPreloaderTitle: 'Loading... ',
            modalStack: true,
            // Lazy Load
            imagesLazyLoadThreshold: 0,
            imagesLazyLoadSequential: true,

            // Notifications defaults
            notificationCloseOnClick: false,
            notificationCloseIcon: true,
            // Animate Pages
            animatePages: true,
            // Auto init
            init: true,
            router: true
        };

        // Extend defaults with parameters
        for (var param in params) {
            app.params[param] = params[param];
        }

        // DOM lib
        var $ = Dom7;

        // Template7 lib
        var t7 = Template7;
        app._compiledTemplates = {};

        // Touch events
        app.touchEvents = {
            start: app.support.touch ? 'touchstart' : 'mousedown',
            move: app.support.touch ? 'touchmove' : 'mousemove',
            end: app.support.touch ? 'touchend' : 'mouseup'
        };

        // Link to local storage
        app.ls = window.localStorage;

        // RTL
        app.rtl = $('body').css('direction') === 'rtl';
        if (app.rtl) $('html').attr('dir', 'rtl');

        // Overwrite statusbar overlay
        if (typeof app.params.statusbarOverlay !== 'undefined') {
            if (app.params.statusbarOverlay) $('html').addClass('with-statusbar-overlay');
            else $('html').removeClass('with-statusbar-overlay');
        }

        /*======================================================
        ************   Pages   ************
        ======================================================*/
        // Page Callbacks API
        app.pageCallbacks = {};

        app.onPage = function(callbackName, pageName, callback) {
            if (pageName && pageName.split(' ').length > 1) {
                var pageNames = pageName.split(' ');
                var returnCallbacks = [];
                for (var i = 0; i < pageNames.length; i++) {
                    returnCallbacks.push(app.onPage(callbackName, pageNames[i], callback));
                }
                returnCallbacks.remove = function() {
                    for (var i = 0; i < returnCallbacks.length; i++) {
                        returnCallbacks[i].remove();
                    }
                };
                returnCallbacks.trigger = function() {
                    for (var i = 0; i < returnCallbacks.length; i++) {
                        returnCallbacks[i].trigger();
                    }
                };
                return returnCallbacks;
            }
            var callbacks = app.pageCallbacks[callbackName][pageName];
            if (!callbacks) {
                callbacks = app.pageCallbacks[callbackName][pageName] = [];
            }
            app.pageCallbacks[callbackName][pageName].push(callback);
            return {
                remove: function() {
                    var removeIndex;
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i].toString() === callback.toString()) {
                            removeIndex = i;
                        }
                    }
                    if (typeof removeIndex !== 'undefined') callbacks.splice(removeIndex, 1);
                },
                trigger: callback
            };
        };

        //Create callbacks methods dynamically
        function createPageCallback(callbackName) {
            var capitalized = callbackName.replace(/^./, function(match) {
                return match.toUpperCase();
            });
            app['onPage' + capitalized] = function(pageName, callback) {
                return app.onPage(callbackName, pageName, callback);
            };
        }

        var pageCallbacksNames = ('beforeInit init reinit beforeAnimation afterAnimation back afterBack beforeRemove').split(' ');
        for (var i = 0; i < pageCallbacksNames.length; i++) {
            app.pageCallbacks[pageCallbacksNames[i]] = {};
            createPageCallback(pageCallbacksNames[i]);
        }

        app.triggerPageCallbacks = function(callbackName, pageName, pageData) {
            var allPagesCallbacks = app.pageCallbacks[callbackName]['*'];
            if (allPagesCallbacks) {
                for (var j = 0; j < allPagesCallbacks.length; j++) {
                    allPagesCallbacks[j](pageData);
                }
            }
            var callbacks = app.pageCallbacks[callbackName][pageName];
            if (!callbacks || callbacks.length === 0) return;
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](pageData);
            }
        };

        // On Page Init Callback
        app.pageInitCallback = function(params) {
            var pageContainer = params.pageContainer;
            // Page Data
            var pageData = {
                container: pageContainer,
                url: params.url,
            };

            // Before Init Callbacks
            // app.pluginHook('pageBeforeInit', pageData);
            if (app.params.onPageBeforeInit) app.params.onPageBeforeInit(app, pageData);
            // app.triggerPageCallbacks('beforeInit', pageData.name, pageData);
            $(pageData.container).trigger('pageBeforeInit', {
                page: pageData
            });

            // Init page
            app.initPage(pageContainer);

            // Init Callback
            // app.pluginHook('pageInit', pageData);
            if (app.params.onPageInit) app.params.onPageInit(app, pageData);
            // app.triggerPageCallbacks('init', pageData.name, pageData);
            $(pageData.container).trigger('pageInit', {
                page: pageData
            });
        };
        app.pageRemoveCallback = function(view, pageContainer, position) {
            var pageContext;
            if (pageContainer.f7PageData) pageContext = pageContainer.f7PageData.context;
            // Page Data
            var pageData = {
                container: pageContainer,
                name: $(pageContainer).attr('data-page'),
                view: view,
                url: pageContainer.f7PageData && pageContainer.f7PageData.url,
                query: pageContainer.f7PageData && pageContainer.f7PageData.query,
                navbarInnerContainer: pageContainer.f7PageData && pageContainer.f7PageData.navbarInnerContainer,
                from: position,
                context: pageContext
            };
            // Before Init Callback
            app.pluginHook('pageBeforeRemove', pageData);
            if (app.params.onPageBeforeRemove) app.params.onPageBeforeRemove(app, pageData);
            app.triggerPageCallbacks('beforeRemove', pageData.name, pageData);
            $(pageData.container).trigger('pageBeforeRemove', {
                page: pageData
            });
        };
        app.pageBackCallback = function(callback, view, params) {
            // Page Data
            var pageContainer = params.pageContainer;
            var pageContext;
            if (pageContainer.f7PageData) pageContext = pageContainer.f7PageData.context;

            var pageData = {
                container: pageContainer,
                name: $(pageContainer).attr('data-page'),
                url: pageContainer.f7PageData && pageContainer.f7PageData.url,
                query: pageContainer.f7PageData && pageContainer.f7PageData.query,
                view: view,
                from: params.position,
                context: pageContext,
                navbarInnerContainer: pageContainer.f7PageData && pageContainer.f7PageData.navbarInnerContainer,
                swipeBack: params.swipeBack
            };

            if (callback === 'after') {
                app.pluginHook('pageAfterBack', pageData);
                if (app.params.onPageAfterBack) app.params.onPageAfterBack(app, pageData);
                app.triggerPageCallbacks('afterBack', pageData.name, pageData);
                $(pageContainer).trigger('pageAfterBack', {
                    page: pageData
                });

            }
            if (callback === 'before') {
                app.pluginHook('pageBack', pageData);
                if (app.params.onPageBack) app.params.onPageBack(app, pageData);
                app.triggerPageCallbacks('back', pageData.name, pageData);
                $(pageData.container).trigger('pageBack', {
                    page: pageData
                });
            }
        };
        app.pageAnimCallback = function(callback, view, params) {
            var pageContainer = params.pageContainer;
            var pageContext;
            if (pageContainer.f7PageData) pageContext = pageContainer.f7PageData.context;
            // Page Data
            var pageData = {
                container: pageContainer,
                url: params.url,
                query: params.query || $.parseUrlQuery(params.url || ''),
                name: $(pageContainer).attr('data-page'),
                view: view,
                from: params.position,
                context: pageContext,
                swipeBack: params.swipeBack,
                navbarInnerContainer: pageContainer.f7PageData && pageContainer.f7PageData.navbarInnerContainer,
                fromPage: params.fromPage
            };
            var oldPage = params.oldPage,
                newPage = params.newPage;

            // Update page date
            pageContainer.f7PageData = pageData;

            if (callback === 'after') {
                app.pluginHook('pageAfterAnimation', pageData);
                if (app.params.onPageAfterAnimation) app.params.onPageAfterAnimation(app, pageData);
                app.triggerPageCallbacks('afterAnimation', pageData.name, pageData);
                $(pageData.container).trigger('pageAfterAnimation', {
                    page: pageData
                });

            }
            if (callback === 'before') {
                // Add data-page on view
                $(view.container).attr('data-page', pageData.name);

                // Update View's activePage
                if (view) view.activePage = pageData;

                // Hide/show navbar dynamically
                if (newPage.hasClass('no-navbar') && !oldPage.hasClass('no-navbar')) {
                    view.hideNavbar();
                }
                if (!newPage.hasClass('no-navbar') && (oldPage.hasClass('no-navbar') || oldPage.hasClass('no-navbar-by-scroll'))) {
                    view.showNavbar();
                }
                // Hide/show navbar toolbar
                if (newPage.hasClass('no-toolbar') && !oldPage.hasClass('no-toolbar')) {
                    view.hideToolbar();
                }
                if (!newPage.hasClass('no-toolbar') && (oldPage.hasClass('no-toolbar') || oldPage.hasClass('no-toolbar-by-scroll'))) {
                    view.showToolbar();
                }
                // Hide/show tabbar
                var tabBar;
                if (newPage.hasClass('no-tabbar') && !oldPage.hasClass('no-tabbar')) {
                    tabBar = $(view.container).find('.tabbar');
                    if (tabBar.length === 0) tabBar = $(view.container).parents('.' + app.params.viewsClass).find('.tabbar');
                    app.hideToolbar(tabBar);
                }
                if (!newPage.hasClass('no-tabbar') && (oldPage.hasClass('no-tabbar') || oldPage.hasClass('no-tabbar-by-scroll'))) {
                    tabBar = $(view.container).find('.tabbar');
                    if (tabBar.length === 0) tabBar = $(view.container).parents('.' + app.params.viewsClass).find('.tabbar');
                    app.showToolbar(tabBar);
                }

                oldPage.removeClass('no-navbar-by-scroll no-toolbar-by-scroll');
                // Callbacks
                app.pluginHook('pageBeforeAnimation', pageData);
                if (app.params.onPageBeforeAnimation) app.params.onPageBeforeAnimation(app, pageData);
                app.triggerPageCallbacks('beforeAnimation', pageData.name, pageData);
                $(pageData.container).trigger('pageBeforeAnimation', {
                    page: pageData
                });
            }
        };

        // Init Page Events and Manipulations
        app.initPage = function(pageContainer) {
            pageContainer = $(pageContainer);
            // Size navbars on page load
            // if (app.sizeNavbars) app.sizeNavbars(pageContainer.parents('.' + app.params.viewClass)[0]);
            // // Init messages
            // if (app.initPageMessages) app.initPageMessages(pageContainer);
            // Init forms storage
            if (app.initFormsStorage) app.initFormsStorage(pageContainer);
            // Init smart select
            // if (app.initSmartSelects) app.initSmartSelects(pageContainer);
            // // Init slider
            // if (app.initPageSwiper) app.initPageSwiper(pageContainer);
            // Init pull to refres
            if (app.initPullToRefresh) app.initPullToRefresh(pageContainer);
            // Init infinite scroll
            if (app.initInfiniteScroll) app.initInfiniteScroll(pageContainer);
            // Init searchbar
            // if (app.initSearchbar) app.initSearchbar(pageContainer);
            // // Init message bar
            // if (app.initPageMessagebar) app.initPageMessagebar(pageContainer);
            // // Init scroll toolbars
            // if (app.initScrollToolbars) app.initScrollToolbars(pageContainer);
            // Init scroll toolbars
            if (app.initImagesLazyLoad) app.initImagesLazyLoad(pageContainer);
        };
        app.reinitPage = function(pageContainer) {
            pageContainer = $(pageContainer);
            // Size navbars on page reinit
            if (app.sizeNavbars) app.sizeNavbars(pageContainer.parents('.' + app.params.viewClass)[0]);
            // Reinit slider
            if (app.reinitPageSwiper) app.reinitPageSwiper(pageContainer);
            // Reinit lazy load
            if (app.reinitLazyLoad) app.reinitLazyLoad(pageContainer);
        };
        app.initPageWithCallback = function(pageContainer) {
            pageContainer = $(pageContainer);

            app.pageInitCallback({
                pageContainer: pageContainer[0],
                url: undefined,
                position: 'center'
            });
        };


        /*======================================================
        ************   Navigation / Router   ************
        ======================================================*/
        app.router = {
            load: function(options) {
                options = options || {};
                var url = options.url;
                app.router.animatePages('to-left');
                setTimeout(function(){window.location.href = url;}, 300);

            },
            back: function(options) {
                options = options || {};
                var url = options.url;
                app.router.animatePages('to-right');
                setTimeout(function(){window.location.href = url;}, 300);
            },
            // Set pages classess for animationEnd
            animatePages: function(direction) {
                // Loading new page
                var removeClasses = 'page-on-center page-on-right page-on-left page-from-right-to-center page-from-left-to-center';
                var loadingPage = $(".preloader-loading-overlay");
                // var loadingPage=$("#preloader-loading-overlay");
                if (loadingPage && loadingPage.length < 1) {
                    // loadingPage=$('<div class="preloader-loading-overlay" style="display:none"><div class="preloader-loading"><span class="l_circle"></span></div></div>');
                    loadingPage = $('<div class="preloader-loading-overlay p-mask" style="display:none"><div class="loading"> <i></i> </div></div>');

                    $("body").append(loadingPage);
                }
                if (direction === 'to-left') {
                    // leftPage.removeClass(removeClasses).addClass('page-from-center-to-left');
                    loadingPage.removeClass(removeClasses).show().addClass('page-from-right-to-center');
                }
                // Go back
                if (direction === 'to-right') {
                    // leftPage.removeClass(removeClasses).addClass('page-from-left-to-center');
                    loadingPage.removeClass(removeClasses).show().addClass('page-from-left-to-center');

                }
            },
        };

        /*======================================================
        ************   Modals   ************
        ======================================================*/
        var _modalTemplateTempDiv = document.createElement('div');
        app.modalStack = [];
        app.modalStackClearQueue = function() {
            if (app.modalStack.length) {
                (app.modalStack.shift())();
            }
        };
        app.modal = function(params) {
            params = params || {};
            var modalHTML = '';
            if (app.params.modalTemplate) {
                if (!app._compiledTemplates.modal) app._compiledTemplates.modal = t7.compile(app.params.modalTemplate);
                modalHTML = app._compiledTemplates.modal(params);
            } else {
                var buttonsHTML = '';
                if (params.buttons && params.buttons.length > 0) {
                    for (var i = 0; i < params.buttons.length; i++) {
                        buttonsHTML += '<span class="modal-button' + (params.buttons[i].bold ? ' modal-button-bold' : '') + '">' + params.buttons[i].text + '</span>';
                    }
                }
                var titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
                var textHTML = params.text ? '<div class="modal-text">' + params.text + '</div>' : '';
                var afterTextHTML = params.afterText ? params.afterText : '';
                var noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
                var verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
                modalHTML = '<div class="modal ' + noButtons + ' ' + (params.cssClass || '') + '"><div class="modal-inner">' + (titleHTML + textHTML + afterTextHTML) + '</div><div class="modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';
            }

            _modalTemplateTempDiv.innerHTML = modalHTML;

            var modal = $(_modalTemplateTempDiv).children();

            $('body').append(modal[0]);

            // Add events on buttons
            modal.find('.modal-button').each(function(index, el) {
                $(el).on('click', function(e) {
                    if (params.buttons[index].close !== false) app.closeModal(modal);
                    if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
                    if (params.onClick) params.onClick(modal, index);
                });
            });
            app.openModal(modal);
            return modal[0];
        };
        app.alert = function(text, title, callbackOk) {
            if (typeof title === 'function') {
                callbackOk = arguments[1];
                title = undefined;
            }
            return app.modal({
                text: text || '',
                title: typeof title === 'undefined' ? app.params.modalTitle : title,
                buttons: [{
                    text: app.params.modalButtonOk,
                    bold: true,
                    onClick: callbackOk
                }]
            });
        };
        app.confirm = function(text, title, callbackOk, callbackCancel) {
            if (typeof title === 'function') {
                callbackCancel = arguments[2];
                callbackOk = arguments[1];
                title = undefined;
            }
            return app.modal({
                text: text || '',
                title: typeof title === 'undefined' ? app.params.modalTitle : title,
                buttons: [{
                    text: app.params.modalButtonCancel,
                    onClick: callbackCancel
                }, {
                    text: app.params.modalButtonOk,
                    bold: true,
                    onClick: callbackOk
                }]
            });
        };
        app.prompt = function(text, title, callbackOk, callbackCancel) {
            if (typeof title === 'function') {
                callbackCancel = arguments[2];
                callbackOk = arguments[1];
                title = undefined;
            }
            return app.modal({
                text: text || '',
                title: typeof title === 'undefined' ? app.params.modalTitle : title,
                afterText: '<input type="text" class="modal-text-input">',
                buttons: [{
                    text: app.params.modalButtonCancel
                }, {
                    text: app.params.modalButtonOk,
                    bold: true
                }],
                onClick: function(modal, index) {
                    if (index === 0 && callbackCancel) callbackCancel($(modal).find('.modal-text-input').val());
                    if (index === 1 && callbackOk) callbackOk($(modal).find('.modal-text-input').val());
                }
            });
        };
        app.modalLogin = function(text, title, callbackOk, callbackCancel) {
            if (typeof title === 'function') {
                callbackCancel = arguments[2];
                callbackOk = arguments[1];
                title = undefined;
            }
            return app.modal({
                text: text || '',
                title: typeof title === 'undefined' ? app.params.modalTitle : title,
                afterText: '<input type="text" name="modal-username" placeholder="' + app.params.modalUsernamePlaceholder + '" class="modal-text-input modal-text-input-double"><input type="password" name="modal-password" placeholder="' + app.params.modalPasswordPlaceholder + '" class="modal-text-input modal-text-input-double">',
                buttons: [{
                    text: app.params.modalButtonCancel
                }, {
                    text: app.params.modalButtonOk,
                    bold: true
                }],
                onClick: function(modal, index) {
                    var username = $(modal).find('.modal-text-input[name="modal-username"]').val();
                    var password = $(modal).find('.modal-text-input[name="modal-password"]').val();
                    if (index === 0 && callbackCancel) callbackCancel(username, password);
                    if (index === 1 && callbackOk) callbackOk(username, password);
                }
            });
        };
        app.modalPassword = function(text, title, callbackOk, callbackCancel) {
            if (typeof title === 'function') {
                callbackCancel = arguments[2];
                callbackOk = arguments[1];
                title = undefined;
            }
            return app.modal({
                text: text || '',
                title: typeof title === 'undefined' ? app.params.modalTitle : title,
                afterText: '<input type="password" name="modal-password" placeholder="' + app.params.modalPasswordPlaceholder + '" class="modal-text-input">',
                buttons: [{
                    text: app.params.modalButtonCancel
                }, {
                    text: app.params.modalButtonOk,
                    bold: true
                }],
                onClick: function(modal, index) {
                    var password = $(modal).find('.modal-text-input[name="modal-password"]').val();
                    if (index === 0 && callbackCancel) callbackCancel(password);
                    if (index === 1 && callbackOk) callbackOk(password);
                }
            });
        };
        app.showPreloader = function(title) {
            // return app.modal({
            //     title: title || app.params.modalPreloaderTitle,
            //     text: '<div class="preloader"><div id="preloader-loading-overlay "><div class="loading"> <i></i> </div></div></div>',
            //     // text:'<div class="p-mask"> <div class="loading"> <p class="text">提示文字</p> <i></i> </div> </div>',
            //     cssClass: 'modal-preloader'
            // });
            var preloaderP=$("#preloader").find("p");
            if(preloaderP.length>0){
                preloaderP.html(title).show();
            }else{
                $('body').append('<div class="preloader-indicator-overlay-new p-mask" id="preloader"> <div class="loading"><p class="text">'+title+'</p> <i></i> </div> </div>');
            }
        };
        app.hidePreloader = function() {
            // app.closeModal('.modal.modal-in');
           $("#preloader").hide();
        };
        app.showIndicator = function() {
            // $('body').append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
            // $('body').append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"><div id="preloader-loading-overlay"><i class="loading-fly"><b></b></i></div></span></div>');
            $('body').append('<div class="preloader-indicator-overlay-new p-mask"> <div class="loading"> <i></i> </div> </div>');
        };
        app.hideIndicator = function() {
            $('.preloader-indicator-overlay-new, .preloader-indicator-modal').remove();
        };
        // Action Sheet
        app.actions = function(target, params) {
            var toPopover = false,
                modal, groupSelector, buttonSelector;
            if (arguments.length === 1) {
                // Actions
                params = target;
            } else {
                // Popover
                if (app.device.ios) {
                    if (app.device.ipad) toPopover = true;
                } else {
                    if ($(window).width() >= 768) toPopover = true;
                }
            }
            params = params || [];

            if (params.length > 0 && !$.isArray(params[0])) {
                params = [params];
            }
            var modalHTML;
            if (toPopover) {
                var actionsToPopoverTemplate = app.params.modalActionsToPopoverTemplate ||
                    '<div class="popover actions-popover">' +
                    '<div class="popover-inner">' +
                    '{{#each this}}' +
                    '<div class="list-block">' +
                    '<ul>' +
                    '{{#each this}}' +
                    '{{#if label}}' +
                    '<li class="actions-popover-label {{#if color}}color-{{color}}{{/if}} {{#if bold}}actions-popover-bold{{/if}}">{{text}}</li>' +
                    '{{else}}' +
                    '<li><a href="#" class="item-link list-button {{#if color}}color-{{color}}{{/if}} {{#if bg}}bg-{{bg}}{{/if}} {{#if bold}}actions-popover-bold{{/if}} {{#if disabled}}disabled{{/if}}">{{text}}</a></li>' +
                    '{{/if}}' +
                    '{{/each}}' +
                    '</ul>' +
                    '</div>' +
                    '{{/each}}' +
                    '</div>' +
                    '</div>';
                if (!app._compiledTemplates.actionsToPopover) {
                    app._compiledTemplates.actionsToPopover = t7.compile(actionsToPopoverTemplate);
                }
                var popoverHTML = app._compiledTemplates.actionsToPopover(params);
                modal = $(app.popover(popoverHTML, target, true));
                groupSelector = '.list-block ul';
                buttonSelector = '.list-button';
            } else {
                if (app.params.modalActionsTemplate) {
                    if (!app._compiledTemplates.actions) app._compiledTemplates.actions = t7.compile(app.params.modalActionsTemplate);
                    modalHTML = app._compiledTemplates.actions(params);
                } else {
                    var buttonsHTML = '';
                    for (var i = 0; i < params.length; i++) {
                        for (var j = 0; j < params[i].length; j++) {
                            if (j === 0) buttonsHTML += '<div class="actions-modal-group">';
                            var button = params[i][j];
                            var buttonClass = button.label ? 'actions-modal-label' : 'actions-modal-button';
                            if (button.bold) buttonClass += ' actions-modal-button-bold';
                            if (button.color) buttonClass += ' color-' + button.color;
                            if (button.bg) buttonClass += ' bg-' + button.bg;
                            if (button.disabled) buttonClass += ' disabled';
                            buttonsHTML += '<span class="' + buttonClass + '">' + button.text + '</span>';
                            if (j === params[i].length - 1) buttonsHTML += '</div>';
                        }
                    }
                    modalHTML = '<div class="actions-modal">' + buttonsHTML + '</div>';
                }
                _modalTemplateTempDiv.innerHTML = modalHTML;
                modal = $(_modalTemplateTempDiv).children();
                $('body').append(modal[0]);
                groupSelector = '.actions-modal-group';
                buttonSelector = '.actions-modal-button';
            }

            var groups = modal.find(groupSelector);
            groups.each(function(index, el) {
                var groupIndex = index;
                $(el).children().each(function(index, el) {
                    var buttonIndex = index;
                    var buttonParams = params[groupIndex][buttonIndex];
                    var clickTarget;
                    if (!toPopover && $(el).is(buttonSelector)) clickTarget = $(el);
                    if (toPopover && $(el).find(buttonSelector).length > 0) clickTarget = $(el).find(buttonSelector);

                    if (clickTarget) {
                        clickTarget.on('click', function(e) {
                            if (buttonParams.close !== false) app.closeModal(modal);
                            if (buttonParams.onClick) buttonParams.onClick(modal, e);
                        });
                    }
                });
            });
            if (!toPopover) app.openModal(modal);
            return modal[0];
        };
        app.popover = function(modal, target, removeOnClose) {
            if (typeof removeOnClose === 'undefined') removeOnClose = true;
            if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
                var _modal = document.createElement('div');
                _modal.innerHTML = modal.trim();
                if (_modal.childNodes.length > 0) {
                    modal = _modal.childNodes[0];
                    if (removeOnClose) modal.classList.add('remove-on-close');
                    $('body').append(modal);
                } else return false; //nothing found
            }
            modal = $(modal);
            target = $(target);
            if (modal.length === 0 || target.length === 0) return false;
            if (modal.find('.popover-angle').length === 0 && !app.params.material) {
                modal.append('<div class="popover-angle"></div>');
            }
            modal.show();

            var material = app.params.material;

            function sizePopover() {
                modal.css({
                    left: '',
                    top: ''
                });
                var modalWidth = modal.width();
                var modalHeight = modal.height(); // 13 - height of angle
                var modalAngle, modalAngleSize = 0,
                    modalAngleLeft, modalAngleTop;
                if (!material) {
                    modalAngle = modal.find('.popover-angle');
                    modalAngleSize = modalAngle.width() / 2;
                    modalAngle.removeClass('on-left on-right on-top on-bottom').css({
                        left: '',
                        top: ''
                    });
                } else {
                    modal.removeClass('popover-on-left popover-on-right popover-on-top popover-on-bottom').css({
                        left: '',
                        top: ''
                    });
                }


                var targetWidth = target.outerWidth();
                var targetHeight = target.outerHeight();
                var targetOffset = target.offset();
                var targetParentPage = target.parents('.page');
                if (targetParentPage.length > 0) {
                    targetOffset.top = targetOffset.top - targetParentPage[0].scrollTop;
                }

                var windowHeight = $(window).height();
                var windowWidth = $(window).width();

                var modalTop = 0;
                var modalLeft = 0;
                var diff = 0;
                // Top Position
                var modalPosition = 'top';
                if (material) {
                    if (modalHeight < targetOffset.top) {
                        // On top
                        modalTop = targetOffset.top - modalHeight + targetHeight;
                    } else if (modalHeight < windowHeight - targetOffset.top - targetHeight) {
                        // On bottom
                        modalPosition = 'bottom';
                        modalTop = targetOffset.top;
                    } else {
                        // On middle
                        modalPosition = 'bottom';
                        modalTop = targetOffset.top;
                    }

                    if (modalTop <= 0) {
                        modalTop = 5;
                    } else if (modalTop + modalHeight >= windowHeight) {
                        modalTop = windowHeight - modalHeight - 5;
                    }

                    // Horizontal Position
                    modalLeft = targetOffset.left;
                    if (modalLeft < 5) modalLeft = 5;
                    if (modalLeft + modalWidth > windowWidth) {
                        modalLeft = targetOffset.left + targetWidth - modalWidth;
                    }
                    if (modalPosition === 'top') {
                        modal.addClass('popover-on-top');
                    }
                    if (modalPosition === 'bottom') {
                        modal.addClass('popover-on-bottom');
                    }

                } else {
                    if ((modalHeight + modalAngleSize) < targetOffset.top) {
                        // On top
                        modalTop = targetOffset.top - modalHeight - modalAngleSize;
                    } else if ((modalHeight + modalAngleSize) < windowHeight - targetOffset.top - targetHeight) {
                        // On bottom
                        modalPosition = 'bottom';
                        modalTop = targetOffset.top + targetHeight + modalAngleSize;
                    } else {
                        // On middle
                        modalPosition = 'middle';
                        modalTop = targetHeight / 2 + targetOffset.top - modalHeight / 2;
                        diff = modalTop;
                        if (modalTop <= 0) {
                            modalTop = 5;
                        } else if (modalTop + modalHeight >= windowHeight) {
                            modalTop = windowHeight - modalHeight - 5;
                        }
                        diff = diff - modalTop;
                    }

                    // Horizontal Position
                    if (modalPosition === 'top' || modalPosition === 'bottom') {
                        modalLeft = targetWidth / 2 + targetOffset.left - modalWidth / 2;
                        diff = modalLeft;
                        if (modalLeft < 5) modalLeft = 5;
                        if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                        if (modalPosition === 'top') {
                            modalAngle.addClass('on-bottom');
                        }
                        if (modalPosition === 'bottom') {
                            modalAngle.addClass('on-top');
                        }
                        diff = diff - modalLeft;
                        modalAngleLeft = (modalWidth / 2 - modalAngleSize + diff);
                        modalAngleLeft = Math.max(Math.min(modalAngleLeft, modalWidth - modalAngleSize * 2 - 6), 6);
                        modalAngle.css({
                            left: modalAngleLeft + 'px'
                        });

                    } else if (modalPosition === 'middle') {
                        modalLeft = targetOffset.left - modalWidth - modalAngleSize;
                        modalAngle.addClass('on-right');
                        if (modalLeft < 5 || (modalLeft + modalWidth > windowWidth)) {
                            if (modalLeft < 5) modalLeft = targetOffset.left + targetWidth + modalAngleSize;
                            if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                            modalAngle.removeClass('on-right').addClass('on-left');
                        }
                        modalAngleTop = (modalHeight / 2 - modalAngleSize + diff);
                        modalAngleTop = Math.max(Math.min(modalAngleTop, modalHeight - modalAngleSize * 2 - 6), 6);
                        modalAngle.css({
                            top: modalAngleTop + 'px'
                        });
                    }
                }


                // Apply Styles
                modal.css({
                    top: modalTop + 'px',
                    left: modalLeft + 'px'
                });
            }
            sizePopover();

            $(window).on('resize', sizePopover);
            modal.on('close', function() {
                $(window).off('resize', sizePopover);
            });

            app.openModal(modal);
            return modal[0];
        };
        app.popup = function(modal, removeOnClose) {
            if (typeof removeOnClose === 'undefined') removeOnClose = true;
            if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
                var _modal = document.createElement('div');
                _modal.innerHTML = modal.trim();
                if (_modal.childNodes.length > 0) {
                    modal = _modal.childNodes[0];
                    if (removeOnClose) modal.classList.add('remove-on-close');
                    $('body').append(modal);
                } else return false; //nothing found
            }
            modal = $(modal);
            if (modal.length === 0) return false;
            modal.show();

            app.openModal(modal);
            return modal[0];
        };
        app.pickerModal = function(pickerModal, removeOnClose) {
            if (typeof removeOnClose === 'undefined') removeOnClose = true;
            if (typeof pickerModal === 'string' && pickerModal.indexOf('<') >= 0) {
                pickerModal = $(pickerModal);
                if (pickerModal.length > 0) {
                    if (removeOnClose) pickerModal.addClass('remove-on-close');
                    $('body').append(pickerModal[0]);
                } else return false; //nothing found
            }
            pickerModal = $(pickerModal);
            if (pickerModal.length === 0) return false;
            pickerModal.show();
            app.openModal(pickerModal);
            return pickerModal[0];
        };
        app.loginScreen = function(modal) {
            if (!modal) modal = '.login-screen';
            modal = $(modal);
            if (modal.length === 0) return false;
            modal.show();

            app.openModal(modal);
            return modal[0];
        };
        app.openModal = function(modal) {
            modal = $(modal);
            var isModal = modal.hasClass('modal');
            if ($('.modal.modal-in:not(.modal-out)').length && app.params.modalStack && isModal) {
                app.modalStack.push(function() {
                    app.openModal(modal);
                });
                return;
            }
            // do nothing if this modal already shown
            if (true === modal.data('f7-modal-shown')) {
                return;
            }
            modal.data('f7-modal-shown', true);
            modal.once('close', function() {
                modal.removeData('f7-modal-shown');
            });
            var isPopover = modal.hasClass('popover');
            var isPopup = modal.hasClass('popup');
            var isLoginScreen = modal.hasClass('login-screen');
            var isPickerModal = modal.hasClass('picker-modal');
            if (isModal) {
                modal.show();
                modal.css({
                    marginTop: -Math.round(modal.outerHeight() / 2) + 'px'
                });
            }

            var overlay;
            if (!isLoginScreen && !isPickerModal) {
                if ($('.modal-overlay').length === 0 && !isPopup) {
                    $('body').append('<div class="modal-overlay"></div>');
                }
                if ($('.popup-overlay').length === 0 && isPopup) {
                    $('body').append('<div class="popup-overlay"></div>');
                }
                overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
            }

            //Make sure that styles are applied, trigger relayout;
            var clientLeft = modal[0].clientLeft;

            // Trugger open event
            modal.trigger('open');

            // Picker modal body class
            if (isPickerModal) {
                $('body').addClass('with-picker-modal');
            }

            // Init Pages and Navbars in modal
            if (modal.find('.' + app.params.viewClass).length > 0) {
                modal.find('.page').each(function() {
                    app.initPageWithCallback(this);
                });
                modal.find('.navbar').each(function() {
                    app.initNavbarWithCallback(this);
                });
            }

            // Classes for transition in
            if (!isLoginScreen && !isPickerModal) overlay.addClass('modal-overlay-visible');
            modal.removeClass('modal-out').addClass('modal-in').transitionEnd(function(e) {
                if (modal.hasClass('modal-out')) modal.trigger('closed');
                else modal.trigger('opened');
            });
            return true;
        };
        app.closeModal = function(modal) {
            modal = $(modal || '.modal-in');
            if (typeof modal !== 'undefined' && modal.length === 0) {
                return;
            }
            var isModal = modal.hasClass('modal');
            var isPopover = modal.hasClass('popover');
            var isPopup = modal.hasClass('popup');
            var isLoginScreen = modal.hasClass('login-screen');
            var isPickerModal = modal.hasClass('picker-modal');

            var removeOnClose = modal.hasClass('remove-on-close');

            var overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
            if (isPopup) {
                if (modal.length === $('.popup.modal-in').length) {
                    overlay.removeClass('modal-overlay-visible');
                }
            } else if (!isPickerModal) {
                overlay.removeClass('modal-overlay-visible');
            }

            var dataset = modal.dataset();
            var formData = {};
            if (dataset.getformdata) {
                var form = modal.find(dataset.getformdata);
                if (form && form.length > 0) {
                    formData = app.formToJSON(form);
                    $.each(formData, function(key, value) {
                        if ($.isArray(value)) {
                            $.each(value, function(index, itemValue) {
                                if (/^\{.*:.*\}$/.test(itemValue)) {
                                    formData[key][index] = JSON.parse(itemValue);
                                }
                            });
                        } else if (/^\{.*:.*\}$/.test(value)) {
                            formData[key] = JSON.parse(value);
                        }
                    });
                }
            }
            modal.trigger('close', formData);

            // Picker modal body class
            if (isPickerModal) {
                $('body').removeClass('with-picker-modal');
                $('body').addClass('picker-modal-closing');
            }

            if (!isPopover) {
                modal.removeClass('modal-in').addClass('modal-out').transitionEnd(function(e) {
                    if (modal.hasClass('modal-out')) modal.trigger('closed');
                    else modal.trigger('opened');

                    if (isPickerModal) {
                        $('body').removeClass('picker-modal-closing');
                    }
                    if (isPopup || isLoginScreen || isPickerModal) {
                        modal.removeClass('modal-out').hide();
                        if (removeOnClose && modal.length > 0) {
                            modal.remove();
                        }
                    } else {
                        modal.remove();
                    }
                });
                if (isModal && app.params.modalStack) {
                    app.modalStackClearQueue();
                }
            } else {
                modal.removeClass('modal-in modal-out').trigger('closed').hide();
                if (removeOnClose) {
                    modal.remove();
                }
            }
            return true;
        };


        /*======================================================
        ************   Image Lazy Loading   ************
        ************   Based on solution by Marc Godard, https://github.com/MarcGodard   ************
        ======================================================*/
        app.initImagesLazyLoad = function(pageContainer) {
            pageContainer = $(pageContainer);

            // Lazy images
            var lazyLoadImages;
            if (pageContainer.hasClass('lazy')) {
                lazyLoadImages = pageContainer;
                pageContainer = lazyLoadImages.parents('.page');
            } else {
                lazyLoadImages = pageContainer.find('.lazy');
            }
            if (lazyLoadImages.length === 0) return;

            // Scrollable page content
            var pageContent;
            if (pageContainer.hasClass('page-content')) {
                pageContent = pageContainer;
                pageContainer = pageContainer.parents('.page');
            } else {
                pageContent = pageContainer.find('.page-content');
            }
            if (pageContent.length === 0) return;

            // Placeholder
            var placeholderSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXCwsK592mkAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
            if (typeof app.params.imagesLazyLoadPlaceholder === 'string') {
                placeholderSrc = app.params.imagesLazyLoadPlaceholder;
            }
            if (app.params.imagesLazyLoadPlaceholder !== false) lazyLoadImages.each(function() {
                if ($(this).attr('data-src')) $(this).attr('src', placeholderSrc);
            });

            // load image
            var imagesSequence = [];
            var imageIsLoading = false;

            function loadImage(el) {
                el = $(el);

                var bg = el.attr('data-background');
                var src = bg ? bg : el.attr('data-src');
                if (!src) return;

                function onLoad() {
                    el.removeClass('lazy').addClass('lazy-loaded');
                    if (bg) {
                        el.css('background-image', 'url(' + src + ')');
                    } else {
                        el.attr('src', src);
                    }

                    if (app.params.imagesLazyLoadSequential) {
                        imageIsLoading = false;
                        if (imagesSequence.length > 0) {
                            loadImage(imagesSequence.shift());
                        }
                    }
                }

                if (app.params.imagesLazyLoadSequential) {
                    if (imageIsLoading) {
                        if (imagesSequence.indexOf(el[0]) < 0) imagesSequence.push(el[0]);
                        return;
                    }
                }

                // Loading flag
                imageIsLoading = true;

                var image = new Image();
                image.onload = onLoad;
                image.onerror = onLoad;
                image.src = src;
            }

            function lazyHandler() {
                lazyLoadImages = pageContainer.find('.lazy');
                lazyLoadImages.each(function(index, el) {
                    el = $(el);
                    if (isElementInViewport(el[0])) {
                        loadImage(el);
                    }
                });
            }

            function isElementInViewport(el) {
                var rect = el.getBoundingClientRect();
                var threshold = app.params.imagesLazyLoadThreshold || 0;
                return (
                    rect.top >= (0 - threshold) &&
                    rect.left >= (0 - threshold) &&
                    rect.top <= (window.innerHeight + threshold) &&
                    rect.left <= (window.innerWidth + threshold)
                );
            }

            function attachEvents(destroy) {
                var method = destroy ? 'off' : 'on';
                lazyLoadImages[method]('lazy', lazyHandler);
                pageContainer[method]('lazy', lazyHandler);
                pageContent[method]('lazy', lazyHandler);
                pageContent[method]('scroll', lazyHandler);
                $(window)[method]('resize', lazyHandler);
            }

            function detachEvents() {
                attachEvents(true);
            }

            // Store detach function
            pageContainer[0].f7DestroyImagesLazyLoad = detachEvents;

            // Attach events
            attachEvents();

            // Destroy on page remove
            if (pageContainer.hasClass('page')) {
                pageContainer.once('pageBeforeRemove', detachEvents);
            }

            // Run loader on page load/init
            lazyHandler();

            // Run after page animation
            pageContainer.once('pageAfterAnimation', lazyHandler);
        };
        app.destroyImagesLazyLoad = function(pageContainer) {
            pageContainer = $(pageContainer);
            if (pageContainer.length > 0 && pageContainer[0].f7DestroyImagesLazyLoad) {
                pageContainer[0].f7DestroyLazyLoad();
            }
        };
        app.reinitImagesLazyLoad = function(pageContainer) {
            pageContainer = $(pageContainer);
            if (pageContainer.length > 0) {
                pageContainer.trigger('lazy');
            }
        };

        /*======================================================
                ************   Pull To Refresh   ************
                ======================================================*/
        app.initPullToRefresh = function(pageContainer) {
            var eventsTarget = $(pageContainer);
            if (!eventsTarget.hasClass('pull-to-refresh-content')) {
                eventsTarget = eventsTarget.find('.pull-to-refresh-content');
            }
            if (!eventsTarget || eventsTarget.length === 0) return;

            var isTouched, isMoved, touchesStart = {},
                isScrolling, touchesDiff, touchStartTime, container, refresh = false,
                useTranslate = false,
                startTranslate = 0,
                translate, scrollTop, wasScrolled, layer, triggerDistance, dynamicTriggerDistance;
            var page = eventsTarget.hasClass('page') ? eventsTarget : eventsTarget.parents('.page');
            var hasNavbar = false;
            if (page.find('.navbar').length > 0 || page.parents('.navbar-fixed, .navbar-through').length > 0 || page.hasClass('navbar-fixed') || page.hasClass('navbar-through')) hasNavbar = true;
            if (page.hasClass('no-navbar')) hasNavbar = false;
            if (!hasNavbar) eventsTarget.addClass('pull-to-refresh-no-navbar');

            container = eventsTarget;

            // Define trigger distance
            if (container.attr('data-ptr-distance')) {
                dynamicTriggerDistance = true;
            } else {
                triggerDistance = 44;
            }

            function handleTouchStart(e) {
                if (isTouched) {
                    if (app.device.os === 'android') {
                        if ('targetTouches' in e && e.targetTouches.length > 1) return;
                    } else return;
                }
                isMoved = false;
                isTouched = true;
                isScrolling = undefined;
                wasScrolled = undefined;
                touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();
                /*jshint validthis:true */
                container = $(this);
            }

            function handleTouchMove(e) {
                if (!isTouched) return;
                var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
                }
                if (!isScrolling) {
                    isTouched = false;
                    return;
                }

                scrollTop = container[0].scrollTop;
                if (typeof wasScrolled === 'undefined' && scrollTop !== 0) wasScrolled = true;

                if (!isMoved) {
                    /*jshint validthis:true */
                    container.removeClass('transitioning');
                    if (scrollTop > container[0].offsetHeight) {
                        isTouched = false;
                        return;
                    }
                    if (dynamicTriggerDistance) {
                        triggerDistance = container.attr('data-ptr-distance');
                        if (triggerDistance.indexOf('%') >= 0) triggerDistance = container[0].offsetHeight * parseInt(triggerDistance, 10) / 100;
                    }
                    startTranslate = container.hasClass('refreshing') ? triggerDistance : 0;
                    if (container[0].scrollHeight === container[0].offsetHeight || app.device.os !== 'ios') {
                        useTranslate = true;
                    } else {
                        useTranslate = false;
                    }
                }
                isMoved = true;
                touchesDiff = pageY - touchesStart.y;

                if (touchesDiff > 0 && scrollTop <= 0 || scrollTop < 0) {
                    // iOS 8 fix
                    if (app.device.os === 'ios' && parseInt(app.device.osVersion.split('.')[0], 10) > 7 && scrollTop === 0 && !wasScrolled) useTranslate = true;

                    if (useTranslate) {
                        e.preventDefault();
                        translate = (Math.pow(touchesDiff, 0.85) + startTranslate);
                        container.transform('translate3d(0,' + translate + 'px,0)');
                    } else {}
                    if ((useTranslate && Math.pow(touchesDiff, 0.85) > triggerDistance) || (!useTranslate && touchesDiff >= triggerDistance * 2)) {
                        refresh = true;
                        container.addClass('pull-up').removeClass('pull-down');
                    } else {
                        refresh = false;
                        container.removeClass('pull-up').addClass('pull-down');
                    }
                } else {

                    container.removeClass('pull-up pull-down');
                    refresh = false;
                    return;
                }
            }

            function handleTouchEnd(e) {
                if (!isTouched || !isMoved) {
                    isTouched = false;
                    isMoved = false;
                    return;
                }
                if (translate) {
                    container.addClass('transitioning');
                    translate = 0;
                }
                container.transform('');
                if (refresh) {
                    container.addClass('refreshing');
                    container.trigger('refresh', {
                        done: function() {
                            app.pullToRefreshDone(container);
                        }
                    });
                } else {
                    container.removeClass('pull-down');
                }
                isTouched = false;
                isMoved = false;
            }

            // Attach Events
            eventsTarget.on(app.touchEvents.start, handleTouchStart);
            eventsTarget.on(app.touchEvents.move, handleTouchMove);
            eventsTarget.on(app.touchEvents.end, handleTouchEnd);

            // Detach Events on page remove
            if (page.length === 0) return;

            function destroyPullToRefresh() {
                eventsTarget.off(app.touchEvents.start, handleTouchStart);
                eventsTarget.off(app.touchEvents.move, handleTouchMove);
                eventsTarget.off(app.touchEvents.end, handleTouchEnd);
            }
            eventsTarget[0].f7DestroyPullToRefresh = destroyPullToRefresh;

            function detachEvents() {
                destroyPullToRefresh();
                page.off('pageBeforeRemove', detachEvents);
            }
            page.on('pageBeforeRemove', detachEvents);

        };

        app.pullToRefreshDone = function(container) {
            container = $(container);
            if (container.length === 0) container = $('.pull-to-refresh-content.refreshing');
            container.removeClass('refreshing').addClass('transitioning');
            container.transitionEnd(function() {
                container.removeClass('transitioning pull-up pull-down');
            });
        };
        app.pullToRefreshTrigger = function(container) {
            container = $(container);
            if (container.length === 0) container = $('.pull-to-refresh-content');
            if (container.hasClass('refreshing')) return;
            container.addClass('transitioning refreshing');
            container.trigger('refresh', {
                done: function() {
                    app.pullToRefreshDone(container);
                }
            });
        };

        app.destroyPullToRefresh = function(pageContainer) {
            pageContainer = $(pageContainer);
            var pullToRefreshContent = pageContainer.hasClass('pull-to-refresh-content') ? pageContainer : pageContainer.find('.pull-to-refresh-content');
            if (pullToRefreshContent.length === 0) return;
            if (pullToRefreshContent[0].f7DestroyPullToRefresh) pullToRefreshContent[0].f7DestroyPullToRefresh();
        };

        /* ===============================================================================
        ************   Infinite Scroll   ************
        =============================================================================== */
        function handleInfiniteScroll() {
            /*jshint validthis:true */
            var inf = $(this);
            var scrollTop = inf[0].scrollTop;
            var scrollHeight = inf[0].scrollHeight;
            var height = inf[0].offsetHeight;
            var distance = inf[0].getAttribute('data-distance');
            var virtualListContainer = inf.find('.virtual-list');
            var virtualList;
            var onTop = inf.hasClass('infinite-scroll-top');
            if (!distance) distance = 50;
            if (typeof distance === 'string' && distance.indexOf('%') >= 0) {
                distance = parseInt(distance, 10) / 100 * height;
            }
            if (distance > height) distance = height;
            if (onTop) {
                if (scrollTop < distance) {
                    inf.trigger('infinite');
                }
            } else {
                if (scrollTop + height >= scrollHeight - distance) {
                    if (virtualListContainer.length > 0) {
                        virtualList = virtualListContainer[0].f7VirtualList;
                        if (virtualList && !virtualList.reachEnd) return;
                    }
                    inf.trigger('infinite');
                }
            }

        }
        app.attachInfiniteScroll = function(infiniteContent) {
            $(infiniteContent).on('scroll', handleInfiniteScroll);
        };
        app.detachInfiniteScroll = function(infiniteContent) {
            $(infiniteContent).off('scroll', handleInfiniteScroll);
        };

        app.initInfiniteScroll = function(pageContainer) {
            pageContainer = $(pageContainer);
            var infiniteContent = pageContainer.find('.infinite-scroll');
            if (infiniteContent.length === 0) return;
            app.attachInfiniteScroll(infiniteContent);

            function detachEvents() {
                app.detachInfiniteScroll(infiniteContent);
                pageContainer.off('pageBeforeRemove', detachEvents);
            }
            pageContainer.on('pageBeforeRemove', detachEvents);
        };


        /* ===============================================================================
        ************   Tabs   ************
        =============================================================================== */
        app.showTab = function(tab, tabLink, force) {
            var newTab = $(tab);
            if (arguments.length === 2) {
                if (typeof tabLink === 'boolean') {
                    force = tabLink;
                }
            }
            if (newTab.length === 0) return false;
            if (newTab.hasClass('active')) {
                if (force) newTab.trigger('show');
                return false;
            }
            var tabs = newTab.parent('.tabs');
            if (tabs.length === 0) return false;

            // Return swipeouts in hidden tabs
            app.allowSwipeout = true;

            // Animated tabs
            var isAnimatedTabs = tabs.parent().hasClass('tabs-animated-wrap');
            if (isAnimatedTabs) {
                tabs.transform('translate3d(' + -newTab.index() * 100 + '%,0,0)');
            }

            // Remove active class from old tabs
            var oldTab = tabs.children('.tab.active').removeClass('active');
            // Add active class to new tab
            newTab.addClass('active');
            // Trigger 'show' event on new tab
            newTab.trigger('show');

            // Update navbars in new tab
            if (!isAnimatedTabs && newTab.find('.navbar').length > 0) {
                // Find tab's view
                var viewContainer;
                if (newTab.hasClass(app.params.viewClass)) viewContainer = newTab[0];
                else viewContainer = newTab.parents('.' + app.params.viewClass)[0];
                app.sizeNavbars(viewContainer);
            }

            // Find related link for new tab
            if (tabLink) tabLink = $(tabLink);
            else {
                // Search by id
                if (typeof tab === 'string') tabLink = $('.tab-link[href="' + tab + '"]');
                else tabLink = $('.tab-link[href="#' + newTab.attr('id') + '"]');
                // Search by data-tab
                if (!tabLink || tabLink && tabLink.length === 0) {
                    $('[data-tab]').each(function() {
                        if (newTab.is($(this).attr('data-tab'))) tabLink = $(this);
                    });
                }
            }
            if (tabLink.length === 0) return;

            // Find related link for old tab
            var oldTabLink;
            if (oldTab && oldTab.length > 0) {
                // Search by id
                var oldTabId = oldTab.attr('id');
                if (oldTabId) oldTabLink = $('.tab-link[href="#' + oldTabId + '"]');
                // Search by data-tab
                if (!oldTabLink || oldTabLink && oldTabLink.length === 0) {
                    $('[data-tab]').each(function() {
                        if (oldTab.is($(this).attr('data-tab'))) oldTabLink = $(this);
                    });
                }
            }

            // Update links' classes
            if (tabLink && tabLink.length > 0) tabLink.addClass('active');
            if (oldTabLink && oldTabLink.length > 0) oldTabLink.removeClass('active');

            return true;
        };


        /*===============================================================================
        ************   Fast Clicks   ************
        ************   Inspired by https://github.com/ftlabs/fastclick   ************
        ===============================================================================*/
        app.initFastClicks = function() {
            if (app.params.activeState) {
                $('html').addClass('watch-active-state');
            }
            if (app.device.ios && app.device.webView) {
                // Strange hack required for iOS 8 webview to work on inputs
                window.addEventListener('touchstart', function() {});
            }

            var touchStartX, touchStartY, touchStartTime, targetElement, trackClick, activeSelection, scrollParent, lastClickTime, isMoved, tapHoldFired, tapHoldTimeout;
            var activableElement, activeTimeout, needsFastClick, needsFastClickTimeOut;

            function findActivableElement(e) {
                var target = $(e.target);
                var parents = target.parents(app.params.activeStateElements);
                var activable;
                if (target.is(app.params.activeStateElements)) {
                    activable = target;
                }
                if (parents.length > 0) {
                    activable = activable ? activable.add(parents) : parents;
                }
                return activable ? activable : target;
            }

            function isInsideScrollableView() {
                var pageContent = activableElement.parents('.page-content, .panel');

                if (pageContent.length === 0) {
                    return false;
                }

                // This event handler covers the "tap to stop scrolling".
                if (pageContent.prop('scrollHandlerSet') !== 'yes') {
                    pageContent.on('scroll', function() {
                        clearTimeout(activeTimeout);
                    });
                    pageContent.prop('scrollHandlerSet', 'yes');
                }

                return true;
            }

            function addActive() {
                activableElement.addClass('active-state');
            }

            function removeActive(el) {
                activableElement.removeClass('active-state');
            }

            function isFormElement(el) {
                var nodes = ('input select textarea label').split(' ');
                if (el.nodeName && nodes.indexOf(el.nodeName.toLowerCase()) >= 0) return true;
                return false;
            }

            function androidNeedsBlur(el) {
                var noBlur = ('button input textarea select').split(' ');
                if (document.activeElement && el !== document.activeElement && document.activeElement !== document.body) {
                    if (noBlur.indexOf(el.nodeName.toLowerCase()) >= 0) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }

            function targetNeedsFastClick(el) {
                var $el = $(el);
                if (el.nodeName.toLowerCase() === 'input' && el.type === 'file') return false;
                if ($el.hasClass('no-fastclick') || $el.parents('.no-fastclick').length > 0) return false;
                return true;
            }

            function targetNeedsFocus(el) {
                if (document.activeElement === el) {
                    return false;
                }
                var tag = el.nodeName.toLowerCase();
                var skipInputs = ('button checkbox file image radio submit').split(' ');
                if (el.disabled || el.readOnly) return false;
                if (tag === 'textarea') return true;
                if (tag === 'select') {
                    if (app.device.android) return false;
                    else return true;
                }
                if (tag === 'input' && skipInputs.indexOf(el.type) < 0) return true;
            }

            function targetNeedsPrevent(el) {
                el = $(el);
                var prevent = true;
                if (el.is('label') || el.parents('label').length > 0) {
                    if (app.device.android) {
                        prevent = false;
                    } else if (app.device.ios && el.is('input')) {
                        prevent = true;
                    } else prevent = false;
                }
                return prevent;
            }

            // Mouse Handlers
            function handleMouseDown(e) {
                findActivableElement(e).addClass('active-state');
                if ('which' in e && e.which === 3) {
                    setTimeout(function() {
                        $('.active-state').removeClass('active-state');
                    }, 0);
                }
            }

            function handleMouseMove(e) {
                $('.active-state').removeClass('active-state');
            }

            function handleMouseUp(e) {
                $('.active-state').removeClass('active-state');
            }

            // Touch Handlers
            function handleTouchStart(e) {
                isMoved = false;
                tapHoldFired = false;
                if (e.targetTouches.length > 1) {
                    return true;
                }
                if (app.params.tapHold) {
                    if (tapHoldTimeout) clearTimeout(tapHoldTimeout);
                    tapHoldTimeout = setTimeout(function() {
                        tapHoldFired = true;
                        e.preventDefault();
                        $(e.target).trigger('taphold');
                    }, app.params.tapHoldDelay);
                }
                if (needsFastClickTimeOut) clearTimeout(needsFastClickTimeOut);
                needsFastClick = targetNeedsFastClick(e.target);

                if (!needsFastClick) {
                    trackClick = false;
                    return true;
                }
                if (app.device.ios) {
                    var selection = window.getSelection();
                    if (selection.rangeCount && selection.focusNode !== document.body && (!selection.isCollapsed || document.activeElement === selection.focusNode)) {
                        activeSelection = true;
                        return true;
                    } else {
                        activeSelection = false;
                    }
                }
                if (app.device.android) {
                    if (androidNeedsBlur(e.target)) {
                        document.activeElement.blur();
                    }
                }

                trackClick = true;
                targetElement = e.target;
                touchStartTime = (new Date()).getTime();
                touchStartX = e.targetTouches[0].pageX;
                touchStartY = e.targetTouches[0].pageY;

                // Detect scroll parent
                if (app.device.ios) {
                    scrollParent = undefined;
                    $(targetElement).parents().each(function() {
                        var parent = this;
                        if (parent.scrollHeight > parent.offsetHeight && !scrollParent) {
                            scrollParent = parent;
                            scrollParent.f7ScrollTop = scrollParent.scrollTop;
                        }
                    });
                }
                if ((e.timeStamp - lastClickTime) < app.params.fastClicksDelayBetweenClicks) {
                    e.preventDefault();
                }
                if (app.params.activeState) {
                    activableElement = findActivableElement(e);
                    // If it's inside a scrollable view, we don't trigger active-state yet,
                    // because it can be a scroll instead. Based on the link:
                    // http://labnote.beedesk.com/click-scroll-and-pseudo-active-on-mobile-webk
                    if (!isInsideScrollableView(e)) {
                        addActive();
                    } else {
                        activeTimeout = setTimeout(addActive, 80);
                    }
                }
            }

            function handleTouchMove(e) {
                if (!trackClick) return;
                var _isMoved = false;
                var distance = app.params.fastClicksDistanceThreshold;
                if (distance) {
                    var pageX = e.targetTouches[0].pageX;
                    var pageY = e.targetTouches[0].pageY;
                    if (Math.abs(pageX - touchStartX) > distance || Math.abs(pageY - touchStartY) > distance) {
                        _isMoved = true;
                    }
                } else {
                    _isMoved = true;
                }
                if (_isMoved) {
                    trackClick = false;
                    targetElement = null;
                    isMoved = true;
                    if (app.params.tapHold) {
                        clearTimeout(tapHoldTimeout);
                    }
                    if (app.params.activeState) {
                        clearTimeout(activeTimeout);
                        removeActive();
                    }
                }
            }

            function handleTouchEnd(e) {
                clearTimeout(activeTimeout);
                clearTimeout(tapHoldTimeout);

                if (!trackClick) {
                    if (!activeSelection && needsFastClick) {
                        if (!(app.device.android && !e.cancelable)) {
                            e.preventDefault();
                        }
                    }
                    return true;
                }

                if (document.activeElement === e.target) {
                    return true;
                }

                if (!activeSelection) {
                    e.preventDefault();
                }

                if ((e.timeStamp - lastClickTime) < app.params.fastClicksDelayBetweenClicks) {
                    setTimeout(removeActive, 0);
                    return true;
                }

                lastClickTime = e.timeStamp;

                trackClick = false;

                if (app.device.ios && scrollParent) {
                    if (scrollParent.scrollTop !== scrollParent.f7ScrollTop) {
                        return false;
                    }
                }

                // Add active-state here because, in a very fast tap, the timeout didn't
                // have the chance to execute. Removing active-state in a timeout gives
                // the chance to the animation execute.
                if (app.params.activeState) {
                    addActive();
                    setTimeout(removeActive, 0);
                }

                // Trigger focus when required
                if (targetNeedsFocus(targetElement)) {
                    targetElement.focus();
                }

                // Blur active elements
                if (document.activeElement && targetElement !== document.activeElement && document.activeElement !== document.body && targetElement.nodeName.toLowerCase() !== 'label') {
                    document.activeElement.blur();
                }

                // Send click
                e.preventDefault();
                var touch = e.changedTouches[0];
                var evt = document.createEvent('MouseEvents');
                var eventType = 'click';
                if (app.device.android && targetElement.nodeName.toLowerCase() === 'select') {
                    eventType = 'mousedown';
                }
                evt.initMouseEvent(eventType, true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                evt.forwardedTouchEvent = true;
                targetElement.dispatchEvent(evt);
                return false;
            }

            function handleTouchCancel(e) {
                trackClick = false;
                targetElement = null;
            }

            function handleClick(e) {
                var allowClick = false;

                if (trackClick) {
                    targetElement = null;
                    trackClick = false;
                    return true;
                }
                if (e.target.type === 'submit' && e.detail === 0) {
                    return true;
                }
                if (!targetElement) {
                    if (!isFormElement(e.target)) {
                        allowClick = true;
                    }
                }
                if (!needsFastClick) {
                    allowClick = true;
                }
                if (document.activeElement === targetElement) {
                    allowClick = true;
                }
                if (e.forwardedTouchEvent) {
                    allowClick = true;
                }
                if (!e.cancelable) {
                    allowClick = true;
                }
                if (app.params.tapHold && app.params.tapHoldPreventClicks && tapHoldFired) {
                    allowClick = false;
                }
                if (!allowClick) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    if (targetElement) {
                        if (targetNeedsPrevent(targetElement) || isMoved) {
                            e.preventDefault();
                        }
                    } else {
                        e.preventDefault();
                    }
                    targetElement = null;
                }
                needsFastClickTimeOut = setTimeout(function() {
                    needsFastClick = false;
                }, (app.device.ios || app.device.androidChrome ? 100 : 400));

                if (app.params.tapHold) {
                    tapHoldTimeout = setTimeout(function() {
                        tapHoldFired = false;
                    }, (app.device.ios || app.device.androidChrome ? 100 : 400));
                }

                return allowClick;
            }
            if (app.support.touch) {
                document.addEventListener('click', handleClick, true);

                document.addEventListener('touchstart', handleTouchStart);
                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
                document.addEventListener('touchcancel', handleTouchCancel);
            } else {
                if (app.params.activeState) {
                    document.addEventListener('mousedown', handleMouseDown);
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }
            }
        };


        /*===============================================================================
        ************   Handle clicks and make them fast (on tap);   ************
        ===============================================================================*/
        app.initClickEvents = function() {
            function handleScrollTop(e) {
                /*jshint validthis:true */
                var clicked = $(this);
                var target = $(e.target);
                var isLink = clicked[0].nodeName.toLowerCase() === 'a' ||
                    clicked.parents('a').length > 0 ||
                    target[0].nodeName.toLowerCase() === 'a' ||
                    target.parents('a').length > 0;

                if (isLink) return;
                var pageContent, page;
                if (app.params.scrollTopOnNavbarClick && clicked.is('.navbar .center')) {
                    // Find active page
                    var navbar = clicked.parents('.navbar');

                    // Static Layout
                    pageContent = navbar.parents('.page-content');

                    if (pageContent.length === 0) {
                        // Fixed Layout
                        if (navbar.parents('.page').length > 0) {
                            pageContent = navbar.parents('.page').find('.page-content');
                        }
                        // Through Layout
                        if (pageContent.length === 0) {
                            if (navbar.nextAll('.pages').length > 0) {
                                pageContent = navbar.nextAll('.pages').find('.page:not(.page-on-left):not(.page-on-right):not(.cached)').find('.page-content');
                            }
                        }
                    }
                }
                if (app.params.scrollTopOnStatusbarClick && clicked.is('.statusbar-overlay')) {
                    if ($('.popup.modal-in').length > 0) {
                        // Check for opened popup
                        pageContent = $('.popup.modal-in').find('.page:not(.page-on-left):not(.page-on-right):not(.cached)').find('.page-content');
                    } else if ($('.panel.active').length > 0) {
                        // Check for opened panel
                        pageContent = $('.panel.active').find('.page:not(.page-on-left):not(.page-on-right):not(.cached)').find('.page-content');
                    } else if ($('.views > .view.active').length > 0) {
                        // View in tab bar app layout
                        pageContent = $('.views > .view.active').find('.page:not(.page-on-left):not(.page-on-right):not(.cached)').find('.page-content');
                    } else {
                        // Usual case
                        pageContent = $('.views').find('.page:not(.page-on-left):not(.page-on-right):not(.cached)').find('.page-content');
                    }
                }

                if (pageContent && pageContent.length > 0) {
                    // Check for tab
                    if (pageContent.hasClass('tab')) {
                        pageContent = pageContent.parent('.tabs').children('.page-content.active');
                    }
                    if (pageContent.length > 0) pageContent.scrollTop(0, 300);
                }
            }

            function handleClicks(e) {
                /*jshint validthis:true */
                var clicked = $(this);
                var url = clicked.attr('href');
                var isLink = clicked[0].nodeName.toLowerCase() === 'a';

                // Check if link is external
                if (isLink) {
                    if (clicked.is(app.params.externalLinks)) {
                        if (clicked.attr('target') === '_system') {
                            e.preventDefault();
                            window.open(url, '_system');
                        }
                        return;
                    }
                }

                // Collect Clicked data- attributes
                var clickedData = clicked.dataset();

                // Smart Select
                if (clicked.hasClass('smart-select')) {
                    if (app.smartSelectOpen) app.smartSelectOpen(clicked);
                }

                // Open Panel
                if (clicked.hasClass('open-panel')) {
                    if ($('.panel').length === 1) {
                        if ($('.panel').hasClass('panel-left')) app.openPanel('left');
                        else app.openPanel('right');
                    } else {
                        if (clickedData.panel === 'right') app.openPanel('right');
                        else app.openPanel('left');
                    }
                }
                // Close Panel
                if (clicked.hasClass('close-panel')) {
                    app.closePanel();
                }

                if (clicked.hasClass('panel-overlay') && app.params.panelsCloseByOutside) {
                    app.closePanel();
                }
                // Popover
                if (clicked.hasClass('open-popover')) {
                    var popover;
                    if (clickedData.popover) {
                        popover = clickedData.popover;
                    } else popover = '.popover';
                    app.popover(popover, clicked);
                }
                if (clicked.hasClass('close-popover')) {
                    app.closeModal('.popover.modal-in');
                }
                // Popup
                var popup;
                if (clicked.hasClass('open-popup')) {
                    if (clickedData.popup) {
                        popup = clickedData.popup;
                    } else popup = '.popup';
                    app.popup(popup);
                }
                if (clicked.hasClass('close-popup')) {
                    if (clickedData.popup) {
                        popup = clickedData.popup;
                    } else popup = '.popup.modal-in';
                    app.closeModal(popup);
                }
                // Login Screen
                var loginScreen;
                if (clicked.hasClass('open-login-screen')) {
                    if (clickedData.loginScreen) {
                        loginScreen = clickedData.loginScreen;
                    } else loginScreen = '.login-screen';
                    app.loginScreen(loginScreen);
                }
                if (clicked.hasClass('close-login-screen')) {
                    app.closeModal('.login-screen.modal-in');
                }
                // Close Modal
                if (clicked.hasClass('modal-overlay')) {
                    if ($('.modal.modal-in').length > 0 && app.params.modalCloseByOutside)
                        app.closeModal('.modal.modal-in');
                    if ($('.actions-modal.modal-in').length > 0 && app.params.actionsCloseByOutside)
                        app.closeModal('.actions-modal.modal-in');

                    if ($('.popover.modal-in').length > 0) app.closeModal('.popover.modal-in');
                }
                if (clicked.hasClass('popup-overlay')) {
                    if ($('.popup.modal-in').length > 0 && app.params.popupCloseByOutside)
                        app.closeModal('.popup.modal-in');
                }

                // Picker
                if (clicked.hasClass('close-picker')) {
                    var pickerToClose = $('.picker-modal.modal-in');
                    if (pickerToClose.length > 0) {
                        app.closeModal(pickerToClose);
                    } else {
                        pickerToClose = $('.popover.modal-in .picker-modal');
                        if (pickerToClose.length > 0) {
                            app.closeModal(pickerToClose.parents('.popover'));
                        }
                    }
                }
                if (clicked.hasClass('open-picker')) {
                    var pickerToOpen;
                    if (clickedData.picker) {
                        pickerToOpen = clickedData.picker;
                    } else pickerToOpen = '.picker-modal';
                    app.pickerModal(pickerToOpen, clicked);
                }

                // Tabs
                var isTabLink;
                if (clicked.hasClass('tab-link')) {
                    isTabLink = true;
                    app.showTab(clickedData.tab || clicked.attr('href'), clicked);
                }
                // Swipeout Close
                if (clicked.hasClass('swipeout-close')) {
                    app.swipeoutClose(clicked.parents('.swipeout-opened'));
                }
                // Swipeout Delete
                if (clicked.hasClass('swipeout-delete')) {
                    if (clickedData.confirm) {
                        var text = clickedData.confirm;
                        var title = clickedData.confirmTitle;
                        if (title) {
                            app.confirm(text, title, function() {
                                app.swipeoutDelete(clicked.parents('.swipeout'));
                            });
                        } else {
                            app.confirm(text, function() {
                                app.swipeoutDelete(clicked.parents('.swipeout'));
                            });
                        }
                    } else {
                        app.swipeoutDelete(clicked.parents('.swipeout'));
                    }

                }
                // Sortable
                if (clicked.hasClass('toggle-sortable')) {
                    app.sortableToggle(clickedData.sortable);
                }
                if (clicked.hasClass('open-sortable')) {
                    app.sortableOpen(clickedData.sortable);
                }
                if (clicked.hasClass('close-sortable')) {
                    app.sortableClose(clickedData.sortable);
                }
                // Accordion
                if (clicked.hasClass('accordion-item-toggle') || (clicked.hasClass('item-link') && clicked.parent().hasClass('accordion-item'))) {
                    var accordionItem = clicked.parent('.accordion-item');
                    if (accordionItem.length === 0) accordionItem = clicked.parents('.accordion-item');
                    if (accordionItem.length === 0) accordionItem = clicked.parents('li');
                    app.accordionToggle(accordionItem);
                }

                // Load Page
                if (app.params.ajaxLinks && !clicked.is(app.params.ajaxLinks) || !isLink || !app.params.router) {
                    return;
                }
                if (isLink) {
                    e.preventDefault();
                }

                var validUrl = url && url.length > 0 && !(/^#.*|^javascript:void.*|^tel:.*|^sms:.*|^mailto:.*/i.test(url)) && !isTabLink;

                var template = clickedData.template;
                if (validUrl || clicked.hasClass('back') || template) {

                    var options = {
                        ignoreCache: clickedData.ignoreCache,
                        force: clickedData.force,
                        reload: clickedData.reload,
                        reloadPrevious: clickedData.reloadPrevious,
                        url: url
                    };

                    if (clicked.hasClass('back')) app.router.back(options);
                    else app.router.load(options);
                }

                if (/^tel:.*|^sms:.*|^mailto:.*/i.test(url)) {
                    window.location.href = url;
                }
            }
            $(document).on('click', 'a, .open-panel, .close-panel, .panel-overlay, .modal-overlay, .popup-overlay, .swipeout-delete, .swipeout-close, .close-popup, .open-popup, .open-popover, .open-login-screen, .close-login-screen .smart-select, .toggle-sortable, .open-sortable, .close-sortable, .accordion-item-toggle, .close-picker', handleClicks);
            if (app.params.scrollTopOnNavbarClick || app.params.scrollTopOnStatusbarClick) {
                $(document).on('click', '.statusbar-overlay, .navbar .center', handleScrollTop);
            }

            // Prevent scrolling on overlays
            function preventScrolling(e) {
                e.preventDefault();
            }
            if (app.support.touch && !app.device.android) {
                $(document).on((app.params.fastClicks ? 'touchstart' : 'touchmove'), '.panel-overlay, .modal-overlay, .preloader-indicator-overlay-new, .popup-overlay, .searchbar-overlay', preventScrolling);
            }
        };

        /*===============================================================================
        ************   Store and parse forms data   ************
        ===============================================================================*/
        app.formsData = {};
        app.formStoreData = function(formId, formJSON) {
            // Store form data in app.formsData
            app.formsData[formId] = formJSON;

            // Store form data in local storage also
            app.ls['f7form-' + formId] = JSON.stringify(formJSON);
        };
        app.formDeleteData = function(formId) {
            // Delete form data from app.formsData
            if (app.formsData[formId]) {
                app.formsData[formId] = '';
                delete app.formsData[formId];
            }

            // Delete form data from local storage also
            if (app.ls['f7form-' + formId]) {
                app.ls['f7form-' + formId] = '';
                app.ls.removeItem('f7form-' + formId);
            }
        };
        app.formGetData = function(formId) {
            // First of all check in local storage
            if (app.ls['f7form-' + formId]) {
                return JSON.parse(app.ls['f7form-' + formId]);
            }
            // Try to get it from formsData obj
            else if (app.formsData[formId]) return app.formsData[formId];
        };
        app.formToJSON = function(form) {
            form = $(form);
            if (form.length !== 1) return false;

            // Form data
            var formData = {};

            // Skip input types
            var skipTypes = ['submit', 'image', 'button', 'file'];
            var skipNames = [];
            form.find('input, select, textarea').each(function() {
                var input = $(this);
                var name = input.attr('name');
                var type = input.attr('type');
                var tag = this.nodeName.toLowerCase();
                if (skipTypes.indexOf(type) >= 0) return;
                if (skipNames.indexOf(name) >= 0 || !name) return;
                if (tag === 'select' && input.attr('multiple')) {
                    skipNames.push(name);
                    formData[name] = [];
                    form.find('select[name="' + name + '"] option').each(function() {
                        if (this.selected) formData[name].push(this.value);
                    });
                } else {
                    switch (type) {
                        case 'checkbox':
                            skipNames.push(name);
                            formData[name] = [];
                            form.find('input[name="' + name + '"]').each(function() {
                                if (this.checked) formData[name].push(this.value);
                            });
                            break;
                        case 'radio':
                            skipNames.push(name);
                            form.find('input[name="' + name + '"]').each(function() {
                                if (this.checked) formData[name] = this.value;
                            });
                            break;
                        default:
                            formData[name] = input.val();
                            break;
                    }
                }

            });
            form.trigger('formToJSON', {
                formData: formData
            });

            return formData;
        };
        app.formFromJSON = function(form, formData) {
            form = $(form);
            if (form.length !== 1) return false;

            // Skip input types
            var skipTypes = ['submit', 'image', 'button', 'file'];
            var skipNames = [];

            form.find('input, select, textarea').each(function() {
                var input = $(this);
                var name = input.attr('name');
                var type = input.attr('type');
                var tag = this.nodeName.toLowerCase();
                if (!formData[name]) return;
                if (skipTypes.indexOf(type) >= 0) return;
                if (skipNames.indexOf(name) >= 0 || !name) return;
                if (tag === 'select' && input.attr('multiple')) {
                    skipNames.push(name);
                    form.find('select[name="' + name + '"] option').each(function() {
                        if (formData[name].indexOf(this.value) >= 0) this.selected = true;
                        else this.selected = false;
                    });
                } else {
                    switch (type) {
                        case 'checkbox':
                            skipNames.push(name);
                            form.find('input[name="' + name + '"]').each(function() {
                                if (formData[name].indexOf(this.value) >= 0) this.checked = true;
                                else this.checked = false;
                            });
                            break;
                        case 'radio':
                            skipNames.push(name);
                            form.find('input[name="' + name + '"]').each(function() {
                                if (formData[name] === this.value) this.checked = true;
                                else this.checked = false;
                            });
                            break;
                        default:
                            input.val(formData[name]);
                            break;
                    }
                }

            });
            form.trigger('formFromJSON', {
                formData: formData
            });
        };
        app.initFormsStorage = function(pageContainer) {
            pageContainer = $(pageContainer);
            if (pageContainer.length === 0) return;

            var forms = pageContainer.find('form.store-data');
            if (forms.length === 0) return;

            // Parse forms data and fill form if there is such data
            forms.each(function() {
                var id = this.getAttribute('id');
                if (!id) return;
                var formData = app.formGetData(id);
                if (formData) app.formFromJSON(this, formData);
            });
            // Update forms data on inputs change
            function storeForm() {
                /*jshint validthis:true */
                var form = $(this);
                var formId = form[0].id;
                if (!formId) return;
                var formJSON = app.formToJSON(form);
                if (!formJSON) return;
                app.formStoreData(formId, formJSON);
                form.trigger('store', {
                    data: formJSON
                });
            }
            forms.on('change submit', storeForm);

            // Detach Listeners
            function pageBeforeRemove() {
                forms.off('change submit', storeForm);
                pageContainer.off('pageBeforeRemove', pageBeforeRemove);
            }
            pageContainer.on('pageBeforeRemove', pageBeforeRemove);
        };

        // Ajax submit on forms
        $(document).on('submit change', 'form.ajax-submit, form.ajax-submit-onchange', function(e) {
            var form = $(this);
            if (e.type === 'change' && !form.hasClass('ajax-submit-onchange')) return;
            if (e.type === 'submit') e.preventDefault();

            var method = form.attr('method') || 'GET';
            var contentType = form.prop('enctype') || form.attr('enctype');

            var url = form.attr('action');
            if (!url) return;

            var data;
            if (method === 'POST') data = new FormData(form[0]);
            else data = $.serializeObject(app.formToJSON(form[0]));

            var xhr = $.ajax({
                method: method,
                url: url,
                contentType: contentType,
                data: data,
                beforeSend: function(xhr) {
                    form.trigger('beforeSubmit', {
                        data: data,
                        xhr: xhr
                    });
                },
                error: function(xhr) {
                    form.trigger('submitError', {
                        data: data,
                        xhr: xhr
                    });
                },
                success: function(data) {
                    form.trigger('submitted', {
                        data: data,
                        xhr: xhr
                    });
                }
            });
        });


        /*======================================================
        ************   Picker   ************
        ======================================================*/
        var Picker = function(params) {
            var p = this;
            var defaults = {
                updateValuesOnMomentum: false,
                updateValuesOnTouchmove: true,
                rotateEffect: false,
                momentumRatio: 7,
                freeMode: false,
                // Common settings
                scrollToInput: true,
                inputReadOnly: true,
                convertToPopover: true,
                onlyInPopover: false,
                toolbar: true,
                toolbarCloseText: 'Done',
                toolbarTemplate: '<div class="toolbar">' +
                    '<div class="toolbar-inner">' +
                    '<div class="left"></div>' +
                    '<div class="right">' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            };
            params = params || {};
            for (var def in defaults) {
                if (typeof params[def] === 'undefined') {
                    params[def] = defaults[def];
                }
            }
            p.params = params;
            p.cols = [];
            p.initialized = false;

            // Inline flag
            p.inline = p.params.container ? true : false;

            // 3D Transforms origin bug, only on safari
            var originBug = app.device.ios || (navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0) && !app.device.android;

            // Should be converted to popover
            function isPopover() {
                var toPopover = false;
                if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
                if (!p.inline && p.params.input) {
                    if (p.params.onlyInPopover) toPopover = true;
                    else {
                        if (app.device.ios) {
                            toPopover = app.device.ipad ? true : false;
                        } else {
                            if ($(window).width() >= 768) toPopover = true;
                        }
                    }
                }
                return toPopover;
            }

            function inPopover() {
                if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
                else return false;
            }

            // Value
            p.setValue = function(arrValues, transition) {
                var valueIndex = 0;
                for (var i = 0; i < p.cols.length; i++) {
                    if (p.cols[i] && !p.cols[i].divider) {
                        p.cols[i].setValue(arrValues[valueIndex], transition);
                        valueIndex++;
                    }
                }
            };
            p.updateValue = function() {
                var newValue = [];
                var newDisplayValue = [];
                for (var i = 0; i < p.cols.length; i++) {
                    if (!p.cols[i].divider) {
                        newValue.push(p.cols[i].value);
                        newDisplayValue.push(p.cols[i].displayValue);
                    }
                }
                if (newValue.indexOf(undefined) >= 0) {
                    return;
                }
                p.value = newValue;
                p.displayValue = newDisplayValue;
                if (p.params.onChange) {
                    p.params.onChange(p, p.value, p.displayValue);
                }
                if (p.input && p.input.length > 0) {
                    $(p.input).val(p.params.formatValue ? p.params.formatValue(p, p.value, p.displayValue) : p.value.join(' '));
                    $(p.input).trigger('change');
                }
            };

            // Columns Handlers
            p.initPickerCol = function(colElement, updateItems) {
                var colContainer = $(colElement);
                var colIndex = colContainer.index();
                var col = p.cols[colIndex];
                if (col.divider) return;
                col.container = colContainer;
                col.wrapper = col.container.find('.picker-items-col-wrapper');
                col.items = col.wrapper.find('.picker-item');

                var i, j;
                var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
                col.replaceValues = function(values, displayValues) {
                    col.destroyEvents();
                    col.values = values;
                    col.displayValues = displayValues;
                    var newItemsHTML = p.columnHTML(col, true);
                    col.wrapper.html(newItemsHTML);
                    col.items = col.wrapper.find('.picker-item');
                    col.calcSize();
                    col.setValue(col.values[0], 0, true);
                    col.initEvents();
                };
                col.calcSize = function() {
                    if (p.params.rotateEffect) {
                        col.container.removeClass('picker-items-col-absolute');
                        if (!col.width) col.container.css({
                            width: ''
                        });
                    }
                    var colWidth, colHeight;
                    colWidth = 0;
                    colHeight = col.container[0].offsetHeight;
                    wrapperHeight = col.wrapper[0].offsetHeight;
                    itemHeight = col.items[0].offsetHeight;
                    itemsHeight = itemHeight * col.items.length;
                    minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                    maxTranslate = colHeight / 2 - itemHeight / 2;
                    if (col.width) {
                        colWidth = col.width;
                        if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
                        col.container.css({
                            width: colWidth
                        });
                    }
                    if (p.params.rotateEffect) {
                        if (!col.width) {
                            col.items.each(function() {
                                var item = $(this);
                                item.css({
                                    width: 'auto'
                                });
                                colWidth = Math.max(colWidth, item[0].offsetWidth);
                                item.css({
                                    width: ''
                                });
                            });
                            col.container.css({
                                width: (colWidth + 2) + 'px'
                            });
                        }
                        col.container.addClass('picker-items-col-absolute');
                    }
                };
                col.calcSize();

                col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);


                var activeIndex = 0;
                var animationFrameId;

                // Set Value Function
                col.setValue = function(newValue, transition, valueCallbacks) {
                    if (typeof transition === 'undefined') transition = '';
                    var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
                    if (typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                        return;
                    }
                    var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
                    // Update wrapper
                    col.wrapper.transition(transition);
                    col.wrapper.transform('translate3d(0,' + (newTranslate) + 'px,0)');

                    // Watch items
                    if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex) {
                        $.cancelAnimationFrame(animationFrameId);
                        col.wrapper.transitionEnd(function() {
                            $.cancelAnimationFrame(animationFrameId);
                        });
                        updateDuringScroll();
                    }

                    // Update items
                    col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
                };

                col.updateItems = function(activeIndex, translate, transition, valueCallbacks) {
                    if (typeof translate === 'undefined') {
                        translate = $.getTranslate(col.wrapper[0], 'y');
                    }
                    if (typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate) / itemHeight);
                    if (activeIndex < 0) activeIndex = 0;
                    if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
                    var previousActiveIndex = col.activeIndex;
                    col.activeIndex = activeIndex;
                    col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');

                    col.items.transition(transition);
                    var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
                    var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                    var nextItems = selectedItem.nextAll().addClass('picker-after-selected');

                    // Set 3D rotate effect
                    if (p.params.rotateEffect) {
                        var percentage = (translate - (Math.floor((translate - maxTranslate) / itemHeight) * itemHeight + maxTranslate)) / itemHeight;

                        col.items.each(function() {
                            var item = $(this);
                            var itemOffsetTop = item.index() * itemHeight;
                            var translateOffset = maxTranslate - translate;
                            var itemOffset = itemOffsetTop - translateOffset;
                            var percentage = itemOffset / itemHeight;

                            var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

                            var angle = (-18 * percentage);
                            if (angle > 180) angle = 180;
                            if (angle < -180) angle = -180;
                            // Far class
                            if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                            else item.removeClass('picker-item-far');
                            // Set transform
                            item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                        });
                    }

                    if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                        // Update values
                        col.value = selectedItem.attr('data-picker-value');
                        col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                        // On change callback
                        if (previousActiveIndex !== activeIndex) {
                            if (col.onChange) {
                                col.onChange(p, col.value, col.displayValue);
                            }
                            p.updateValue();
                        }
                    }
                };

                function updateDuringScroll() {
                    animationFrameId = $.requestAnimationFrame(function() {
                        col.updateItems(undefined, undefined, 0);
                        updateDuringScroll();
                    });
                }

                // Update items on init
                if (updateItems) col.updateItems(0, maxTranslate, 0);

                var allowItemClick = true;
                var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;

                function handleTouchStart(e) {
                    if (isMoved || isTouched) return;
                    e.preventDefault();
                    isTouched = true;
                    touchStartY = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                    touchStartTime = (new Date()).getTime();

                    allowItemClick = true;
                    startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                }

                function handleTouchMove(e) {
                    if (!isTouched) return;
                    e.preventDefault();
                    allowItemClick = false;
                    touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                    if (!isMoved) {
                        // First move
                        $.cancelAnimationFrame(animationFrameId);
                        isMoved = true;
                        startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                        col.wrapper.transition(0);
                    }
                    e.preventDefault();

                    var diff = touchCurrentY - touchStartY;
                    currentTranslate = startTranslate + diff;
                    returnTo = undefined;

                    // Normalize translate
                    if (currentTranslate < minTranslate) {
                        currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                        returnTo = 'min';
                    }
                    if (currentTranslate > maxTranslate) {
                        currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                        returnTo = 'max';
                    }
                    // Transform wrapper
                    col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

                    // Update items
                    col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);

                    // Calc velocity
                    velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                    velocityTime = (new Date()).getTime();
                    prevTranslate = currentTranslate;
                }

                function handleTouchEnd(e) {
                    if (!isTouched || !isMoved) {
                        isTouched = isMoved = false;
                        return;
                    }
                    isTouched = isMoved = false;
                    col.wrapper.transition('');
                    if (returnTo) {
                        if (returnTo === 'min') {
                            col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
                        } else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
                    }
                    touchEndTime = new Date().getTime();
                    var velocity, newTranslate;
                    if (touchEndTime - touchStartTime > 300) {
                        newTranslate = currentTranslate;
                    } else {
                        velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                        newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
                    }

                    newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

                    // Active Index
                    var activeIndex = -Math.floor((newTranslate - maxTranslate) / itemHeight);

                    // Normalize translate
                    if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

                    // Transform wrapper
                    col.wrapper.transform('translate3d(0,' + (parseInt(newTranslate, 10)) + 'px,0)');

                    // Update items
                    col.updateItems(activeIndex, newTranslate, '', true);

                    // Watch items
                    if (p.params.updateValuesOnMomentum) {
                        updateDuringScroll();
                        col.wrapper.transitionEnd(function() {
                            $.cancelAnimationFrame(animationFrameId);
                        });
                    }

                    // Allow click
                    setTimeout(function() {
                        allowItemClick = true;
                    }, 100);
                }

                function handleClick(e) {
                    if (!allowItemClick) return;
                    $.cancelAnimationFrame(animationFrameId);
                    /*jshint validthis:true */
                    var value = $(this).attr('data-picker-value');
                    col.setValue(value);
                }

                col.initEvents = function(detach) {
                    var method = detach ? 'off' : 'on';
                    col.container[method](app.touchEvents.start, handleTouchStart);
                    col.container[method](app.touchEvents.move, handleTouchMove);
                    col.container[method](app.touchEvents.end, handleTouchEnd);
                    col.items[method]('click', handleClick);
                };
                col.destroyEvents = function() {
                    col.initEvents(true);
                };

                col.container[0].f7DestroyPickerCol = function() {
                    col.destroyEvents();
                };

                col.initEvents();

            };
            p.destroyPickerCol = function(colContainer) {
                colContainer = $(colContainer);
                if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
            };
            // Resize cols
            function resizeCols() {
                if (!p.opened) return;
                for (var i = 0; i < p.cols.length; i++) {
                    if (!p.cols[i].divider) {
                        p.cols[i].calcSize();
                        p.cols[i].setValue(p.cols[i].value, 0, false);
                    }
                }
            }
            $(window).on('resize', resizeCols);

            // HTML Layout
            p.columnHTML = function(col, onlyItems) {
                var columnItemsHTML = '';
                var columnHTML = '';
                if (col.divider) {
                    columnHTML += '<div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
                } else {
                    for (var j = 0; j < col.values.length; j++) {
                        columnItemsHTML += '<div class="picker-item" data-picker-value="' + col.values[j] + '">' + (col.displayValues ? col.displayValues[j] : col.values[j]) + '</div>';
                    }
                    columnHTML += '<div class="picker-items-col ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '"><div class="picker-items-col-wrapper">' + columnItemsHTML + '</div></div>';
                }
                return onlyItems ? columnItemsHTML : columnHTML;
            };
            p.layout = function() {
                var pickerHTML = '';
                var pickerClass = '';
                var i;
                p.cols = [];
                var colsHTML = '';
                for (i = 0; i < p.params.cols.length; i++) {
                    var col = p.params.cols[i];
                    colsHTML += p.columnHTML(p.params.cols[i]);
                    p.cols.push(col);
                }
                pickerClass = 'picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '');
                pickerHTML =
                    '<div class="' + (pickerClass) + '">' +
                    (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '') +
                    '<div class="picker-modal-inner picker-items">' +
                    colsHTML +
                    '<div class="picker-center-highlight"></div>' +
                    '</div>' +
                    '</div>';

                p.pickerHTML = pickerHTML;
            };

            // Input Events
            function openOnInput(e) {
                e.preventDefault();
                if (p.opened) return;
                p.open();
                if (p.params.scrollToInput && !isPopover()) {
                    var pageContent = p.input.parents('.page-content');
                    if (pageContent.length === 0) return;

                    var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                        paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                        pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                        pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                        newPaddingBottom;
                    var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                    if (inputTop > pageHeight) {
                        var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                        if (scrollTop + pageHeight > pageScrollHeight) {
                            newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                            if (pageHeight === pageScrollHeight) {
                                newPaddingBottom = p.container.height();
                            }
                            pageContent.css({
                                'padding-bottom': (newPaddingBottom) + 'px'
                            });
                        }
                        pageContent.scrollTop(scrollTop, 300);
                    }
                }
            }

            function closeOnHTMLClick(e) {
                if (inPopover()) return;
                if (p.input && p.input.length > 0) {
                    if (e.target !== p.input[0] && $(e.target).parents('.picker-modal').length === 0) p.close();
                } else {
                    if ($(e.target).parents('.picker-modal').length === 0) p.close();
                }
            }

            if (p.params.input) {
                p.input = $(p.params.input);
                if (p.input.length > 0) {
                    if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                    if (!p.inline) {
                        p.input.on('click', openOnInput);
                    }
                    if (p.params.inputReadOnly) {
                        p.input.on('focus mousedown', function(e) {
                            e.preventDefault();
                        });
                    }
                }

            }

            if (!p.inline) $('html').on('click', closeOnHTMLClick);

            // Open
            function onPickerClose() {
                p.opened = false;
                if (p.input && p.input.length > 0) p.input.parents('.page-content').css({
                    'padding-bottom': ''
                });
                if (p.params.onClose) p.params.onClose(p);

                // Destroy events
                p.container.find('.picker-items-col').each(function() {
                    p.destroyPickerCol(this);
                });
            }

            p.opened = false;
            p.open = function() {
                var toPopover = isPopover();

                if (!p.opened) {

                    // Layout
                    p.layout();

                    // Append
                    if (toPopover) {
                        p.pickerHTML = '<div class="popover popover-picker-columns"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                        p.popover = app.popover(p.pickerHTML, p.params.input, true);
                        p.container = $(p.popover).find('.picker-modal');
                        $(p.popover).on('close', function() {
                            onPickerClose();
                        });
                    } else if (p.inline) {
                        p.container = $(p.pickerHTML);
                        p.container.addClass('picker-modal-inline');
                        $(p.params.container).append(p.container);
                    } else {
                        p.container = $(app.pickerModal(p.pickerHTML));
                        $(p.container)
                            .on('close', function() {
                                onPickerClose();
                            });
                    }

                    // Store picker instance
                    p.container[0].f7Picker = p;

                    // Init Events
                    p.container.find('.picker-items-col').each(function() {
                        var updateItems = true;
                        if ((!p.initialized && p.params.value) || (p.initialized && p.value)) updateItems = false;
                        p.initPickerCol(this, updateItems);
                    });

                    // Set value
                    if (!p.initialized) {
                        if (p.params.value) {
                            p.setValue(p.params.value, 0);
                        }
                    } else {
                        if (p.value) p.setValue(p.value, 0);
                    }
                }

                // Set flag
                p.opened = true;
                p.initialized = true;

                if (p.params.onOpen) p.params.onOpen(p);
            };

            // Close
            p.close = function() {
                if (!p.opened || p.inline) return;
                if (inPopover()) {
                    app.closeModal(p.popover);
                    return;
                } else {
                    app.closeModal(p.container);
                    return;
                }
            };

            // Destroy
            p.destroy = function() {
                p.close();
                if (p.params.input && p.input.length > 0) {
                    p.input.off('click focus', openOnInput);
                }
                $('html').off('click', closeOnHTMLClick);
                $(window).off('resize', resizeCols);
            };

            if (p.inline) {
                p.open();
            }

            return p;
        };
        app.picker = function(params) {
            return new Picker(params);
        };

        /*======================================================
        ************   Calendar   ************
        ======================================================*/
        var Calendar = function(params) {
            var p = this;
            var defaults = {
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                firstDay: 1, // First day of the week, Monday
                weekendDays: [0, 6], // Sunday and Saturday
                multiple: false,
                dateFormat: 'yyyy-mm-dd',
                direction: 'horizontal', // or 'vertical'
                minDate: null,
                maxDate: null,
                touchMove: true,
                animate: true,
                closeOnSelect: false,
                monthPicker: true,
                monthPickerTemplate: '<div class="picker-calendar-month-picker">' +
                    '<a href="#" class="link icon-only picker-calendar-prev-month"><i class="icon icon-prev"></i></a>' +
                    '<span class="current-month-value"></span>' +
                    '<a href="#" class="link icon-only picker-calendar-next-month"><i class="icon icon-next"></i></a>' +
                    '</div>',
                yearPicker: true,
                yearPickerTemplate: '<div class="picker-calendar-year-picker">' +
                    '<a href="#" class="link icon-only picker-calendar-prev-year"><i class="icon icon-prev"></i></a>' +
                    '<span class="current-year-value"></span>' +
                    '<a href="#" class="link icon-only picker-calendar-next-year"><i class="icon icon-next"></i></a>' +
                    '</div>',
                weekHeader: true,
                // Common settings
                scrollToInput: true,
                inputReadOnly: true,
                convertToPopover: true,
                onlyInPopover: false,
                toolbar: true,
                toolbarCloseText: 'Done',
                toolbarTemplate: '<div class="toolbar">' +
                    '<div class="toolbar-inner">' +
                    '{{monthPicker}}' +
                    '{{yearPicker}}' +
                    // '<a href="#" class="link close-picker">{{closeText}}</a>' +
                    '</div>' +
                    '</div>',
                /* Callbacks
                onMonthAdd
                onChange
                onOpen
                onClose
                onDayClick
                onMonthYearChangeStart
                onMonthYearChangeEnd
                */
            };
            params = params || {};
            for (var def in defaults) {
                if (typeof params[def] === 'undefined') {
                    params[def] = defaults[def];
                }
            }
            p.params = params;
            p.initialized = false;

            // Inline flag
            p.inline = p.params.container ? true : false;

            // Is horizontal
            p.isH = p.params.direction === 'horizontal';

            // RTL inverter
            var inverter = p.isH ? (app.rtl ? -1 : 1) : 1;

            // Animating flag
            p.animating = false;

            // Should be converted to popover
            function isPopover() {
                var toPopover = false;
                if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
                if (!p.inline && p.params.input) {
                    if (p.params.onlyInPopover) toPopover = true;
                    else {
                        if (app.device.ios) {
                            toPopover = app.device.ipad ? true : false;
                        } else {
                            if ($(window).width() >= 768) toPopover = true;
                        }
                    }
                }
                return toPopover;
            }

            function inPopover() {
                if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
                else return false;
            }

            // Format date
            function formatDate(date) {
                date = new Date(date);
                var year = date.getFullYear();
                var month = date.getMonth();
                var month1 = month + 1;
                var day = date.getDate();
                var weekDay = date.getDay();

                return p.params.dateFormat
                    .replace(/yyyy/g, year)
                    .replace(/yy/g, (year + '').substring(2))
                    .replace(/mm/g, month1 < 10 ? '0' + month1 : month1)
                    .replace(/m\W+/g, month1 + '$1')
                    .replace(/MM/g, p.params.monthNames[month])
                    .replace(/M\W+/g, p.params.monthNamesShort[month] + '$1')
                    .replace(/dd/g, day < 10 ? '0' + day : day)
                    .replace(/d\W+/g, day + '$1')
                    .replace(/DD/g, p.params.dayNames[weekDay])
                    .replace(/D\W+/g, p.params.dayNamesShort[weekDay] + '$1');
            }


            // Value
            p.addValue = function(value) {
                if (p.params.multiple) {
                    if (!p.value) p.value = [];
                    var inValuesIndex;
                    for (var i = 0; i < p.value.length; i++) {
                        if (new Date(value).getTime() === new Date(p.value[i]).getTime()) {
                            inValuesIndex = i;
                        }
                    }
                    if (typeof inValuesIndex === 'undefined') {
                        p.value.push(value);
                    } else {
                        p.value.splice(inValuesIndex, 1);
                    }
                    p.updateValue();
                } else {
                    p.value = [value];
                    p.updateValue();
                }
            };
            p.setValue = function(arrValues) {
                p.value = arrValues;
                p.updateValue();
            };
            p.updateValue = function() {
                p.wrapper.find('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
                var i, inputValue;
                for (i = 0; i < p.value.length; i++) {
                    var valueDate = new Date(p.value[i]);
                    p.wrapper.find('.picker-calendar-day[data-date="' + valueDate.getFullYear() + '-' + valueDate.getMonth() + '-' + valueDate.getDate() + '"]').addClass('picker-calendar-day-selected');
                }
                if (p.params.onChange) {
                    p.params.onChange(p, p.value);
                }
                if (p.input && p.input.length > 0) {
                    if (p.params.formatValue) inputValue = p.params.formatValue(p, p.value);
                    else {
                        inputValue = [];
                        for (i = 0; i < p.value.length; i++) {
                            inputValue.push(formatDate(p.value[i]));
                        }
                        inputValue = inputValue.join(', ');
                    }
                    $(p.input).val(inputValue);
                    $(p.input).trigger('change');
                }
            };

            // Columns Handlers
            p.initCalendarEvents = function() {
                var col;
                var allowItemClick = true;
                var isTouched, isMoved, touchStartX, touchStartY, touchCurrentX, touchCurrentY, touchStartTime, touchEndTime, startTranslate, currentTranslate, wrapperWidth, wrapperHeight, percentage, touchesDiff, isScrolling;

                function handleTouchStart(e) {
                    if (isMoved || isTouched) return;
                    // e.preventDefault();
                    isTouched = true;
                    touchStartX = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                    touchStartY = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                    touchStartTime = (new Date()).getTime();
                    percentage = 0;
                    allowItemClick = true;
                    isScrolling = undefined;
                    startTranslate = currentTranslate = p.monthsTranslate;
                }

                function handleTouchMove(e) {
                    if (!isTouched) return;

                    touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                    touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                    if (typeof isScrolling === 'undefined') {
                        isScrolling = !!(isScrolling || Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX));
                    }
                    if (p.isH && isScrolling) {
                        isTouched = false;
                        return;
                    }
                    e.preventDefault();
                    if (p.animating) {
                        isTouched = false;
                        return;
                    }
                    allowItemClick = false;
                    if (!isMoved) {
                        // First move
                        isMoved = true;
                        wrapperWidth = p.wrapper[0].offsetWidth;
                        wrapperHeight = p.wrapper[0].offsetHeight;
                        p.wrapper.transition(0);
                    }
                    e.preventDefault();

                    touchesDiff = p.isH ? touchCurrentX - touchStartX : touchCurrentY - touchStartY;
                    percentage = touchesDiff / (p.isH ? wrapperWidth : wrapperHeight);
                    currentTranslate = (p.monthsTranslate * inverter + percentage) * 100;

                    // Transform wrapper
                    p.wrapper.transform('translate3d(' + (p.isH ? currentTranslate : 0) + '%, ' + (p.isH ? 0 : currentTranslate) + '%, 0)');

                }

                function handleTouchEnd(e) {
                    if (!isTouched || !isMoved) {
                        isTouched = isMoved = false;
                        return;
                    }
                    isTouched = isMoved = false;

                    touchEndTime = new Date().getTime();
                    if (touchEndTime - touchStartTime < 300) {
                        if (Math.abs(touchesDiff) < 10) {
                            p.resetMonth();
                        } else if (touchesDiff >= 10) {
                            if (app.rtl) p.nextMonth();
                            else p.prevMonth();
                        } else {
                            if (app.rtl) p.prevMonth();
                            else p.nextMonth();
                        }
                    } else {
                        if (percentage <= -0.5) {
                            if (app.rtl) p.prevMonth();
                            else p.nextMonth();
                        } else if (percentage >= 0.5) {
                            if (app.rtl) p.nextMonth();
                            else p.prevMonth();
                        } else {
                            p.resetMonth();
                        }
                    }

                    // Allow click
                    setTimeout(function() {
                        allowItemClick = true;
                    }, 100);
                }

                function handleDayClick(e) {
                    if (!allowItemClick) return;
                    var day = $(e.target).parents('.picker-calendar-day');
                    if (day.length === 0 && $(e.target).hasClass('picker-calendar-day')) {
                        day = $(e.target);
                    }
                    if (day.length === 0) return;
                    if (day.hasClass('picker-calendar-day-selected') && !p.params.multiple) return;
                    if (day.hasClass('picker-calendar-day-disabled')) return;
                    if (day.hasClass('picker-calendar-day-next')) p.nextMonth();
                    if (day.hasClass('picker-calendar-day-prev')) p.prevMonth();
                    var dateYear = day.attr('data-year');
                    var dateMonth = day.attr('data-month');
                    var dateDay = day.attr('data-day');
                    if (p.params.onDayClick) {
                        p.params.onDayClick(p, day[0], dateYear, dateMonth, dateDay);
                    }
                    p.addValue(new Date(dateYear, dateMonth, dateDay).getTime());
                    if (p.params.closeOnSelect) p.close();
                }

                p.container.find('.picker-calendar-prev-month').on('click', p.prevMonth);
                p.container.find('.picker-calendar-next-month').on('click', p.nextMonth);
                p.container.find('.picker-calendar-prev-year').on('click', p.prevYear);
                p.container.find('.picker-calendar-next-year').on('click', p.nextYear);
                p.wrapper.on('click', handleDayClick);
                if (p.params.touchMove) {
                    p.wrapper.on(app.touchEvents.start, handleTouchStart);
                    p.wrapper.on(app.touchEvents.move, handleTouchMove);
                    p.wrapper.on(app.touchEvents.end, handleTouchEnd);
                }

                p.container[0].f7DestroyCalendarEvents = function() {
                    p.container.find('.picker-calendar-prev-month').off('click', p.prevMonth);
                    p.container.find('.picker-calendar-next-month').off('click', p.nextMonth);
                    p.container.find('.picker-calendar-prev-year').off('click', p.prevYear);
                    p.container.find('.picker-calendar-next-year').off('click', p.nextYear);
                    p.wrapper.off('click', handleDayClick);
                    if (p.params.touchMove) {
                        p.wrapper.off(app.touchEvents.start, handleTouchStart);
                        p.wrapper.off(app.touchEvents.move, handleTouchMove);
                        p.wrapper.off(app.touchEvents.end, handleTouchEnd);
                    }
                };


            };
            p.destroyCalendarEvents = function(colContainer) {
                if ('f7DestroyCalendarEvents' in p.container[0]) p.container[0].f7DestroyCalendarEvents();
            };

            // Calendar Methods
            p.daysInMonth = function(date) {
                var d = new Date(date);
                return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            };
            p.monthHTML = function(date, offset) {
                date = new Date(date);
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate();
                if (offset === 'next') {
                    if (month === 11) date = new Date(year + 1, 0);
                    else date = new Date(year, month + 1, 1);
                }
                if (offset === 'prev') {
                    if (month === 0) date = new Date(year - 1, 11);
                    else date = new Date(year, month - 1, 1);
                }
                if (offset === 'next' || offset === 'prev') {
                    month = date.getMonth();
                    year = date.getFullYear();
                }
                var daysInPrevMonth = p.daysInMonth(new Date(date.getFullYear(), date.getMonth()).getTime() - 10 * 24 * 60 * 60 * 1000),
                    daysInMonth = p.daysInMonth(date),
                    firstDayOfMonthIndex = new Date(date.getFullYear(), date.getMonth()).getDay();
                if (firstDayOfMonthIndex === 0) firstDayOfMonthIndex = 7;

                var dayDate, currentValues = [],
                    i, j,
                    rows = 6,
                    cols = 7,
                    monthHTML = '',
                    dayIndex = 0 + (p.params.firstDay - 1),
                    today = new Date().setHours(0, 0, 0, 0),
                    minDate = p.params.minDate ? new Date(p.params.minDate).getTime() : null,
                    maxDate = p.params.maxDate ? new Date(p.params.maxDate).getTime() : null;

                if (p.value && p.value.length) {
                    for (i = 0; i < p.value.length; i++) {
                        currentValues.push(new Date(p.value[i]).setHours(0, 0, 0, 0));
                    }
                }

                for (i = 1; i <= rows; i++) {
                    var rowHTML = '';
                    var row = i;
                    for (j = 1; j <= cols; j++) {
                        var col = j;
                        dayIndex++;
                        var dayNumber = dayIndex - firstDayOfMonthIndex;
                        var addClass = '';
                        if (dayNumber < 0) {
                            dayNumber = daysInPrevMonth + dayNumber + 1;
                            addClass += ' picker-calendar-day-prev';
                            dayDate = new Date(month - 1 < 0 ? year - 1 : year, month - 1 < 0 ? 11 : month - 1, dayNumber).getTime();
                        } else {
                            dayNumber = dayNumber + 1;
                            if (dayNumber > daysInMonth) {
                                dayNumber = dayNumber - daysInMonth;
                                addClass += ' picker-calendar-day-next';
                                dayDate = new Date(month + 1 > 11 ? year + 1 : year, month + 1 > 11 ? 0 : month + 1, dayNumber).getTime();
                            } else {
                                dayDate = new Date(year, month, dayNumber).getTime();
                            }
                        }
                        // Today
                        if (dayDate === today) addClass += ' picker-calendar-day-today';
                        // Selected
                        if (currentValues.indexOf(dayDate) >= 0) addClass += ' picker-calendar-day-selected';
                        // Weekend
                        if (p.params.weekendDays.indexOf(col - 1) >= 0) {
                            addClass += ' picker-calendar-day-weekend';
                        }
                        // Disabled
                        if ((minDate && dayDate < minDate) || (maxDate && dayDate > maxDate)) {
                            addClass += ' picker-calendar-day-disabled';
                        }

                        dayDate = new Date(dayDate);
                        var dayYear = dayDate.getFullYear();
                        var dayMonth = dayDate.getMonth();
                        rowHTML += '<div data-year="' + dayYear + '" data-month="' + dayMonth + '" data-day="' + dayNumber + '" class="picker-calendar-day' + (addClass) + '" data-date="' + (dayYear + '-' + dayMonth + '-' + dayNumber) + '"><span>' + dayNumber + '</span></div>';
                    }
                    monthHTML += '<div class="picker-calendar-row">' + rowHTML + '</div>';
                }
                monthHTML = '<div class="picker-calendar-month" data-year="' + year + '" data-month="' + month + '">' + monthHTML + '</div>';
                return monthHTML;
            };
            p.animating = false;
            p.updateCurrentMonthYear = function(dir) {
                if (typeof dir === 'undefined') {
                    p.currentMonth = parseInt(p.months.eq(1).attr('data-month'), 10);
                    p.currentYear = parseInt(p.months.eq(1).attr('data-year'), 10);
                } else {
                    p.currentMonth = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-month'), 10);
                    p.currentYear = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-year'), 10);
                }
                p.container.find('.current-month-value').text(p.params.monthNames[p.currentMonth]);
                p.container.find('.current-year-value').text(p.currentYear);

            };
            p.onMonthChangeStart = function(dir) {
                p.updateCurrentMonthYear(dir);
                p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
                var currentIndex = dir === 'next' ? p.months.length - 1 : 0;

                p.months.eq(currentIndex).addClass('picker-calendar-month-current');
                p.months.eq(dir === 'next' ? currentIndex - 1 : currentIndex + 1).addClass(dir === 'next' ? 'picker-calendar-month-prev' : 'picker-calendar-month-next');

                if (p.params.onMonthYearChangeStart) {
                    p.params.onMonthYearChangeStart(p, p.currentYear, p.currentMonth);
                }
            };
            p.onMonthChangeEnd = function(dir, rebuildBoth) {
                p.animating = false;
                var nextMonthHTML, prevMonthHTML, newMonthHTML;
                p.wrapper.find('.picker-calendar-month:not(.picker-calendar-month-prev):not(.picker-calendar-month-current):not(.picker-calendar-month-next)').remove();

                if (typeof dir === 'undefined') {
                    dir = 'next';
                    rebuildBoth = true;
                }
                if (!rebuildBoth) {
                    newMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), dir);
                } else {
                    p.wrapper.find('.picker-calendar-month-next, .picker-calendar-month-prev').remove();
                    prevMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'prev');
                    nextMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'next');
                }
                if (dir === 'next' || rebuildBoth) {
                    p.wrapper.append(newMonthHTML || nextMonthHTML);
                }
                if (dir === 'prev' || rebuildBoth) {
                    p.wrapper.prepend(newMonthHTML || prevMonthHTML);
                }
                p.months = p.wrapper.find('.picker-calendar-month');
                p.setMonthsTranslate(p.monthsTranslate);
                if (p.params.onMonthAdd) {
                    p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
                }
                if (p.params.onMonthYearChangeEnd) {
                    p.params.onMonthYearChangeEnd(p, p.currentYear, p.currentMonth);
                }
            };
            p.setMonthsTranslate = function(translate) {
                translate = translate || p.monthsTranslate || 0;
                if (typeof p.monthsTranslate === 'undefined') p.monthsTranslate = translate;
                p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
                var prevMonthTranslate = -(translate + 1) * 100 * inverter;
                var currentMonthTranslate = -translate * 100 * inverter;
                var nextMonthTranslate = -(translate - 1) * 100 * inverter;
                p.months.eq(0).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
                p.months.eq(1).transform('translate3d(' + (p.isH ? currentMonthTranslate : 0) + '%, ' + (p.isH ? 0 : currentMonthTranslate) + '%, 0)').addClass('picker-calendar-month-current');
                p.months.eq(2).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
            };
            p.nextMonth = function(transition) {
                if (typeof transition === 'undefined' || typeof transition === 'object') {
                    transition = '';
                    if (!p.params.animate) transition = 0;
                }
                var nextMonth = parseInt(p.months.eq(p.months.length - 1).attr('data-month'), 10);
                var nextYear = parseInt(p.months.eq(p.months.length - 1).attr('data-year'), 10);
                var nextDate = new Date(nextYear, nextMonth);
                var nextDateTime = nextDate.getTime();
                var transitionEndCallback = p.animating ? false : true;
                if (p.params.maxDate) {
                    if (nextDateTime > new Date(p.params.maxDate).getTime()) {
                        return p.resetMonth();
                    }
                }
                p.monthsTranslate--;
                if (nextMonth === p.currentMonth) {
                    var nextMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
                    var nextMonthHTML = $(p.monthHTML(nextDateTime, 'next')).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
                    p.wrapper.append(nextMonthHTML[0]);
                    p.months = p.wrapper.find('.picker-calendar-month');
                    if (p.params.onMonthAdd) {
                        p.params.onMonthAdd(p, p.months.eq(p.months.length - 1)[0]);
                    }
                }
                p.animating = true;
                p.onMonthChangeStart('next');
                var translate = (p.monthsTranslate * 100) * inverter;

                p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
                if (transitionEndCallback) {
                    p.wrapper.transitionEnd(function() {
                        p.onMonthChangeEnd('next');
                    });
                }
                if (!p.params.animate) {
                    p.onMonthChangeEnd('next');
                }
            };
            p.prevMonth = function(transition) {
                if (typeof transition === 'undefined' || typeof transition === 'object') {
                    transition = '';
                    if (!p.params.animate) transition = 0;
                }
                var prevMonth = parseInt(p.months.eq(0).attr('data-month'), 10);
                var prevYear = parseInt(p.months.eq(0).attr('data-year'), 10);
                var prevDate = new Date(prevYear, prevMonth + 1, -1);
                var prevDateTime = prevDate.getTime();
                var transitionEndCallback = p.animating ? false : true;
                if (p.params.minDate) {
                    if (prevDateTime < new Date(p.params.minDate).getTime()) {
                        return p.resetMonth();
                    }
                }
                p.monthsTranslate++;
                if (prevMonth === p.currentMonth) {
                    var prevMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
                    var prevMonthHTML = $(p.monthHTML(prevDateTime, 'prev')).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
                    p.wrapper.prepend(prevMonthHTML[0]);
                    p.months = p.wrapper.find('.picker-calendar-month');
                    if (p.params.onMonthAdd) {
                        p.params.onMonthAdd(p, p.months.eq(0)[0]);
                    }
                }
                p.animating = true;
                p.onMonthChangeStart('prev');
                var translate = (p.monthsTranslate * 100) * inverter;
                p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
                if (transitionEndCallback) {
                    p.wrapper.transitionEnd(function() {
                        p.onMonthChangeEnd('prev');
                    });
                }
                if (!p.params.animate) {
                    p.onMonthChangeEnd('prev');
                }
            };
            p.resetMonth = function(transition) {
                if (typeof transition === 'undefined') transition = '';
                var translate = (p.monthsTranslate * 100) * inverter;
                p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
            };
            p.setYearMonth = function(year, month, transition) {
                if (typeof year === 'undefined') year = p.currentYear;
                if (typeof month === 'undefined') month = p.currentMonth;
                if (typeof transition === 'undefined' || typeof transition === 'object') {
                    transition = '';
                    if (!p.params.animate) transition = 0;
                }
                var targetDate;
                if (year < p.currentYear) {
                    targetDate = new Date(year, month + 1, -1).getTime();
                } else {
                    targetDate = new Date(year, month).getTime();
                }
                if (p.params.maxDate && targetDate > new Date(p.params.maxDate).getTime()) {
                    return false;
                }
                if (p.params.minDate && targetDate < new Date(p.params.minDate).getTime()) {
                    return false;
                }
                var currentDate = new Date(p.currentYear, p.currentMonth).getTime();
                var dir = targetDate > currentDate ? 'next' : 'prev';
                var newMonthHTML = p.monthHTML(new Date(year, month));
                p.monthsTranslate = p.monthsTranslate || 0;
                var prevTranslate = p.monthsTranslate;
                var monthTranslate, wrapperTranslate;
                var transitionEndCallback = p.animating ? false : true;
                if (targetDate > currentDate) {
                    // To next
                    p.monthsTranslate--;
                    if (!p.animating) p.months.eq(p.months.length - 1).remove();
                    p.wrapper.append(newMonthHTML);
                    p.months = p.wrapper.find('.picker-calendar-month');
                    monthTranslate = -(prevTranslate - 1) * 100 * inverter;
                    p.months.eq(p.months.length - 1).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
                } else {
                    // To prev
                    p.monthsTranslate++;
                    if (!p.animating) p.months.eq(0).remove();
                    p.wrapper.prepend(newMonthHTML);
                    p.months = p.wrapper.find('.picker-calendar-month');
                    monthTranslate = -(prevTranslate + 1) * 100 * inverter;
                    p.months.eq(0).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
                }
                if (p.params.onMonthAdd) {
                    p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
                }
                p.animating = true;
                p.onMonthChangeStart(dir);
                wrapperTranslate = (p.monthsTranslate * 100) * inverter;
                p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? wrapperTranslate : 0) + '%, ' + (p.isH ? 0 : wrapperTranslate) + '%, 0)');
                if (transitionEndCallback) {
                    p.wrapper.transitionEnd(function() {
                        p.onMonthChangeEnd(dir, true);
                    });
                }
                if (!p.params.animate) {
                    p.onMonthChangeEnd(dir);
                }
            };
            p.nextYear = function() {
                p.setYearMonth(p.currentYear + 1);
            };
            p.prevYear = function() {
                p.setYearMonth(p.currentYear - 1);
            };


            // HTML Layout
            p.layout = function() {
                var pickerHTML = '';
                var pickerClass = '';
                var i;

                var layoutDate = p.value && p.value.length ? p.value[0] : new Date().setHours(0, 0, 0, 0);
                var prevMonthHTML = p.monthHTML(layoutDate, 'prev');
                var currentMonthHTML = p.monthHTML(layoutDate);
                var nextMonthHTML = p.monthHTML(layoutDate, 'next');
                var monthsHTML = '<div class="picker-calendar-months"><div class="picker-calendar-months-wrapper">' + (prevMonthHTML + currentMonthHTML + nextMonthHTML) + '</div></div>';
                // Week days header
                var weekHeaderHTML = '';
                if (p.params.weekHeader) {
                    for (i = 0; i < 7; i++) {
                        var weekDayIndex = (i + p.params.firstDay > 6) ? (i - 7 + p.params.firstDay) : (i + p.params.firstDay);
                        var dayName = p.params.dayNamesShort[weekDayIndex];
                        weekHeaderHTML += '<div class="picker-calendar-week-day ' + ((p.params.weekendDays.indexOf(weekDayIndex) >= 0) ? 'picker-calendar-week-day-weekend' : '') + '"> ' + dayName + '</div>';

                    }
                    weekHeaderHTML = '<div class="picker-calendar-week-days">' + weekHeaderHTML + '</div>';
                }
                pickerClass = 'picker-modal picker-calendar ' + (p.params.cssClass || '');
                var toolbarHTML = p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '';
                if (p.params.toolbar) {
                    toolbarHTML = p.params.toolbarTemplate
                        .replace(/{{closeText}}/g, p.params.toolbarCloseText)
                        .replace(/{{monthPicker}}/g, (p.params.monthPicker ? p.params.monthPickerTemplate : ''))
                        .replace(/{{yearPicker}}/g, (p.params.yearPicker ? p.params.yearPickerTemplate : ''));
                }

                pickerHTML =
                    '<div class="' + (pickerClass) + '">' +
                    toolbarHTML +
                    '<div class="picker-modal-inner">' +
                    weekHeaderHTML +
                    monthsHTML +
                    '</div>' +
                    '</div>';


                p.pickerHTML = pickerHTML;
            };

            // Input Events
            function openOnInput(e) {
                e.preventDefault();
                if (p.opened) return;
                p.open();
                if (p.params.scrollToInput && !isPopover()) {
                    var pageContent = p.input.parents('.page-content');
                    if (pageContent.length === 0) return;

                    var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                        paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                        pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                        pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                        newPaddingBottom;

                    var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                    if (inputTop > pageHeight) {
                        var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                        if (scrollTop + pageHeight > pageScrollHeight) {
                            newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                            if (pageHeight === pageScrollHeight) {
                                newPaddingBottom = p.container.height();
                            }
                            pageContent.css({
                                'padding-bottom': (newPaddingBottom) + 'px'
                            });
                        }
                        pageContent.scrollTop(scrollTop, 300);
                    }
                }
            }

            function closeOnHTMLClick(e) {
                if (inPopover()) return;
                if (p.input && p.input.length > 0) {
                    if (e.target !== p.input[0] && $(e.target).parents('.picker-modal').length === 0) p.close();
                } else {
                    if ($(e.target).parents('.picker-modal').length === 0) p.close();
                }
            }

            if (p.params.input) {
                p.input = $(p.params.input);
                if (p.input.length > 0) {
                    if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                    if (!p.inline) {
                        p.input.on('click', openOnInput);
                    }
                    if (p.params.inputReadOnly) {
                        p.input.on('focus mousedown', function(e) {
                            e.preventDefault();
                        });
                    }
                }

            }

            if (!p.inline) $('html').on('click', closeOnHTMLClick);

            // Open
            function onPickerClose() {
                p.opened = false;
                if (p.input && p.input.length > 0) p.input.parents('.page-content').css({
                    'padding-bottom': ''
                });
                if (p.params.onClose) p.params.onClose(p);

                // Destroy events
                p.destroyCalendarEvents();
            }

            p.opened = false;
            p.open = function() {
                var toPopover = isPopover();
                var updateValue = false;
                if (!p.opened) {
                    // Set date value
                    if (!p.value) {
                        if (p.params.value) {
                            p.value = p.params.value;
                            updateValue = true;
                        }
                    }

                    // Layout
                    p.layout();

                    // Append
                    if (toPopover) {
                        p.pickerHTML = '<div class="popover popover-picker-calendar"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                        p.popover = app.popover(p.pickerHTML, p.params.input, true);
                        p.container = $(p.popover).find('.picker-modal');
                        $(p.popover).on('close', function() {
                            onPickerClose();
                        });
                    } else if (p.inline) {
                        p.container = $(p.pickerHTML);
                        p.container.addClass('picker-modal-inline');
                        $(p.params.container).append(p.container);
                    } else {
                        p.container = $(app.pickerModal(p.pickerHTML));
                        $(p.container)
                            .on('close', function() {
                                onPickerClose();
                            });
                    }

                    // Store calendar instance
                    p.container[0].f7Calendar = p;
                    p.wrapper = p.container.find('.picker-calendar-months-wrapper');

                    // Months
                    p.months = p.wrapper.find('.picker-calendar-month');

                    // Update current month and year
                    p.updateCurrentMonthYear();

                    // Set initial translate
                    p.monthsTranslate = 0;
                    p.setMonthsTranslate();

                    // Init events
                    p.initCalendarEvents();

                    // Update input value
                    if (updateValue) p.updateValue();

                }

                // Set flag
                p.opened = true;
                p.initialized = true;
                if (p.params.onMonthAdd) {
                    p.months.each(function() {
                        p.params.onMonthAdd(p, this);
                    });
                }
                if (p.params.onOpen) p.params.onOpen(p);
            };

            // Close
            p.close = function() {
                if (!p.opened || p.inline) return;
                if (inPopover()) {
                    app.closeModal(p.popover);
                    return;
                } else {
                    app.closeModal(p.container);
                    return;
                }
            };

            // Destroy
            p.destroy = function() {
                p.close();
                if (p.params.input && p.input.length > 0) {
                    p.input.off('click focus', openOnInput);
                }
                $('html').off('click', closeOnHTMLClick);
            };

            if (p.inline) {
                p.open();
            }

            return p;
        };
        app.calendar = function(params) {
            return new Calendar(params);
        };

        /*======================================================
        ************   alert_tip   ************
        ======================================================*/
        app.alertTip = function(msg, media) {
            if (!msg) return;
            media = media || "fa fa-frown-o";
            var hold = hold || 3000;
            var html = '<div class="alert-tip">' +
                '<div class="con"><i class="' + media + '"></i><span class="text">' + msg + '</span></div>' +
                '</div>';
            var alertTip = $(html);
            $("body").append(alertTip)
            setTimeout(function() {
                alertTip.remove();
            }, hold);
        };

        /*======================================================
        ************   Notifications   ************
        ======================================================*/
        var _tempNotificationElement;
        app.addNotification = function(params) {
            if (!params) return;

            if (typeof params.media === 'undefined') params.media = app.params.notificationMedia;
            if (typeof params.title === 'undefined') params.title = app.params.notificationTitle;
            if (typeof params.subtitle === 'undefined') params.subtitle = app.params.notificationSubtitle;
            if (typeof params.closeIcon === 'undefined') params.closeIcon = app.params.notificationCloseIcon;
            if (typeof params.hold === 'undefined') params.hold = app.params.notificationHold;
            if (typeof params.closeOnClick === 'undefined') params.closeOnClick = app.params.notificationCloseOnClick;

            if (!_tempNotificationElement) _tempNotificationElement = document.createElement('div');

            var container = $('.notifications');
            if (container.length === 0) {
                $('body').append('<div class="notifications list-block media-list"><ul></ul></div>');
                container = $('.notifications');
            }
            var list = container.children('ul');

            var itemHTML;
            if (params.custom) {
                itemHTML = '<li>' + params.custom + '</li>';
            } else {
                itemHTML = '<li class="notification-item notification-hidden"><div class="item-content">' +
                    (params.media ?
                        '<div class="item-media">' +
                        params.media +
                        '</div>' : '') +
                    '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                    (params.title ? '<div class="item-title">' + params.title + '</div>' : '') +
                    (params.closeIcon ? '<div class="item-after"><a href="#" class="close-notification"><span></span></a></div>' : '') +
                    '</div>' +
                    (params.subtitle ? '<div class="item-subtitle">' + params.subtitle + '</div>' : '') +
                    (params.message ? '<div class="item-text">' + params.message + '</div>' : '') +
                    '</div>' +
                    '</div></li>';
            }
            _tempNotificationElement.innerHTML = itemHTML;

            var item = $(_tempNotificationElement).children();

            item.on('click', function(e) {
                var close = false;
                if ($(e.target).is('.close-notification') || $(e.target).parents('.close-notification').length > 0) {
                    close = true;
                } else {
                    if (params.onClick) params.onClick(e, item[0]);
                    if (params.closeOnClick) close = true;
                }
                if (close) app.closeNotification(item[0]);
            });
            if (params.onClose) {
                item.data('f7NotificationOnClose', function() {
                    params.onClose(item[0]);
                });
            }
            if (params.additionalClass) {
                item.addClass(params.additionalClass);
            }
            if (params.hold) {
                setTimeout(function() {
                    if (item.length > 0) app.closeNotification(item[0]);
                }, params.hold);
            }

            list.prepend(item[0]);
            container.show();

            var itemHeight = item.outerHeight();
            item.css('marginTop', -itemHeight + 'px');
            item.transition(0);

            var clientLeft = item[0].clientLeft;
            item.transition('');
            item.css('marginTop', '0px');

            container.transform('translate3d(0, 0,0)');
            item.removeClass('notification-hidden');

            return item[0];
        };
        app.closeNotification = function(item) {
            item = $(item);
            if (item.length === 0) return;
            if (item.hasClass('notification-item-removing')) return;
            var container = $('.notifications');

            var itemHeight = item.outerHeight();
            item.css('height', itemHeight + 'px').transition(0);
            var clientLeft = item[0].clientLeft;

            item.css('height', '0px').transition('').addClass('notification-item-removing');
            if (item.data('f7NotificationOnClose')) item.data('f7NotificationOnClose')();

            if (container.find('.notification-item:not(.notification-item-removing)').length === 0) {
                container.transform('');
            }

            item.addClass('notification-hidden').transitionEnd(function() {
                item.remove();
                if (container.find('.notification-item').length === 0) {
                    container.hide();
                }
            });
        };

        app.setInputDateTime = function(target) {
            if (!target) return false;
            target = $(target);
            var timeStr = target.val();
            var timeList = timeStr.match(/[0-9]+/g) || [];
            var timeSplitList = timeList.join("").replace(/^(0)+/g, "").split("");

            if (/[2-9]/.test(timeSplitList[4])) {
                timeSplitList.splice(4, 0, "0");
            }
            if (/[4-9]/.test(timeSplitList[6])) {
                timeSplitList.splice(6, 0, "0");
            }
            if (/[2-9]/.test(timeSplitList[8])) {
                timeSplitList.splice(8, 0, "0");
            }
            if (/[7-9]/.test(timeSplitList[10])) {
                timeSplitList.splice(10, 0, "0");
            }

            var str = (timeSplitList[0] || "") + (timeSplitList[1] || "") + (timeSplitList[2] || "") + (timeSplitList[3] || "")
            if (timeSplitList[4])
                str = str + "-" + timeSplitList[4];
            str = str + (timeSplitList[5] || "");
            if (timeSplitList[7]) {
                str = str + "-" + timeSplitList[6] + (timeSplitList[7] || "");
            } else if (timeSplitList[6]) {
                str = str + "-" + (timeSplitList[6] || "");
            }
            if (timeSplitList[9]) {
                str = str + " " + timeSplitList[8] + (timeSplitList[9] || "");
            } else if (timeSplitList[8]) {
                str = str + " " + (timeSplitList[8] || "");
            }
            if (timeSplitList[11]) {
                str = str + ":" + timeSplitList[10] + (timeSplitList[11] || "");
            } else if (timeSplitList[10]) {
                str = str + ":" + (timeSplitList[10] || "");
            }
            target.val(str);
        };


        /*======================================================
        ************   App Init   ************
        ======================================================*/
        app.init = function() {
            // Init Device
            if (app.getDeviceInfo) app.getDeviceInfo();

            // Init Click events
            if (app.initFastClicks && app.params.fastClicks) app.initFastClicks();
            if (app.initClickEvents) app.initClickEvents();

            app.initPageWithCallback('body');

            // App Init callback
            if (app.params.onAppInit) app.params.onAppInit();

        };
        if (app.params.init) app.init();


        //Return instance
        return app;
    };


    /*===========================
    Dom7 Library
    ===========================*/
    var Dom7 = (function() {
        var Dom7 = function(arr) {
            var _this = this,
                i = 0;
            // Create array-like object
            for (i = 0; i < arr.length; i++) {
                _this[i] = arr[i];
            }
            _this.length = arr.length;
            // Return collection with methods
            return this;
        };
        var $ = function(selector, context) {
            var arr = [],
                i = 0;
            if (selector && !context) {
                if (selector instanceof Dom7) {
                    return selector;
                }
            }
            if (selector) {
                // String
                if (typeof selector === 'string') {
                    var els, tempParent, html = selector.trim();
                    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                        var toCreate = 'div';
                        if (html.indexOf('<li') === 0) toCreate = 'ul';
                        if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                        if (html.indexOf('<tbody') === 0) toCreate = 'table';
                        if (html.indexOf('<option') === 0) toCreate = 'select';
                        tempParent = document.createElement(toCreate);
                        tempParent.innerHTML = selector;
                        for (i = 0; i < tempParent.childNodes.length; i++) {
                            arr.push(tempParent.childNodes[i]);
                        }
                    } else {
                        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                            // Pure ID selector
                            els = [document.getElementById(selector.split('#')[1])];
                        } else {
                            // Other selectors
                            els = (context || document).querySelectorAll(selector);
                        }
                        for (i = 0; i < els.length; i++) {
                            if (els[i]) arr.push(els[i]);
                        }
                    }
                }
                // Node/element
                else if (selector.nodeType || selector === window || selector === document) {
                    arr.push(selector);
                }
                //Array of elements or instance of Dom
                else if (selector.length > 0 && selector[0].nodeType) {
                    for (i = 0; i < selector.length; i++) {
                        arr.push(selector[i]);
                    }
                }
            }
            return new Dom7(arr);
        };

        Dom7.prototype = {
            // Classes and attriutes
            addClass: function(className) {
                if (typeof className === 'undefined') {
                    return this;
                }
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
                    }
                }
                return this;
            },
            removeClass: function(className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
                    }
                }
                return this;
            },
            hasClass: function(className) {
                if (!this[0]) return false;
                else return this[0].classList.contains(className);
            },
            toggleClass: function(className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
                    }
                }
                return this;
            },
            attr: function(attrs, value) {
                if (arguments.length === 1 && typeof attrs === 'string') {
                    // Get attr
                    if (this[0]) return this[0].getAttribute(attrs);
                    else return undefined;
                } else {
                    // Set attrs
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            // String
                            this[i].setAttribute(attrs, value);
                        } else {
                            // Object
                            for (var attrName in attrs) {
                                this[i][attrName] = attrs[attrName];
                                this[i].setAttribute(attrName, attrs[attrName]);
                            }
                        }
                    }
                    return this;
                }
            },
            removeAttr: function(attr) {
                for (var i = 0; i < this.length; i++) {
                    this[i].removeAttribute(attr);
                }
                return this;
            },
            prop: function(props, value) {
                if (arguments.length === 1 && typeof props === 'string') {
                    // Get prop
                    if (this[0]) return this[0][props];
                    else return undefined;
                } else {
                    // Set props
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            // String
                            this[i][props] = value;
                        } else {
                            // Object
                            for (var propName in props) {
                                this[i][propName] = props[propName];
                            }
                        }
                    }
                    return this;
                }
            },
            data: function(key, value) {
                if (typeof value === 'undefined') {
                    // Get value
                    if (this[0]) {
                        var dataKey = this[0].getAttribute('data-' + key);
                        if (dataKey) return dataKey;
                        else if (this[0].dom7ElementDataStorage && (key in this[0].dom7ElementDataStorage)) return this[0].dom7ElementDataStorage[key];
                        else return undefined;
                    } else return undefined;
                } else {
                    // Set value
                    for (var i = 0; i < this.length; i++) {
                        var el = this[i];
                        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
                        el.dom7ElementDataStorage[key] = value;
                    }
                    return this;
                }
            },
            removeData: function(key) {
                for (var i = 0; i < this.length; i++) {
                    var el = this[i];
                    if (el.dom7ElementDataStorage && el.dom7ElementDataStorage[key]) {
                        el.dom7ElementDataStorage[key] = null;
                        delete el.dom7ElementDataStorage[key];
                    }
                }
            },
            dataset: function() {
                var el = this[0];
                if (el) {
                    var dataset = {};
                    if (el.dataset) {
                        for (var dataKey in el.dataset) {
                            dataset[dataKey] = el.dataset[dataKey];
                        }
                    } else {
                        for (var i = 0; i < el.attributes.length; i++) {
                            var attr = el.attributes[i];
                            if (attr.name.indexOf('data-') >= 0) {
                                dataset[$.toCamelCase(attr.name.split('data-')[1])] = attr.value;
                            }
                        }
                    }
                    for (var key in dataset) {
                        if (dataset[key] === 'false') dataset[key] = false;
                        else if (dataset[key] === 'true') dataset[key] = true;
                        else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] = dataset[key] * 1;
                    }
                    return dataset;
                } else return undefined;
            },
            val: function(value) {
                if (typeof value === 'undefined') {
                    if (this[0]) return this[0].value;
                    else return undefined;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].value = value;
                    }
                    return this;
                }
            },
            // Transforms
            transform: function(transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            },
            transition: function(duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            },
            //Events
            on: function(eventName, targetSelector, listener, capture) {
                function handleLiveEvent(e) {
                    var target = e.target;
                    if ($(target).is(targetSelector)) listener.call(target, e);
                    else {
                        var parents = $(target).parents();
                        for (var k = 0; k < parents.length; k++) {
                            if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
                        }
                    }
                }
                var events = eventName.split(' ');
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        // Usual events
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        for (j = 0; j < events.length; j++) {
                            this[i].addEventListener(events[j], listener, capture);
                        }
                    } else {
                        //Live events
                        for (j = 0; j < events.length; j++) {
                            if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
                            this[i].dom7LiveListeners.push({
                                listener: listener,
                                liveListener: handleLiveEvent
                            });
                            this[i].addEventListener(events[j], handleLiveEvent, capture);
                        }
                    }
                }

                return this;
            },
            off: function(eventName, targetSelector, listener, capture) {
                var events = eventName.split(' ');
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof targetSelector === 'function' || targetSelector === false) {
                            // Usual events
                            if (typeof targetSelector === 'function') {
                                listener = arguments[1];
                                capture = arguments[2] || false;
                            }
                            this[j].removeEventListener(events[i], listener, capture);
                        } else {
                            // Live event
                            if (this[j].dom7LiveListeners) {
                                for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                    if (this[j].dom7LiveListeners[k].listener === listener) {
                                        this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                    }
                                }
                            }
                        }
                    }
                }
                return this;
            },
            once: function(eventName, targetSelector, listener, capture) {
                var dom = this;
                if (typeof targetSelector === 'function') {
                    targetSelector = false;
                    listener = arguments[1];
                    capture = arguments[2];
                }

                function proxy(e) {
                    listener(e);
                    dom.off(eventName, targetSelector, proxy, capture);
                }
                dom.on(eventName, targetSelector, proxy, capture);
            },
            trigger: function(eventName, eventData) {
                for (var i = 0; i < this.length; i++) {
                    var evt;
                    try {
                        evt = new CustomEvent(eventName, {
                            detail: eventData,
                            bubbles: true,
                            cancelable: true
                        });
                    } catch (e) {
                        evt = document.createEvent('Event');
                        evt.initEvent(eventName, true, true);
                        evt.detail = eventData;
                    }
                    this[i].dispatchEvent(evt);
                }
                return this;
            },
            transitionEnd: function(callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;

                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            animationEnd: function(callback) {
                var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
                    i, j, dom = this;

                function fireCallBack(e) {
                    callback(e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            // Sizing/Styles
            width: function() {
                if (this[0] === window) {
                    return window.innerWidth;
                } else {
                    if (this.length > 0) {
                        return parseFloat(this.css('width'));
                    } else {
                        return null;
                    }
                }
            },
            outerWidth: function(includeMargins) {
                if (this.length > 0) {
                    if (includeMargins) {
                        var styles = this.styles();
                        return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
                    } else
                        return this[0].offsetWidth;
                } else return null;
            },
            height: function() {
                if (this[0] === window) {
                    return window.innerHeight;
                } else {
                    if (this.length > 0) {
                        return parseFloat(this.css('height'));
                    } else {
                        return null;
                    }
                }
            },
            outerHeight: function(includeMargins) {
                if (this.length > 0) {
                    if (includeMargins) {
                        var styles = this.styles();
                        return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
                    } else
                        return this[0].offsetHeight;
                } else return null;
            },
            offset: function() {
                if (this.length > 0) {
                    var el = this[0];
                    var box = el.getBoundingClientRect();
                    var body = document.body;
                    var clientTop = el.clientTop || body.clientTop || 0;
                    var clientLeft = el.clientLeft || body.clientLeft || 0;
                    var scrollTop = window.pageYOffset || el.scrollTop;
                    var scrollLeft = window.pageXOffset || el.scrollLeft;
                    return {
                        top: box.top + scrollTop - clientTop,
                        left: box.left + scrollLeft - clientLeft
                    };
                } else {
                    return null;
                }
            },
            hide: function() {
                for (var i = 0; i < this.length; i++) {
                    this[i].style.display = 'none';
                }
                return this;
            },
            show: function() {
                for (var i = 0; i < this.length; i++) {
                    this[i].style.display = 'block';
                }
                return this;
            },
            styles: function() {
                var i, styles;
                if (this[0]) return window.getComputedStyle(this[0], null);
                else return undefined;
            },
            css: function(props, value) {
                var i;
                if (arguments.length === 1) {
                    if (typeof props === 'string') {
                        if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
                    } else {
                        for (i = 0; i < this.length; i++) {
                            for (var prop in props) {
                                this[i].style[prop] = props[prop];
                            }
                        }
                        return this;
                    }
                }
                if (arguments.length === 2 && typeof props === 'string') {
                    for (i = 0; i < this.length; i++) {
                        this[i].style[props] = value;
                    }
                    return this;
                }
                return this;
            },

            //Dom manipulation
            each: function(callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i]);
                }
                return this;
            },
            filter: function(callback) {
                var matchedItems = [];
                var dom = this;
                for (var i = 0; i < dom.length; i++) {
                    if (callback.call(dom[i], i, dom[i])) matchedItems.push(dom[i]);
                }
                return new Dom7(matchedItems);
            },
            html: function(html) {
                if (typeof html === 'undefined') {
                    return this[0] ? this[0].innerHTML : undefined;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].innerHTML = html;
                    }
                    return this;
                }
            },
            text: function(text) {
                if (typeof text === 'undefined') {
                    if (this[0]) {
                        return this[0].textContent.trim();
                    } else return null;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].textContent = text;
                    }
                }
            },
            is: function(selector) {
                if (!this[0] || typeof selector === 'undefined') return false;
                var compareWith, i;
                if (typeof selector === 'string') {
                    var el = this[0];
                    if (el === document) return selector === document;
                    if (el === window) return selector === window;

                    if (el.matches) return el.matches(selector);
                    else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
                    else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
                    else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
                    else {
                        compareWith = $(selector);
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                } else if (selector === document) return this[0] === document;
                else if (selector === window) return this[0] === window;
                else {
                    if (selector.nodeType || selector instanceof Dom7) {
                        compareWith = selector.nodeType ? [selector] : selector;
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                    return false;
                }

            },
            indexOf: function(el) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === el) return i;
                }
            },
            index: function() {
                if (this[0]) {
                    var child = this[0];
                    var i = 0;
                    while ((child = child.previousSibling) !== null) {
                        if (child.nodeType === 1) i++;
                    }
                    return i;
                } else return undefined;
            },
            eq: function(index) {
                if (typeof index === 'undefined') return this;
                var length = this.length;
                var returnIndex;
                if (index > length - 1) {
                    return new Dom7([]);
                }
                if (index < 0) {
                    returnIndex = length + index;
                    if (returnIndex < 0) return new Dom7([]);
                    else return new Dom7([this[returnIndex]]);
                }
                return new Dom7([this[index]]);
            },
            append: function(newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        while (tempDiv.firstChild) {
                            this[i].appendChild(tempDiv.firstChild);
                        }
                    } else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].appendChild(newChild[j]);
                        }
                    } else {
                        this[i].appendChild(newChild);
                    }
                }
                return this;
            },
            prepend: function(newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                        }
                        // this[i].insertAdjacentHTML('afterbegin', newChild);
                    } else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                        }
                    } else {
                        this[i].insertBefore(newChild, this[i].childNodes[0]);
                    }
                }
                return this;
            },
            insertBefore: function(selector) {
                var before = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (before.length === 1) {
                        before[0].parentNode.insertBefore(this[i], before[0]);
                    } else if (before.length > 1) {
                        for (var j = 0; j < before.length; j++) {
                            before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                        }
                    }
                }
            },
            insertAfter: function(selector) {
                var after = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (after.length === 1) {
                        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                    } else if (after.length > 1) {
                        for (var j = 0; j < after.length; j++) {
                            after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                        }
                    }
                }
            },
            next: function(selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    } else {
                        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                } else return new Dom7([]);
            },
            nextAll: function(selector) {
                var nextEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.nextElementSibling) {
                    var next = el.nextElementSibling;
                    if (selector) {
                        if ($(next).is(selector)) nextEls.push(next);
                    } else nextEls.push(next);
                    el = next;
                }
                return new Dom7(nextEls);
            },
            prev: function(selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    } else {
                        if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                } else return new Dom7([]);
            },
            prevAll: function(selector) {
                var prevEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.previousElementSibling) {
                    var prev = el.previousElementSibling;
                    if (selector) {
                        if ($(prev).is(selector)) prevEls.push(prev);
                    } else prevEls.push(prev);
                    el = prev;
                }
                return new Dom7(prevEls);
            },
            parent: function(selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    if (selector) {
                        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
                    } else {
                        parents.push(this[i].parentNode);
                    }
                }
                return $($.unique(parents));
            },
            parents: function(selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    var parent = this[i].parentNode;
                    while (parent) {
                        if (selector) {
                            if ($(parent).is(selector)) parents.push(parent);
                        } else {
                            parents.push(parent);
                        }
                        parent = parent.parentNode;
                    }
                }
                return $($.unique(parents));
            },
            find: function(selector) {
                var foundElements = [];
                for (var i = 0; i < this.length; i++) {
                    var found = this[i].querySelectorAll(selector);
                    for (var j = 0; j < found.length; j++) {
                        foundElements.push(found[j]);
                    }
                }
                return new Dom7(foundElements);
            },
            children: function(selector) {
                var children = [];
                for (var i = 0; i < this.length; i++) {
                    var childNodes = this[i].childNodes;

                    for (var j = 0; j < childNodes.length; j++) {
                        if (!selector) {
                            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
                        } else {
                            if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
                        }
                    }
                }
                return new Dom7($.unique(children));
            },
            remove: function() {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
                }
                return this;
            },
            detach: function() {
                return this.remove();
            },
            add: function() {
                var dom = this;
                var i, j;
                for (i = 0; i < arguments.length; i++) {
                    var toAdd = $(arguments[i]);
                    for (j = 0; j < toAdd.length; j++) {
                        dom[dom.length] = toAdd[j];
                        dom.length++;
                    }
                }
                return dom;
            }
        };

        // Shortcuts
        (function() {
            var shortcuts = ('click blur focus focusin focusout keyup keydown keypress submit change mousedown mousemove mouseup mouseenter mouseleave mouseout mouseover touchstart touchend touchmove resize scroll').split(' ');
            var notTrigger = ('resize scroll').split(' ');

            function createMethod(name) {
                Dom7.prototype[name] = function(handler) {
                    var i;
                    if (typeof handler === 'undefined') {
                        for (i = 0; i < this.length; i++) {
                            if (notTrigger.indexOf(name) < 0) {
                                if (name in this[i]) this[i][name]();
                                else {
                                    $(this[i]).trigger(name);
                                }
                            }
                        }
                        return this;
                    } else {
                        return this.on(name, handler);
                    }
                };
            }
            for (var i = 0; i < shortcuts.length; i++) {
                createMethod(shortcuts[i]);
            }
        })();


        // Global Ajax Setup
        var globalAjaxOptions = {};
        $.ajaxSetup = function(options) {
            if (options.type) options.method = options.type;
            $.each(options, function(optionName, optionValue) {
                globalAjaxOptions[optionName] = optionValue;
            });
        };

        // Ajax
        var _jsonpRequests = 0;
        $.ajax = function(options) {
            var defaults = {
                method: 'GET',
                data: false,
                async: true,
                cache: true,
                user: '',
                password: '',
                headers: {},
                xhrFields: {},
                statusCode: {},
                processData: true,
                dataType: 'text',
                contentType: 'application/x-www-form-urlencoded',
                timeout: 0
            };
            var callbacks = ['beforeSend', 'error', 'complete', 'success', 'statusCode'];


            //For jQuery guys
            if (options.type) options.method = options.type;

            // Merge global and defaults
            $.each(globalAjaxOptions, function(globalOptionName, globalOptionValue) {
                if (callbacks.indexOf(globalOptionName) < 0) defaults[globalOptionName] = globalOptionValue;
            });

            // Function to run XHR callbacks and events
            function fireAjaxCallback(eventName, eventData, callbackName) {
                var a = arguments;
                if (eventName) $(document).trigger(eventName, eventData);
                if (callbackName) {
                    // Global callback
                    if (callbackName in globalAjaxOptions) globalAjaxOptions[callbackName](a[3], a[4], a[5], a[6]);
                    // Options callback
                    if (options[callbackName]) options[callbackName](a[3], a[4], a[5], a[6]);
                }
            }

            // Merge options and defaults
            $.each(defaults, function(prop, defaultValue) {
                if (!(prop in options)) options[prop] = defaultValue;
            });

            // Default URL
            if (!options.url) {
                options.url = window.location.toString();
            }
            // Parameters Prefix
            var paramsPrefix = options.url.indexOf('?') >= 0 ? '&' : '?';

            // UC method
            var _method = options.method.toUpperCase();
            // Data to modify GET URL
            if ((_method === 'GET' || _method === 'HEAD') && options.data) {
                var stringData;
                if (typeof options.data === 'string') {
                    // Should be key=value string
                    if (options.data.indexOf('?') >= 0) stringData = options.data.split('?')[1];
                    else stringData = options.data;
                } else {
                    // Should be key=value object
                    stringData = $.serializeObject(options.data);
                }
                options.url += paramsPrefix + stringData;
            }
            // JSONP
            if (options.dataType === 'json' && options.url.indexOf('callback=') >= 0) {

                var callbackName = 'f7jsonp_' + Date.now() + (_jsonpRequests++);
                var abortTimeout;
                var callbackSplit = options.url.split('callback=');
                var requestUrl = callbackSplit[0] + 'callback=' + callbackName;
                if (callbackSplit[1].indexOf('&') >= 0) {
                    var addVars = callbackSplit[1].split('&').filter(function(el) {
                        return el.indexOf('=') > 0;
                    }).join('&');
                    if (addVars.length > 0) requestUrl += '&' + addVars;
                }

                // Create script
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.onerror = function() {
                    clearTimeout(abortTimeout);
                    fireAjaxCallback(undefined, undefined, 'error', null, 'scripterror');
                };
                script.src = requestUrl;

                // Handler
                window[callbackName] = function(data) {
                    clearTimeout(abortTimeout);
                    fireAjaxCallback(undefined, undefined, 'success', data);
                    script.parentNode.removeChild(script);
                    script = null;
                    delete window[callbackName];
                };
                document.querySelector('head').appendChild(script);

                if (options.timeout > 0) {
                    abortTimeout = setTimeout(function() {
                        script.parentNode.removeChild(script);
                        script = null;
                        fireAjaxCallback(undefined, undefined, 'error', null, 'timeout');
                    }, options.timeout);
                }

                return;
            }

            // Cache for GET/HEAD requests
            if (_method === 'GET' || _method === 'HEAD') {
                if (options.cache === false) {
                    options.url += (paramsPrefix + '_nocache=' + Date.now());
                }
            }

            // Create XHR
            var xhr = new XMLHttpRequest();

            // Save Request URL
            xhr.requestUrl = options.url;
            xhr.requestParameters = options;

            // Open XHR
            xhr.open(_method, options.url, options.async, options.user, options.password);

            // Create POST Data
            var postData = null;

            if ((_method === 'POST' || _method === 'PUT') && options.data) {
                if (options.processData) {
                    var postDataInstances = [ArrayBuffer, Blob, Document, FormData];
                    // Post Data
                    if (postDataInstances.indexOf(options.data.constructor) >= 0) {
                        postData = options.data;
                    } else {
                        // POST Headers
                        var boundary = '---------------------------' + Date.now().toString(16);

                        if (options.contentType === 'multipart\/form-data') {
                            xhr.setRequestHeader('Content-Type', 'multipart\/form-data; boundary=' + boundary);
                        } else {
                            xhr.setRequestHeader('Content-Type', options.contentType);
                        }
                        postData = '';
                        var _data = $.serializeObject(options.data);
                        if (options.contentType === 'multipart\/form-data') {
                            boundary = '---------------------------' + Date.now().toString(16);
                            _data = _data.split('&');
                            var _newData = [];
                            for (var i = 0; i < _data.length; i++) {
                                _newData.push('Content-Disposition: form-data; name="' + _data[i].split('=')[0] + '"\r\n\r\n' + _data[i].split('=')[1] + '\r\n');
                            }
                            postData = '--' + boundary + '\r\n' + _newData.join('--' + boundary + '\r\n') + '--' + boundary + '--\r\n';
                        } else {
                            postData = options.contentType === 'application/x-www-form-urlencoded' ? _data : _data.replace(/&/g, '\r\n');
                        }
                    }
                } else {
                    postData = options.data;
                }

            }

            // Additional headers
            if (options.headers) {
                $.each(options.headers, function(headerName, headerCallback) {
                    xhr.setRequestHeader(headerName, headerCallback);
                });
            }

            // Check for crossDomain
            if (typeof options.crossDomain === 'undefined') {
                options.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(options.url) && RegExp.$2 !== window.location.host;
            }

            if (!options.crossDomain) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            }

            if (options.xhrFields) {
                $.each(options.xhrFields, function(fieldName, fieldValue) {
                    xhr[fieldName] = fieldValue;
                });
            }

            var xhrTimeout;
            // Handle XHR
            xhr.onload = function(e) {
                if (xhrTimeout) clearTimeout(xhrTimeout);
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                    var responseData;
                    if (options.dataType === 'json') {
                        try {
                            responseData = JSON.parse(xhr.responseText);
                            fireAjaxCallback('ajaxSuccess', {
                                xhr: xhr
                            }, 'success', responseData, xhr.status, xhr);
                        } catch (err) {
                            fireAjaxCallback('ajaxError', {
                                xhr: xhr,
                                parseerror: true
                            }, 'error', xhr, 'parseerror');
                        }
                    } else {
                        fireAjaxCallback('ajaxSuccess', {
                            xhr: xhr
                        }, 'success', xhr.responseText, xhr.status, xhr);
                    }
                } else {
                    fireAjaxCallback('ajaxError', {
                        xhr: xhr
                    }, 'error', xhr, xhr.status);
                }
                if (options.statusCode) {
                    if (globalAjaxOptions.statusCode && globalAjaxOptions.statusCode[xhr.status]) globalAjaxOptions.statusCode[xhr.status](xhr);
                    if (options.statusCode[xhr.status]) options.statusCode[xhr.status](xhr);
                }
                fireAjaxCallback('ajaxComplete', {
                    xhr: xhr
                }, 'complete', xhr, xhr.status);
            };

            xhr.onerror = function(e) {
                if (xhrTimeout) clearTimeout(xhrTimeout);
                fireAjaxCallback('ajaxError', {
                    xhr: xhr
                }, 'error', xhr, xhr.status);
            };

            // Ajax start callback
            fireAjaxCallback('ajaxStart', {
                xhr: xhr
            }, 'start', xhr);
            fireAjaxCallback(undefined, undefined, 'beforeSend', xhr);


            // Send XHR
            xhr.send(postData);

            // Timeout
            if (options.timeout > 0) {
                xhrTimeout = setTimeout(function() {
                    xhr.abort();
                    fireAjaxCallback('ajaxError', {
                        xhr: xhr,
                        timeout: true
                    }, 'error', xhr, 'timeout');
                    fireAjaxCallback('ajaxComplete', {
                        xhr: xhr,
                        timeout: true
                    }, 'complete', xhr, 'timeout');
                }, options.timeout);
            }

            // Return XHR object
            return xhr;
        };
        // Shrotcuts
        (function() {
            var methods = ('get post getJSON').split(' ');

            function createMethod(method) {
                $[method] = function(url, data, success) {
                    return $.ajax({
                        url: url,
                        method: method === 'post' ? 'POST' : 'GET',
                        data: typeof data === 'function' ? undefined : data,
                        success: typeof data === 'function' ? data : success,
                        dataType: method === 'getJSON' ? 'json' : undefined
                    });
                };
            }
            for (var i = 0; i < methods.length; i++) {
                createMethod(methods[i]);
            }
        })();


        // DOM Library Utilites
        $.parseUrlQuery = function(url) {
            var query = {},
                i, params, param;
            if (url.indexOf('?') >= 0) url = url.split('?')[1];
            else return query;
            params = url.split('&');
            for (i = 0; i < params.length; i++) {
                param = params[i].split('=');
                query[param[0]] = param[1];
            }
            return query;
        };
        $.isArray = function(arr) {
            if (Object.prototype.toString.apply(arr) === '[object Array]') return true;
            else return false;
        };
        $.each = function(obj, callback) {
            if (typeof obj !== 'object') return;
            if (!callback) return;
            var i, prop;
            if ($.isArray(obj) || obj instanceof Dom7) {
                // Array
                for (i = 0; i < obj.length; i++) {
                    callback(i, obj[i]);
                }
            } else {
                // Object
                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        callback(prop, obj[prop]);
                    }
                }
            }
        };
        $.unique = function(arr) {
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
            }
            return unique;
        };
        $.serializeObject = function(obj) {
            if (typeof obj === 'string') return obj;
            var resultArray = [];
            var separator = '&';
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if ($.isArray(obj[prop])) {
                        var toPush = [];
                        for (var i = 0; i < obj[prop].length; i++) {
                            toPush.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop][i]));
                        }
                        if (toPush.length > 0) resultArray.push(toPush.join(separator));
                    } else {
                        // Should be string
                        resultArray.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
                    }
                }

            }

            return resultArray.join(separator);
        };
        $.toCamelCase = function(string) {
            return string.toLowerCase().replace(/-(.)/g, function(match, group1) {
                return group1.toUpperCase();
            });
        };
        $.dataset = function(el) {
            return $(el).dataset();
        };
        $.getTranslate = function(el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;

            // automatic axis detection
            if (typeof axis === 'undefined') {
                axis = 'x';
            }

            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            } else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }

            return curTransform || 0;
        };

        $.requestAnimationFrame = function(callback) {
            if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
            else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
            else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
            else {
                return window.setTimeout(callback, 1000 / 60);
            }
        };
        $.cancelAnimationFrame = function(id) {
            if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
            else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
            else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
            else {
                return window.clearTimeout(id);
            }
        };
        $.supportTouch = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

        // Link to prototype
        $.fn = Dom7.prototype;

        // Plugins
        $.fn.scrollTo = function(left, top, duration, easing, callback) {
            if (arguments.length === 4 && typeof easing === 'function') {
                callback = easing;
                easing = undefined;
            }
            return this.each(function() {
                var el = this;
                var currentTop, currentLeft, maxTop, maxLeft, newTop, newLeft, scrollTop, scrollLeft;
                var animateTop = top > 0 || top === 0;
                var animateLeft = left > 0 || left === 0;
                if (typeof easing === 'undefined') {
                    easing = 'swing';
                }
                if (animateTop) {
                    currentTop = el.scrollTop;
                    if (!duration) {
                        el.scrollTop = top;
                    }
                }
                if (animateLeft) {
                    currentLeft = el.scrollLeft;
                    if (!duration) {
                        el.scrollLeft = left;
                    }
                }
                if (!duration) return;
                if (animateTop) {
                    maxTop = el.scrollHeight - el.offsetHeight;
                    newTop = Math.max(Math.min(top, maxTop), 0);
                }
                if (animateLeft) {
                    maxLeft = el.scrollWidth - el.offsetWidth;
                    newLeft = Math.max(Math.min(left, maxLeft), 0);
                }
                var startTime = null;
                if (animateTop && newTop === currentTop) animateTop = false;
                if (animateLeft && newLeft === currentLeft) animateLeft = false;

                function render(time) {
                    if (time === undefined) {
                        time = new Date().getTime();
                    }
                    if (startTime === null) {
                        startTime = time;
                    }
                    var doneLeft, doneTop, done;
                    var progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
                    var easeProgress = easing === 'linear' ? progress : (0.5 - Math.cos(progress * Math.PI) / 2);
                    if (animateTop) scrollTop = currentTop + (easeProgress * (newTop - currentTop));
                    if (animateLeft) scrollLeft = currentLeft + (easeProgress * (newLeft - currentLeft));
                    if (animateTop && newTop > currentTop && scrollTop >= newTop) {
                        el.scrollTop = newTop;
                        done = true;
                    }
                    if (animateTop && newTop < currentTop && scrollTop <= newTop) {
                        el.scrollTop = newTop;
                        done = true;
                    }

                    if (animateLeft && newLeft > currentLeft && scrollLeft >= newLeft) {
                        el.scrollLeft = newLeft;
                        done = true;
                    }
                    if (animateLeft && newLeft < currentLeft && scrollLeft <= newLeft) {
                        el.scrollLeft = newLeft;
                        done = true;
                    }

                    if (done) {
                        if (callback) callback();
                        return;
                    }
                    if (animateTop) el.scrollTop = scrollTop;
                    if (animateLeft) el.scrollLeft = scrollLeft;
                    $.requestAnimationFrame(render);
                }
                $.requestAnimationFrame(render);
            });
        };
        $.fn.scrollTop = function(top, duration, easing, callback) {
            if (arguments.length === 3 && typeof easing === 'function') {
                callback = easing;
                easing = undefined;
            }
            var dom = this;
            if (typeof top === 'undefined') {
                if (dom.length > 0) return dom[0].scrollTop;
                else return null;
            }
            return dom.scrollTo(undefined, top, duration, easing, callback);
        };
        $.fn.scrollLeft = function(left, duration, easing, callback) {
            if (arguments.length === 3 && typeof easing === 'function') {
                callback = easing;
                easing = undefined;
            }
            var dom = this;
            if (typeof left === 'undefined') {
                if (dom.length > 0) return dom[0].scrollLeft;
                else return null;
            }
            return dom.scrollTo(left, undefined, duration, easing, callback);
        };

        return $;
    })();

    // Export Dom7 to ymframework
    ymframework.$ = Dom7;

    // Export to local scope
    var $ = Dom7;

    // Export to Window
    window.Dom7 = Dom7;


    /*===========================
    Features Support Detection
    ===========================*/
    ymframework.prototype.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
        };

        // Export object
        return support;
    })();


    /*===========================
    Device/OS Detection
    ===========================*/
    ymframework.prototype.device = (function() {
        var device = {};
        var ua = navigator.userAgent;
        var $ = Dom7;

        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

        device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

        // Android
        if (android) {
            device.os = 'android';
            device.osVersion = android[2];
            device.android = true;
            device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
        }
        if (ipad || iphone || ipod) {
            device.os = 'ios';
            device.ios = true;
        }
        // iOS
        if (iphone && !ipod) {
            device.osVersion = iphone[2].replace(/_/g, '.');
            device.iphone = true;
        }
        if (ipad) {
            device.osVersion = ipad[2].replace(/_/g, '.');
            device.ipad = true;
        }
        if (ipod) {
            device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
            device.iphone = true;
        }
        // iOS 8+ changed UA
        if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
            if (device.osVersion.split('.')[0] === '10') {
                device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
            }
        }

        // Webview
        device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

        // Minimal UI
        if (device.os && device.os === 'ios') {
            var osVersionArr = device.osVersion.split('.');
            device.minimalUi = !device.webView &&
                (ipod || iphone) &&
                (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
                $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
        }

        // Check for status bar and fullscreen app mode
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        device.statusBar = false;
        if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
            device.statusBar = true;
        } else {
            device.statusBar = false;
        }

        // Classes
        var classNames = [];

        // Pixel Ratio
        device.pixelRatio = window.devicePixelRatio || 1;
        classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
        if (device.pixelRatio >= 2) {
            classNames.push('retina');
        }

        // OS classes
        if (device.os) {
            classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
            if (device.os === 'ios') {
                var major = parseInt(device.osVersion.split('.')[0], 10);
                for (var i = major - 1; i >= 6; i--) {
                    classNames.push('ios-gt-' + i);
                }
            }

        }
        // Status bar classes
        if (device.statusBar) {
            classNames.push('with-statusbar-overlay');
        } else {
            $('html').removeClass('with-statusbar-overlay');
        }

        // Add html classes
        if (classNames.length > 0) $('html').addClass(classNames.join(' '));

        // Export object
        return device;
    })();

    /*===========================
     Template7 Template engine
     ===========================*/
    window.Template7 = (function() {
        function isArray(arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        }

        function isObject(obj) {
            return obj instanceof Object;
        }

        function isFunction(func) {
            return typeof func === 'function';
        }
        var cache = {};

        function helperToSlices(string) {
            var helperParts = string.replace(/[{}#}]/g, '').split(' ');
            var slices = [];
            var shiftIndex, i, j;
            for (i = 0; i < helperParts.length; i++) {
                var part = helperParts[i];
                if (i === 0) slices.push(part);
                else {
                    if (part.indexOf('"') === 0) {
                        // Plain String
                        if (part.match(/"/g).length === 2) {
                            // One word string
                            slices.push(part);
                        } else {
                            // Find closed Index
                            shiftIndex = 0;
                            for (j = i + 1; j < helperParts.length; j++) {
                                part += ' ' + helperParts[j];
                                if (helperParts[j].indexOf('"') >= 0) {
                                    shiftIndex = j;
                                    slices.push(part);
                                    break;
                                }
                            }
                            if (shiftIndex) i = shiftIndex;
                        }
                    } else {
                        if (part.indexOf('=') > 0) {
                            // Hash
                            var hashParts = part.split('=');
                            var hashName = hashParts[0];
                            var hashContent = hashParts[1];
                            if (hashContent.match(/"/g).length !== 2) {
                                shiftIndex = 0;
                                for (j = i + 1; j < helperParts.length; j++) {
                                    hashContent += ' ' + helperParts[j];
                                    if (helperParts[j].indexOf('"') >= 0) {
                                        shiftIndex = j;
                                        break;
                                    }
                                }
                                if (shiftIndex) i = shiftIndex;
                            }
                            var hash = [hashName, hashContent.replace(/"/g, '')];
                            slices.push(hash);
                        } else {
                            // Plain variable
                            slices.push(part);
                        }
                    }
                }
            }
            return slices;
        }

        function stringToBlocks(string) {
            var blocks = [],
                i, j, k;
            if (!string) return [];
            var _blocks = string.split(/({{[^{^}]*}})/);
            for (i = 0; i < _blocks.length; i++) {
                var block = _blocks[i];
                if (block === '') continue;
                if (block.indexOf('{{') < 0) {
                    blocks.push({
                        type: 'plain',
                        content: block
                    });
                } else {
                    if (block.indexOf('{/') >= 0) {
                        continue;
                    }
                    if (block.indexOf('{#') < 0 && block.indexOf(' ') < 0 && block.indexOf('else') < 0) {
                        // Simple variable
                        blocks.push({
                            type: 'variable',
                            contextName: block.replace(/[{}]/g, '')
                        });
                        continue;
                    }
                    // Helpers
                    var helperSlices = helperToSlices(block);
                    var helperName = helperSlices[0];
                    var isPartial = helperName === '>';
                    var helperContext = [];
                    var helperHash = {};
                    for (j = 1; j < helperSlices.length; j++) {
                        var slice = helperSlices[j];
                        if (isArray(slice)) {
                            // Hash
                            helperHash[slice[0]] = slice[1] === 'false' ? false : slice[1];
                        } else {
                            helperContext.push(slice);
                        }
                    }

                    if (block.indexOf('{#') >= 0) {
                        // Condition/Helper
                        var helperStartIndex = i;
                        var helperContent = '';
                        var elseContent = '';
                        var toSkip = 0;
                        var shiftIndex;
                        var foundClosed = false,
                            foundElse = false,
                            foundClosedElse = false,
                            depth = 0;
                        for (j = i + 1; j < _blocks.length; j++) {
                            if (_blocks[j].indexOf('{{#') >= 0) {
                                depth++;
                            }
                            if (_blocks[j].indexOf('{{/') >= 0) {
                                depth--;
                            }
                            if (_blocks[j].indexOf('{{#' + helperName) >= 0) {
                                helperContent += _blocks[j];
                                if (foundElse) elseContent += _blocks[j];
                                toSkip++;
                            } else if (_blocks[j].indexOf('{{/' + helperName) >= 0) {
                                if (toSkip > 0) {
                                    toSkip--;
                                    helperContent += _blocks[j];
                                    if (foundElse) elseContent += _blocks[j];
                                } else {
                                    shiftIndex = j;
                                    foundClosed = true;
                                    break;
                                }
                            } else if (_blocks[j].indexOf('else') >= 0 && depth === 0) {
                                foundElse = true;
                            } else {
                                if (!foundElse) helperContent += _blocks[j];
                                if (foundElse) elseContent += _blocks[j];
                            }

                        }
                        if (foundClosed) {
                            if (shiftIndex) i = shiftIndex;
                            blocks.push({
                                type: 'helper',
                                helperName: helperName,
                                contextName: helperContext,
                                content: helperContent,
                                inverseContent: elseContent,
                                hash: helperHash
                            });
                        }
                    } else if (block.indexOf(' ') > 0) {
                        if (isPartial) {
                            helperName = '_partial';
                            if (helperContext[0]) helperContext[0] = '"' + helperContext[0].replace(/"|'/g, '') + '"';
                        }
                        blocks.push({
                            type: 'helper',
                            helperName: helperName,
                            contextName: helperContext,
                            hash: helperHash
                        });
                    }
                }
            }
            return blocks;
        }
        var Template7 = function(template) {
            var t = this;
            t.template = template;

            function getCompileFn(block, depth) {
                if (block.content) return compile(block.content, depth);
                else return function() {
                    return '';
                };
            }

            function getCompileInverse(block, depth) {
                if (block.inverseContent) return compile(block.inverseContent, depth);
                else return function() {
                    return '';
                };
            }

            function getCompileVar(name, ctx) {
                var variable, parts, levelsUp = 0,
                    initialCtx = ctx;
                if (name.indexOf('../') === 0) {
                    levelsUp = name.split('../').length - 1;
                    var newDepth = ctx.split('_')[1] - levelsUp;
                    ctx = 'ctx_' + (newDepth >= 1 ? newDepth : 1);
                    parts = name.split('../')[levelsUp].split('.');
                } else if (name.indexOf('@global') === 0) {
                    ctx = 'Template7.global';
                    parts = name.split('@global.')[1].split('.');
                } else if (name.indexOf('@root') === 0) {
                    ctx = 'ctx_1';
                    parts = name.split('@root.')[1].split('.');
                } else {
                    parts = name.split('.');
                }
                variable = ctx;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.indexOf('@') === 0) {
                        if (i > 0) {
                            variable += '[(data && data.' + part.replace('@', '') + ')]';
                        } else {
                            variable = '(data && data.' + name.replace('@', '') + ')';
                        }
                    } else {
                        if (isFinite(part)) {
                            variable += '[' + part + ']';
                        } else {
                            if (part.indexOf('this') === 0) {
                                variable = part.replace('this', ctx);
                            } else {
                                variable += '.' + part;
                            }
                        }
                    }
                }

                return variable;
            }

            function getCompiledArguments(contextArray, ctx) {
                var arr = [];
                for (var i = 0; i < contextArray.length; i++) {
                    if (contextArray[i].indexOf('"') === 0) arr.push(contextArray[i]);
                    else {
                        arr.push(getCompileVar(contextArray[i], ctx));
                    }
                }
                return arr.join(', ');
            }

            function compile(template, depth) {
                depth = depth || 1;
                template = template || t.template;
                if (typeof template !== 'string') {
                    throw new Error('Template7: Template must be a string');
                }
                var blocks = stringToBlocks(template);
                if (blocks.length === 0) {
                    return function() {
                        return '';
                    };
                }
                var ctx = 'ctx_' + depth;
                var resultString = '(function (' + ctx + ', data) {\n';
                if (depth === 1) {
                    resultString += 'function isArray(arr){return Object.prototype.toString.apply(arr) === \'[object Array]\';}\n';
                    resultString += 'function isFunction(func){return (typeof func === \'function\');}\n';
                    resultString += 'function c(val, ctx) {if (typeof val !== "undefined") {if (isFunction(val)) {return val.call(ctx);} else return val;} else return "";}\n';
                }
                resultString += 'var r = \'\';\n';
                var i, j, context;
                for (i = 0; i < blocks.length; i++) {
                    var block = blocks[i];
                    // Plain block
                    if (block.type === 'plain') {
                        resultString += 'r +=\'' + (block.content).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, '\\' + '\'') + '\';';
                        continue;
                    }
                    var variable, compiledArguments;
                    // Variable block
                    if (block.type === 'variable') {
                        variable = getCompileVar(block.contextName, ctx);
                        resultString += 'r += c(' + variable + ', ' + ctx + ');';
                    }
                    // Helpers block
                    if (block.type === 'helper') {
                        if (block.helperName in t.helpers) {
                            compiledArguments = getCompiledArguments(block.contextName, ctx);
                            resultString += 'r += (Template7.helpers.' + block.helperName + ').call(' + ctx + ', ' + (compiledArguments && (compiledArguments + ', ')) + '{hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth + 1) + ', inverse: ' + getCompileInverse(block, depth + 1) + ', root: ctx_1});';
                        } else {
                            if (block.contextName.length > 0) {
                                throw new Error('Template7: Missing helper: "' + block.helperName + '"');
                            } else {
                                variable = getCompileVar(block.helperName, ctx);
                                resultString += 'if (' + variable + ') {';
                                resultString += 'if (isArray(' + variable + ')) {';
                                resultString += 'r += (Template7.helpers.each).call(' + ctx + ', ' + variable + ', {hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth + 1) + ', inverse: ' + getCompileInverse(block, depth + 1) + ', root: ctx_1});';
                                resultString += '}else {';
                                resultString += 'r += (Template7.helpers.with).call(' + ctx + ', ' + variable + ', {hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth + 1) + ', inverse: ' + getCompileInverse(block, depth + 1) + ', root: ctx_1});';
                                resultString += '}}';
                            }
                        }
                    }
                }
                resultString += '\nreturn r;})';
                return eval.call(window, resultString);
            }
            t.compile = function(template) {
                if (!t.compiled) {
                    t.compiled = compile(template);
                }
                return t.compiled;
            };
        };
        Template7.prototype = {
            options: {},
            partials: {},
            helpers: {
                '_partial': function(partialName, options) {
                    var p = Template7.prototype.partials[partialName];
                    if (!p || (p && !p.template)) return '';
                    if (!p.compiled) {
                        p.compiled = t7.compile(p.template);
                    }
                    var ctx = this;
                    for (var hashName in options.hash) {
                        ctx[hashName] = options.hash[hashName];
                    }
                    return p.compiled(ctx);
                },
                'escape': function(context, options) {
                    if (typeof context !== 'string') {
                        throw new Error('Template7: Passed context to "escape" helper should be a string');
                    }
                    return context
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');
                },
                'if': function(context, options) {
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    if (context) {
                        return options.fn(this, options.data);
                    } else {
                        return options.inverse(this, options.data);
                    }
                },
                'unless': function(context, options) {
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    if (!context) {
                        return options.fn(this, options.data);
                    } else {
                        return options.inverse(this, options.data);
                    }
                },
                'each': function(context, options) {
                    var ret = '',
                        i = 0;
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    if (isArray(context)) {
                        if (options.hash.reverse) {
                            context = context.reverse();
                        }
                        for (i = 0; i < context.length; i++) {
                            ret += options.fn(context[i], {
                                first: i === 0,
                                last: i === context.length - 1,
                                index: i
                            });
                        }
                        if (options.hash.reverse) {
                            context = context.reverse();
                        }
                    } else {
                        for (var key in context) {
                            i++;
                            ret += options.fn(context[key], {
                                key: key
                            });
                        }
                    }
                    if (i > 0) return ret;
                    else return options.inverse(this);
                },
                'with': function(context, options) {
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    return options.fn(context);
                },
                'join': function(context, options) {
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    return context.join(options.hash.delimiter || options.hash.delimeter);
                },
                'js': function(expression, options) {
                    var func;
                    if (expression.indexOf('return') >= 0) {
                        func = '(function(){' + expression + '})';
                    } else {
                        func = '(function(){return (' + expression + ')})';
                    }
                    return eval.call(this, func).call(this);
                },
                'js_compare': function(expression, options) {
                    var func;
                    if (expression.indexOf('return') >= 0) {
                        func = '(function(){' + expression + '})';
                    } else {
                        func = '(function(){return (' + expression + ')})';
                    }
                    var condition = eval.call(this, func).call(this);
                    if (condition) {
                        return options.fn(this, options.data);
                    } else {
                        return options.inverse(this, options.data);
                    }
                }
            }
        };
        var t7 = function(template, data) {
            if (arguments.length === 2) {
                var instance = new Template7(template);
                var rendered = instance.compile()(data);
                instance = null;
                return (rendered);
            } else return new Template7(template);
        };
        t7.registerHelper = function(name, fn) {
            Template7.prototype.helpers[name] = fn;
        };
        t7.unregisterHelper = function(name) {
            Template7.prototype.helpers[name] = undefined;
            delete Template7.prototype.helpers[name];
        };
        t7.registerPartial = function(name, template) {
            Template7.prototype.partials[name] = {
                template: template
            };
        };
        t7.unregisterPartial = function(name, template) {
            if (Template7.prototype.partials[name]) {
                Template7.prototype.partials[name] = undefined;
                delete Template7.prototype.partials[name];
            }
        };

        t7.compile = function(template, options) {
            var instance = new Template7(template, options);
            return instance.compile();
        };

        t7.options = Template7.prototype.options;
        t7.helpers = Template7.prototype.helpers;
        t7.partials = Template7.prototype.partials;
        return t7;
    })();
})();
