YUI.add('flickr-carousel', function(Y) {

    YUI.namespace('flickrCarousel');

    var sub = Y.Lang.sub;

    Y.FlickrCarousel = new Y.Base.create('flickr-carousel', Y.ScrollView, [], {

        /*
         * Base Flickr api url for rest requests of photoset photos
         *
         * @property flickrUrl
         * @protected
         */
        _flickrUrl: 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key={apiKey}&photoset_id={photosetId}&extras={size},description&format=json&jsoncallback=YUI.flickrCarousel.handleResponse',

        /*
         * Image carousel container template
         * 
         * @property imageCarouselTemplate
         * @public
         */
        imageCarouselTemplate: '<ul/>',

        /*
         * Image item template
         *
         * @property imageTemplate
         * @public
         */
        imageTemplate: '<li class="img-container" style="width: {width}"><img src="{src}" alt="{title}" width="{imgWidth}" height="{imgHeight}"></li>',

        /*
         * Template used for the naviagte left overlay
         *
         * @property prevNavTemplate
         * @public
         */
        prevNavTemplate: '<div class="navigate prev"></div>',

        /*
         * Template used for the naviagte right overlay
         *
         * @property nextNavTemplate
         * @public
         */
        nextNavTemplate: '<div class="navigate next"></div>',

        /*
         * Sets up the flickr data handler and plugs the pagination plugin
         *
         * @method initializer
         * @param cfg {object} Module configuration object
         * @private
         */
        initializer: function(cfg) {
            YUI.flickrCarousel.handleResponse = Y.bind(this._handleResponse, this);

            this.plug(Y.Plugin.ScrollViewPaginator, { 
                selector: 'li'
            });

            this.fetchCarouselImages(cfg.apiKey, cfg.photosetId);
        },

        /*
         * Grabs the image data from Flickr
         *
         * @method fetchCarouselImages
         * @param apiKey {string} flickr API Key
         * @param photosetId {string} flickr photoset Id
         * @public
         */
        fetchCarouselImages: function(apiKey, photosetId) {
            Y.log('fetchGalleryImages', 'info', this.name);

            var url = sub(this._flickrUrl, {
                    apiKey: apiKey,
                    photosetId: photosetId,
                    size: this.get('_photoSizeParam')
                });
            Y.Get.script(url, function(err) {
                if (err) {
                    Y.log('Error fetching images', 'error', this.name);
                    Y.log(err);
                }
            });
        },

        /*
         * Advances the carousel image depending on the button pressed
         *
         * @method _handleCarouselNavigate:
         * @protected
         * @param e {object} navigate click event object
         */
        _handleCarouselNavigate: function(e) {
            Y.log('_handleCarouselNavigate:', 'info', this.name);

            (e.currentTarget.hasClass('next')) ? this.next() : this.prev();
        },

        /*
         * Generates the navigation controls for the carousel
         *
         * @method _generateCarouselControls
         * @protected
         */
        _generateCarouselControls: function() {
            Y.log('_generateCarouselControls', 'info', this.name);
            var node = this.get('boundingBox');

            node.append(this.prevNavTemplate);
            node.append(this.nextNavTemplate);
        },

        /*
         * The jsonp callback from the flickr api
         *
         * @method _handleResponse
         * @param response {object} flickr api response object
         * @private
         */
        _handleResponse: function(response) {
            Y.log('handleResponse', 'info', this.name);

            var photos = response.photoset.photo,
                node = this.get('srcNode'),
                photoSizeParam = this.get('_photoSizeParam'),
                carousel = Y.Node.create(this.imageCarouselTemplate),
                elements = "",
                i;

            for (i = 0; i < photos.length; i++) {
                var photo = photos[i];
                elements += sub(this.imageTemplate, {
                    width: this.get('width'),
                    src: photo[photoSizeParam],
                    title: photo.title,
                    imgWidth: photo.width_m, //these will need to be converted to attributes so that we can use a dynamic size
                    imgHeight: photo.height_m
                });
            }
            carousel.setHTML(elements);
            node.setHTML(carousel);

            this.render();

            this._generateCarouselControls();
        },

        bindUI: function() {
            Y.log('bindUI', 'info', this.name);
            //Call the parent bindUI method
            Y.FlickrCarousel.superclass.bindUI.apply(this);
            var events = this.get('_events');
            events.push(this.get('boundingBox').delegate('click', this._handleCarouselNavigate, '.navigate', this.pages));
        },

        destructor: function() {
            Y.log('destructor', 'info', this.name);
            this.get('_events').each(function(event) {
                event.detach();
            });
        }

    }, {
        ATTRS: {

            /*
             * Flickr api key
             *
             * @attribute apiKey
             * @public
             * @type string
             */
            apiKey: {},

            /*
             * Flickr photoset id
             *
             * @attribute photosetId
             * @public
             * @type string
             */
            photosetId: {},

            /*
             * Weather the carousel should automatically advance
             *
             * @attribute autoAdvance
             * @public
             * @type boolean
             * @default true
             */
            autoAdvance: {
                value: true
            },

            /*
             * Amount of time to wait before the autoadvance starts
             *
             * @attribute startDelay
             * @public
             * @type integer
             * @default 3000
             */
            startDelay: {
                value: 3000
            },

            /*
             * Amount of time to wait between autoadvances
             *
             * @attribute advanceDelay
             * @public
             * @type integer
             * @default 3000
             */
            advanceDelay: {
                value: 3000
            },

            /*
             * Disables the native flick gesture support
             *
             * Set to the following to restore default flick support
             * {
             *   minDistance: 10,
             *   minVelocity: 0.3
             * }
             *
             * @attribute flick
             * @public
             * @type boolean
             * @default false
             */
            flick: {
                value: false
            },

            /*
             * Disables the native drag gesture support
             *
             * @attribute drag
             * @public
             * @type boolean
             * @default false
             */
            drag: {
                value: false
            },

            /*
             * The param of the photo size sent to the flickr api
             *
             * @attribute _photoSizeParam
             * @protected
             * @default 'url_m'
             * @type string
             */
            _photoSizeParam: {
                value: 'url_m'
            },

            /*
             * Collection of event handlers to detach on destroy
             *
             * @attribute _events
             * @private
             * @default []
             * @type array
             */
            _events: {
                value: []
            }

        }
    });

}, '0.1', { requires: ['scrollview', 'scrollview-paginator', 'base-build', 'get']});