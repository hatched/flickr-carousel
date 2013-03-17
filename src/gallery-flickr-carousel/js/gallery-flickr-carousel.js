var sub = Y.Lang.sub;

/**
  The YUI Flickr Carousel is designed to allow you to easily include a flickr
  photo set in a photo carousel on your website. It extends Y.ScrollView but
  disables the flick and drag gestures by default in favour of
  click-to-advance and auto-advance navigation.

  @class FlickrCarousel
  @module gallery-flickr-carousel
  @extends ScrollView
  @constructor
*/
Y.FlickrCarousel = new Y.Base.create('gallery-flickr-carousel', Y.ScrollView, [], {

    /**
      Base Flickr api url for rest requests of photoset photos

      @property _flickrUrl
      @protected
      @type string
    */
    _flickrUrl: 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key={apiKey}&photoset_id={photosetId}&extras={size},description&format=json',

    /**
      Image carousel container template

      @property imageCarouselTemplate
      @public
      @type string
     */
    imageCarouselTemplate: '<ul/>',

    /**
      Image item template

      @property imageTemplate
      @public
      @type string
     */
    imageTemplate: '<li class="img-container" style="width: {width}"><img src="{src}" alt="{title}" width="{imgWidth}" height="{imgHeight}">{descriptionTemplate}</li>',

    /**
      Template used for the naviagte left overlay

      @property prevNavTemplate
      @public
      @type string
    */
    prevNavTemplate: '<div class="navigate prev"></div>',

    /**
      Template used for the naviagte right overlay

      @property nextNavTemplate
      @public
      @type string
    */
    nextNavTemplate: '<div class="navigate next"></div>',

    /**
      Template used for the photo descriptions

      @property descriptionTemplate
      @public
      @type string
    */
    descriptionTemplate: '<div class="description">{description}</div>',

    /**
      Sequencial photo size to key map

      @property _photoSizeToKeyUrl
      @private
      @type array
     */
    _photoSizeToKeyUrl: [
        { key: 'sq', x: 75, y: 75 },
        { key: 't', x: 100, y: 75 },
        { key: 'q', x: 150, y: 150 },
        { key: 's', x: 240, y: 180 },
        { key: 'n', x: 320, y: 240 },
        { key: 'm', x: 500, y: 375 },
        { key: 'z', x: 640, y: 480 },
        { key: 'c', x: 800, y: 600 },
        { key: 'l', x: 1024, y: 768 },
        { key: 'o', x: 2400, y: 1800 }
    ],

    /**
      Sets up the flickr data handler and plugs the pagination plugin

      @method initializer
      @param cfg {object} Module configuration object
      @private
    */
    initializer: function(cfg) {
        this.plug(Y.Plugin.ScrollViewPaginator, {
            selector: 'li'
        });

        this.determinePhotoSize();

        this.fetchCarouselImages(cfg.apiKey, cfg.photosetId);
    },

    /**
      Sets the proper url size key for the flickr
      api to match the size of the carousel

      @method determinePhotoSize
      @public
    */
    determinePhotoSize: function() {
        Y.log('determinePhotoSize', 'info', this.name);
        var width = parseInt(this.get('width'), 10),
            photoSizeToKeyUrl = this._photoSizeToKeyUrl,
            sizeKey, sizes;

        Y.Array.some(photoSizeToKeyUrl, function(size) {
            if (size.x >= width) {
                sizeKey = size.key;
                sizes = size;
                return true;
            }
        }, this);

        // If the carousel width is larger than the largest url tag
        if (!sizeKey) {
            sizeKey = photoSizeToKeyUrl[photoSizeToKeyUrl.length].key;
        }

        this.set('_photoSizeParam', sizeKey);
        this.set('photoSize', sizes);
    },

    /**
      Grabs the image data from Flickr

      @method fetchCarouselImages
      @param apiKey {string} flickr API Key
      @param photosetId {string} flickr photoset Id
      @public
     */
    fetchCarouselImages: function(apiKey, photosetId) {
        Y.log('fetchGalleryImages', 'info', this.name);

        var url = sub(this._flickrUrl, {
                apiKey: apiKey,
                photosetId: photosetId,
                size: this.get('_photoSizeParam')
            });
        url += "&jsoncallback={callback}";
        Y.jsonp(url, Y.bind(this._handleResponse, this));
    },

    /**
      Advances the carousel image depending on the button pressed

      @method _handleCarouselNavigate
      @protected
      @param e {object} navigate click event object
    */
    _handleCarouselNavigate: function(e) {
        Y.log('_handleCarouselNavigate', 'info', this.name);
        var pages = this.pages;

        (e.currentTarget.hasClass('next') === true) ? pages.next() : pages.prev();
        this._advanceDescription();
    },

    /**
      Advances the description depending on the supplied delta

      @method _advanceDescription
      @protected
      @param index {integer} advance to index value
    */
    _advanceDescription: function(index) {
        Y.log('_advanceDescription', 'info', this.name);

        if (index === undefined) { index = this.pages.get('index'); }
        this.get('_descriptionNode').setHTML(this.get('photos')[index].description._content);
    },

    /**
      Generates and appends the navigation controls for the carousel

      @method _generateCarouselControls
      @protected
    */
    _generateCarouselControls: function() {
        Y.log('_generateCarouselControls', 'info', this.name);
        var node = this.get('boundingBox'),
            prevNav = Y.Node.create(this.prevNavTemplate),
            nextNav = Y.Node.create(this.nextNavTemplate);

        height = this.get('photoSize').y + "px";

        prevNav.setStyle('height', height);
        nextNav.setStyle('height', height);

        node.append(prevNav);
        node.append(nextNav);
    },

    /**
      Advances the photo and description to the next appropriate value

      @method _advanceImage
      @protected
    */
    _advanceImage: function() {
        Y.log('_advanceImage', 'info', this.name);
        var pages = this.pages,
            index = pages.get('index');

        (index < pages.get('total')-1) ? pages.next() : pages.scrollToIndex(0);
        this._advanceDescription();
    },

    /**
      The jsonp callback from the flickr api

      @method _handleResponse
      @param response {object} flickr api response object
      @private
    */
    _handleResponse: function(response) {
        Y.log('handleResponse', 'info', this.name);

        var photos = response.photoset.photo,
            node = this.get('srcNode'),
            photoSizeParam = this.get('_photoSizeParam'),
            carousel = Y.Node.create(this.imageCarouselTemplate),
            sizeParam = photoSizeParam.split('_')[1],
            carouselWidth = this.get('width'),
            elements = "",
            photo, photoWidth, photoHeight, i;

        this.set('photos', photos);

        for (i = 0; i < photos.length; i++) {
            photo = photos[i];
            photoWidth = photo['width_' + sizeParam];
            photoHeight = photo['height_' + sizeParam];

            // If the image needs to be downsized to fit into the carousel
            if (photoWidth > carouselWidth) {
                photoWidth = carouselWidth;
                photoHeight = photoHeight * (carouselWidth / photoWidth);
            }

            elements += sub(this.imageTemplate, {
                width: this.get('width'),
                src: photo[photoSizeParam],
                title: photo.title,
                imgWidth: photoWidth,
                imgHeight: photoHeight,
                descriptionTemplate: sub(this.descriptionTemplate, {
                    description: photo.description._content
                })
            });
        }
        carousel.setHTML(elements);
        node.setHTML(carousel);

        this.render();

        this._generateCarouselControls();
    },

    /**
      Checks to see if autoadvance is set then sets up the timeouts

      @method _checkForAutoAdvance
      @private
    */
    _checkForAutoAdvance: function() {
        Y.log('_checkForAutoAdvance', 'info', this.name);

        if (this.get('autoAdvance') === true) {
            Y.later(this.get('startDelay'), this, function() {
                if (this.get('pauseOnHover') !== true) {
                    this._advanceImage();
                }
                Y.later(this.get('advanceDelay'), this, function() {
                    if (this.get('pauseOnHover') !== true) {
                        this._advanceImage();
                    }
                }, null, true);
            });
        }
    },

    /**
      Mouseenter/mouseleave event handler

      @method _pauseAutoAdvance
      @private
      @param e {object} mouseout or mouseover event object
    */
    _pauseAutoAdvance: function(e) {
        Y.log('pauseAutoAdvance', 'info', this.name);
        (e.type === "mouseenter") ? this.set('pauseOnHover', true) : this.set('pauseOnHover', false);
    },

    /**
      Binds the navigate event listeners

      @method bindUI
      @private
    */
    bindUI: function() {
        Y.log('bindUI', 'info', this.name);

        //Call the parent bindUI method
        Y.FlickrCarousel.superclass.bindUI.apply(this);

        var events = this.get('_events'),
            boundingBox = this.get('boundingBox');
        events.push(boundingBox.delegate('click', this._handleCarouselNavigate, '.navigate', this));
        events.push(this.after('render', this._checkForAutoAdvance, this));
        events.push(boundingBox.on('mouseenter', this._pauseAutoAdvance, this));
        events.push(boundingBox.on('mouseleave', this._pauseAutoAdvance, this));
    },

    /**
      Detaches events attached during instantiation

      @method destructor
      @private
    */
    destructor: function() {
        Y.log('destructor', 'info', this.name);
        Y.Array.each(this.get('_events'), function(event) {
            event.detach();
        });
    }

}, {
    ATTRS: {

        /**
          Flickr api key

          @attribute apiKey
          @public
          @type string
        */
        apiKey: {},

        /**
          Flickr photoset id

          @attribute photosetId
          @public
          @type string
        */
        photosetId: {},

        /**
          Weather the carousel should automatically advance

          @attribute autoAdvance
          @public
          @type boolean
          @default true
        */
        autoAdvance: {
            value: true
        },

        /**
          Amount of time to wait before the autoadvance starts

          @attribute startDelay
          @public
          @type integer
          @default 3000
        */
        startDelay: {
            value: 3000
        },

        /**
          Amount of time to wait between autoadvances

          @attribute advanceDelay
          @public
          @type integer
          @default 3000
        */
        advanceDelay: {
            value: 3000
        },

        /**
          If the carousel should pause then the user hovers on it

          @attribute pauseOnHover
          @public
          @type boolean
          @default false
        */
        pauseOnHover: {
            value: false
        },

        /**
          Disables the native flick gesture support

          Set to the following to restore default flick support
          {
            minDistance: 10,
            minVelocity: 0.3
          }

          @attribute flick
          @public
          @type boolean
          @default false
        */
        flick: {
            value: false
        },

        /**
          Photos data array

          @attribute photos
          @public
          @type array
          @default []
        */
        photos: {
            value: []
        },

        /**
          Show the photo description

          @attribute showDescription
          @public
          @type boolean
          @default true
        */
        showDescription: {
            value: true
        },

        /**
          Disables the native drag gesture support

          @attribute drag
          @public
          @type boolean
          @default false
        */
        drag: {
            value: false
        },

        /**
          An object containing the photo size details

          @attribute photoSize
          @public
          @type object
          @default {}
        */
        photoSize: {
            value: {}
        },

        /**
          The param of the photo size sent to the flickr api

          @attribute _photoSizeParam
          @protected
          @default 'url_m'
          @type string
        */
        _photoSizeParam: {
            value: 'url_m',
            setter: function(value) {
                return 'url_' + value;
            }
        },

        /**
          Cache of the description Node

          @attribute _descriptionNode
          @protected
          @default {}
          @type Y.Node
        */
        _descriptionNode: {
            value: {}
        },

        /**
          Collection of event handlers to detach on destroy

          @attribute _events
          @private
          @default []
          @type array
        */
        _events: {
            value: []
        }

    }
});
