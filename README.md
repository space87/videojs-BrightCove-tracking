# videojs BrightCove tracking

BrightCove plugin for video.js

## Getting Started
Download [videojs](http://www.videojs.com/) and [videojs.brightcove tracking](https://github.com/space87/videojs-BrightCove-tracking)

On your page include the plugin file.
```html
<script src="dist/videojs.ga.min.js"></script>
```

_Please note that the videojs.js file needs to be loaded prior to this plugin

_Also this can only be used if you call videojs dynamically

you Call the plugin like this
```javascript

videojs('video', {plugins:{aoBcTracking:{accountID:'Your brightcove accound id',video:{name:'name of your video',id:'id of your brightcove video'}}}}, function() {
 
    //declare your source
    this.src('example.mp4');
    
});

```

_there is no need to call .play() as the plugin will call that to allow tracking of events.


## Options

You need provide to provide it with you BrightCove Id in the accountID value.

Also to allow BrightCove to see what video it is tracking you need to put in the video name and id too.



####events that are tracked
currently this plugin will track:

"player_load"
"video_impression"
"video_view"
"view_engagement" which reports every 10 seconds allowing the collection of engagement data


## TODO

- [ ] Allow custom user tracking to the videos
- [ ] Track the geoloaction data of the viewer and report it
