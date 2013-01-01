YUI Flickr Carousel
===================

The YUI Flickr Carousel is designed to allow you to easily include a flickr photo set in a photo carousel on your website. It extends Y.ScrollView but disables the flick and drag gestures by default in favour of click-to-advance and auto-advance navigation.

Notes
-----
*   To enable flick and drag support set them back to their original values on instantiation
*   It will automatically pick the best size photo to request from flickr to fit the carousel container
*   If the photo size doesn't exist on flickr it will 404 and that photo will not be shown
*   If the users mouse is hovering on the carousel it will not autoadvance

Dependencies
------------
*   scrollview
*   scrollview-paginator
*   base-build
*   get

Instantiation
-------------
```javascript
new Y.FlickrCarousel({
    srcNode: Y.one('.main-carousel'),
    apiKey: 'XXXXX',
    photosetId: 'XXXXX',
    autoAdvance: true,
    startDelay: 3000,
    advanceDelay: 3000,
    width: '500px'
});
```

To Do
-----
*   Emit image change event with image data
*   Vertical carousel support
*   Add thumbnail mini carousel support

Feature request, bug reports and pull requests welcome!