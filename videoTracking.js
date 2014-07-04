videojs.plugin("aoBcTracking", function (options) {
        var player,
            firstUpdate = true,
            initialPosition = 0,
            lastPosition = 0,
            baseURL = "http://metrics.brightcove.com/tracker?",
            destination = encodeURI(window.location.href),
            source = encodeURI(document.referrer),
            timeUpdate,
            postData,
            sendDataToBC,
            init;

        var settings = {
            accountID: null,
            video: {}
        };


        postData = function (requestURL) {

            $.get(requestURL);

            return true;
        };

        sendDataToBC = function (eventType, evt) {
            var urlStr = "",
            time = evt.timeStamp,
            dateTime = new Date(parseInt(evt.timeStamp)),

            currentVideo = settings.video;

            urlStr = "event=" + eventType + "&domain=videocloud&account=" +  encodeURI(settings.accountID) + "&time=" + time + "&destination=" + encodeURI(destination);

            if (source !== "") {
                urlStr += "&source=" + encodeURI(source);
            }



            if (eventType === "video_impression" || eventType === "video_view" || eventType === "video_engagement") {
                urlStr += "&video=" + encodeURI(currentVideo.id) + "&video_name=" + encodeURI(currentVideo.name);
            }

            if (eventType === "video_engagement") {
                urlStr += "&video_duration=" + player.duration() + "&range=" + evt.range;
            }

            urlStr = baseURL + urlStr;

            postData(urlStr);

            return;
        };
        timeUpdate = function (evt) {
            var thisPosition = evt.timeStamp, range = "", dateTime = new Date(evt.timeStamp);
            if (firstUpdate) {
                initialPosition = evt.timeStamp;
                lastPosition = evt.timeStamp;
                firstUpdate = false;
            }
            if (Math.round(thisPosition / 1000) - Math.round(lastPosition / 1000) === 10) {

                range = ((lastPosition - initialPosition) / 1000).toString() + ".." + ((thisPosition - initialPosition) / 1000).toString();

                lastPosition = thisPosition;
                evt.range = range;


                sendDataToBC("video_engagement", evt);
            }
        };


        init = function () {
            player.on("loadstart", function (evt) {
                sendDataToBC("player_load", evt);
                firstUpdate = true;
                sendDataToBC("video_impression", evt);
            });

            player.on('play',function(evt) {
                sendDataToBC("video_view", evt);
            });

            player.on("timeupdate", timeUpdate);

            player.on('loadeddata',function() {
              player.play();
            })

        };

        // starting actions
        $.extend(settings,options);
        player = this;
        init();
        return;
    });
