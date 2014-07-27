// v1.0.3
// by Tomasz Glowka


/*
    DOCUMENTATION
    -------------
    jQuery(selector).modal('show' [,options]) - show modal, also set options for shown one

        options - an object with any of those keys
            overlay: cssProperties:object // css properties for overlay
            center: [ centerHorizontally:true|false, centerVertically:true|false ],
            position: [ deltaX:integer , deltaY:integer ],
            fixed: fixedPositionMode:true|false,
                margin: bottomGapToKeep, // used when fixed=true only
                scrolled: setPositionUsingScrollPosition:true|false, // used when fixed=false only
            showMethod: methodForShowingModal:function,
            showComplete: hookOnModalShowCompleted:function, // called right after modal showing completed
            hideInit: hookOnModalHideStart:function, // called right before modal hiding
            hideMethod: methodForHidingModal:function
            hideButton: [true, false] //  if contain modal hide button
            overlayHideButton: [true, false] //  if clicking the overlay invokes modal hiding

        default options
            overlay: {
                background: '#ffffff',
                opacity: '0.6'
            },
            center: [true, false],
            position: [0, 100],
            fixed: false,
                margin: 0, // used when fixed=true only
                scrolled: true, // used when fixed=false only
            showMethod: function(){ jQuery(this).show(); },
            hideComplete: function() {},
            hideInit: function() {},
            hideMethod: function(){ jQuery(this).hide();
            hideButton: true
            overlayHideButton: true
        }

    jQuery(selector).modal('hide') - hide modal
    jQuery(selector).modal('refresh') - refresh position and size set on show
    jQuery(selector).modal('resize') - refresh size set on show
    jQuery(selector).modal('reposition') - refresh position set on show
    jQuery(selector).modal('reset') - reset modal options to default

    jQuery.modal('hide') - hide active modal
    jQuery.modal('refresh') - refresh position and size of active modal
    jQuery.modal('resize') - refresh size of active modal
    jQuery.modal('reposition') - refresh position of active modal
    jQuery.modal(defaultOptions) - set new default options that will be used for all future modals
    jQuery.modal(defaultOptionName, defaultOptionValue) - set one default option
    jQuery.modal('reset') - reset default options to starting state


    EXAMPLES
    --------
    Showing modal
        jQuery(elem).modal('show');

    Showing modal with extra options
        jQuery(elem).modal('show', {fixed: true, center: [true, true]});

    Showing modal and adding new options after a while
        jQuery(elem).modal('show', {fixed: true, center: [true, true]});
        ...
        jQuery(elem).modal('show', {position: [0,0]});
        // all options: fixed, center and position are active,
        // because made 'show' on the same elem without closing

    Showing modal, then resetting and adding new options after a while
        jQuery(elem).modal('show', {fixed: true, center: [true, true]});
        ...
        jQuery(elem).modal('reset').modal('show', {position: [0,0]});
        // only position option is active

    Showing modal, appending new content, refreshing modal
        jQuery(elem).modal('show');
        ....
        jQuery(elem).append(...);
        jQuery(elem).modal('refresh');

    Showing and hiding modal
        jQuery(elem).modal('show');
        jQuery(elem).modal('hide');

    Showing and hiding modal(options are not kept)
        jQuery(elem).modal('show', {fixed: true}); // fixed
        jQuery(elem).modal('hide');

        jQuery(elem2).modal('show'); // not fixed
        jQuery(elem2).modal('hide');

    Showing one modal and replacing by another without hiding
        jQuery(elem).modal('show');
        jQuery(elem2).modal('show');

    Showing one modal and replacing by another without hiding (options are not kept)
        jQuery(elem).modal('show', {fixed: true}); // fixed
        jQuery(elem2).modal('show'); // not fixed

    Changing default options, showing modals
        // showing hiding and showing
        jQuery(elem).modal('show'); // fixed
        jQuery(elem).modal('hide');
        jQuery(elem2).show('show'); // fixed
        jQuery(elem3).show('show'); // fixed

        jQuery.modal('fixed', false); //another setting defaults
        // replacing modal
        jQuery(elem4).show('show'); // not fixed
        jQuery(elem5).show('show'); // not fixed
        jQuery(elem5).show('hide');
        jQuery(elem6).show('show'); // not fixed
*/


(function(){

// CONFIGURABLE styles
// use jQuery.modal({option1: val1, option2: val2})
// or  jQuery.modal(option1, val1).modal(option2, val2)
// to configure it, but don't touch it here

var defaults = {
        overlay: {
            background: '#ffffff',
            opacity: '0.6'
        },
        center: [true, false],
        position: [0, 100],
        fixed: false,
            margin: 0, // used when fixed=true only
            scrolled: true, // used when fixed=false only

        showMethod: function(){ jQuery(this).show(); },
        showComplete: function() {},
        hideInit: function() {},
        hideMethod: function(){ jQuery(this).hide(); },
        hideButton: true,
        overlayHideButton: true
    };


// PRIVATE styles
// don't touch it at any time
// proper modifications can be made using documented API
var  subContainerStyle = {
        top: '0', left: '0',
        width: '100%', height: 0 /* to be evaluated */,
        'z-index': '99998'
    },

    relProxyStyle = {
        position: 'relative',
        width: '100%', height: '100%'
    },

    overlayStyle = {
        position: 'absolute',
        top: '0', left: '0',
        width: '100%', height: '100%',
        'z-index': '99998'
    },

    containerStyle = {
        position: 'relative',
        top: '100px',
        overflow: 'hidden',
        display: 'inline-block', // make container to fit content
        'z-index': '99999'
    },

    hideButtonStyle = {
        position: 'absolute',
        'z-index': '99999'
    };



jQuery.fn.extend({
    modal: function(cmd, params) {
        params = typeof params !== 'undefined' ? params : {};
        var $this = this;
        if(!$this.length)
            return $this;
        var modalContentNode = $this[0];
        switch(cmd) {
            case 'show':
                if(modalContentNode != $contentNode[0])
                    modal.resetOptions();
                modal.loadOptions(params);
                modal.create();
                modal.setup(modalContentNode);
                modal.setDimensions();
                if(hidden)
                    modal.show();
                break;
            case 'hide':
                if(modalContentNode == $contentNode[0]) {
                    modal.hide();
                    modal.resetOptions();
                }
                break;
            case 'refresh':
                if(modalContentNode == $contentNode[0]) {
                    if(!hidden)
                        modal.setDimensions();
                }
                break;
            case 'resize':
                if(modalContentNode == $contentNode[0]) {
                    if(!hidden)
                        modal.setSize();
                }
                break;
            case 'reposition':
                if(modalContentNode == $contentNode[0]) {
                    if(!hidden)
                        modal.setPosition();
                }
                break;
            case 'reset':
                if(modalContentNode == $contentNode[0])
                    modal.resetOptions();
                break;
            default:
                break;
        }
        return $this;
    }
});



jQuery.extend({
    modal: function(cmd, params){
        var cmdSet = {};
        params = typeof params !== 'undefined' ? params : null;

        if(typeof cmd === 'string') {
            switch(cmd) {
                case 'hide':
                    if(!hidden)
                        $contentNode.modal('hide');
                    break;
                case 'refresh':
                    if(!hidden)
                        modal.setDimensions();
                    break;
                case 'resize':
                    if(!hidden)
                        modal.setSize();
                    break;
                case 'reposition':
                    if(!hidden)
                        modal.setPosition();
                    break;
                case 'reset':
                    defaults = jQuery(true, {}, defaultsBackup);
                    break;
                default:
                    cmdSet[cmd] = params;
            }
        } else if(typeof cmd === 'object') {
            cmdSet = cmd;
        }
        jQuery.extend(true, defaults, cmdSet);
        return this;
    }
});



var hidden = true,
    defaultsBackup = jQuery.extend(true, {}, defaults),
    options = null,
    $overlay = jQuery(),
    $relProxy = jQuery(),
    $subContainer = jQuery(),
    $container = jQuery(),
    $hideButton = jQuery(),
    $contentNode = jQuery(),
    $contentParent = jQuery();

var modal = {
    show: function(){

        options.showMethod.apply($subContainer.get(0));
        if(options.hideButton)
            $hideButton.show();
        else
            $hideButton.hide();

        // change position on window resize
        jQuery(window).off('.modal'); // take off all previous modals event handlers
        jQuery(window).on('resize.modal orientationchange.modal', function(){
            jQuery.modal('refresh');
        });

        // hide on overlay click
        $overlay.off('.modal'); // take off all previous modals event handlers
        if(options.overlayHideButton) {
            $overlay.on('click.modal', function() {
                jQuery.modal('hide');
            });
        }
        // hide on modal-hide-button
        $hideButton.off('.modal'); // take off all previous modals event handlers
        $hideButton.on('click.modal', function(event) {
            event.preventDefault();
            jQuery.modal('hide');
        });
        hidden = false;
    },

    create: function() {
        // create necessary elements unless already created
        if(!$container.length) {
            $subContainer = jQuery('<div class="modal-sub-container"></div>');
            $relProxy = jQuery('<div class="modal-rel-proxy"></div>');
            $overlay = jQuery('<div class="modal-overlay"></div>');
            $container = jQuery('<div class="modal-container"></div>');
            $hideButton = jQuery('<a href="#" class="modal-hide-button"></a>');
            $relProxy.append($container).append($overlay);
            $subContainer.append($relProxy).hide();
            jQuery(document.body).append($subContainer);
        }
    },

    setup: function(newContentNode) {
        // give me the content
        if(!newContentNode)
            return;

        // set proper style
        $subContainer.css(subContainerStyle).css('position', options.fixed ? 'fixed' : 'absolute');
        $relProxy.css(relProxyStyle);
        $overlay.css(overlayStyle).css(modal.protectOverlayStyle(options.overlay));
        $container.css(containerStyle);
        $hideButton.css(hideButtonStyle);

        // load content
        if($contentNode.get(0) != newContentNode) {
            // if modal is not empty ($contentNode selector has non-zero length),
            // return it content to previous parent
            if($contentNode.length) {
                // old node is back
                $contentParent.append($contentNode.get(0));
                $hideButton.detach();
                $contentNode.hide();
            }

            // move new content and show modal
            $contentNode = jQuery(newContentNode);
            $contentParent = $contentNode.parent();
            $contentNode.append($hideButton);
            $container.append($contentNode.get(0));
            $contentNode.show();
        }
    },

    setDimensions: function() {
        // to secretly get the size if modal hidden
        if(hidden)
            $subContainer.css('opacity', 0).show();

        modal.resetXY();

        modal.resizeX();
        modal.positionX();
        modal.positionY();
        modal.resizeY();

        // to secretly get the size if modal hidden
        if(hidden)
            $subContainer.hide().css('opacity', 1);
    },

    setSize: function() {
        // this function can in fact be only used only when modal visible
        modal.resizeX();
        modal.resizeY();
    },

    setPosition: function() {
        // this function can in fact be only used only when modal visible
        modal.positionX();
        modal.positionY();
    },

    resetXY:function() {
        $container.css('max-height', '');
    },

    resizeX: function() {
        // height: container height is auto (overflow hidden)
        $container.css('width', $contentNode.outerWidth(true)); //width as of container as small as can be
                                                            // (by default it takes all width)
    },

    resizeY: function() {
        $subContainer.css('height', modal.getMaxHeight());
        //width: subContainer width is always body 100%

        if(options.fixed) {
            var maxHeight = jQuery(window).height() - $container.position()['top'] - options.margin;
            $container.css('max-height', maxHeight > 0 ? maxHeight : 0);
        } else
            $container.css('max-height', '');
    },

    positionX: function() {
        var left;
        left = options.center[0] ? (jQuery(window).width() - $container.width()) / 2 : 0;
        left += options.position[0];
        left = left >= 0 ? left : 0;
        $container.css('left', left);
    },

    positionY: function() {
        var top;
        top = options.center[1] ? (jQuery(window).height() - $container.outerHeight()) / 2 : 0;
        top += options.scrolled && !options.fixed ? jQuery(document).scrollTop() : 0;
        top += options.position[1];
        $container.css('top', top);
    },

    hide: function() {
        options.hideInit.apply($subContainer.get(0));
        $contentParent.append($contentNode);
        $hideButton.detach();
        $contentNode.hide();
        options.hideMethod.apply($subContainer.get(0));
        $contentParent = jQuery();
        $contentNode = jQuery();

        jQuery(window).off('.modal'); // take off all modals event handlers
        $overlay.off('.modal'); // take off all modals event handlers

        hidden = true;
    },

    loadOptions: function(params) {
        if(!options)
            options = jQuery.extend(true, {} ,defaults);
        jQuery.extend(true, options, params);
    },

    resetOptions: function() {
        options = jQuery.extend(true, {} ,defaults);
    },

    getMaxHeight: function(){
        var doc = jQuery(document).height(),
            win = jQuery(window).height();
        return doc > win ? doc : win;
    },

    protectOverlayStyle: function(style) {
        var result = {};
        for( var feature in style) {
            if(style.hasOwnProperty(feature) && ! (feature in overlayStyle) )
                 result[feature] = style[feature];
        }
        return result;
    }
};

})();
