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
         * The jsonp callback from the flickr api
         *
         * @method _handleResponse
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

            this._generateCarouselControls();
            
            for (i = 0; i < photos.length; i++) {
                var photo = photos[i];
                elements += sub(this.imageTemplate, {
                    width: this.get('width'),
                    src: photo[photoSizeParam],
                    title: photo['title'],
                    imgWidth: photo.width_m, //these will need to be converted to attributes so that we can use a dynamic size
                    imgHeight: photo.height_m
                });
            }
            carousel.setHTML(elements);
            node.setHTML(carousel);

            this.render();
        },

        /*
         * Generates the navigation controls for the carousel
         *
         * @method _generateCarouselControls
         * @protected
         */
        _generateCarouselControls: function() {
            Y.log('_generateCarouselControls', 'info', this.name);
            var node = this.get('srcNode');
        },

        destructor: function() {}

    }, {
        ATTRS: {
            /*
             * Flickr api key
             *
             * @attribute apiKey
             * @public
             */
            apiKey: {},
            /*
             * Flickr photoset id
             *
             * @attribute photosetId
             * @public
             */
            photosetId: {},
            /*
             * The param of the photo size sent to the flickr api
             * @attribute _photoSizeParam
             * @protected
             * @default 'url_m'
             * @type String
             */
            _photoSizeParam: {
                value: 'url_m'
            }

        }
    });

}, '0.1', { requires: ['scrollview', 'scrollview-paginator', 'base-build', 'get']});