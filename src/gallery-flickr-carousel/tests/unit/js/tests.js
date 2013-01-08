YUI.add('module-tests', function(Y) {

    var suite = new Y.Test.Suite('gallery-flickr-carousel'),
        carouselWidth = '500px';

    suite.add(new Y.Test.Case({
        name: 'Gallery Flicker Carousel',

        'Proper property types': function() {
            var fc = this.getFlickrCarousel(false);
            Y.Assert.areEqual('string', typeof fc._flickrUrl);
            Y.Assert.areEqual('string', typeof fc.imageCarouselTemplate);
            Y.Assert.areEqual('string', typeof fc.imageTemplate);
            Y.Assert.areEqual('string', typeof fc.prevNavTemplate);
            Y.Assert.areEqual('string', typeof fc.nextNavTemplate);
            Y.Assert.areEqual(true, Y.Lang.isArray(fc._photoSizeToKeyUrl));
        },

        'Photo size is correctly chosen to match carousel size': function() {
            var fc = this.getFlickrCarousel(false);
            fc.determinePhotoSize();
            Y.Assert.areEqual('url_m', fc.get('_photoSizeParam'));
        },

        getFlickrCarousel: function(createNew) {
            if (createNew === true && this.flickrCarousel) {
                this.flickrCarousel.destroy();
            }
            this.flickrCarousel = new Y.FlickrCarousel({
                srcNode: Y.one('.main-carousel'),
                apiKey: 'b4faad78e86bf3d229b81288545420b3',
                photosetId: '72157632121047510',
                autoAdvance: true,
                startDelay: 3000,
                advanceDelay: 3000,
                width: carouselWidth
            });
            return this.flickrCarousel;
        }
    }));

    Y.Test.Runner.add(suite);


},'', { requires: [ 'test' ] });
