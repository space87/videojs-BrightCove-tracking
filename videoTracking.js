videojs.plugin("brightCoveAnalytics", function (options) {
    var lastTime = -1,
        duration = -1,
        baseURL = "http://metrics.brightcove.com/tracker",
        destination = encodeURI(window.location.href),
        source = encodeURI(document.referrer),
        timeBuffer = [],
        self = this;

    var settings = {
        accountID: null,
        video: {
            id: null,
            name: null
        },
        secondsViewInterval: 5
    };

    var timeUpdate = function () {
        var currentTime = Math.floor(this.currentTime()); // round down to keep only viewed seconds

        // Buffering time viewed : buffer starts at 0 and ends at duration minus one second
        if (lastTime != currentTime && currentTime != duration) {
            timeBuffer.push(currentTime);

            // If currentTime - lastTime != 1 : an event that jumps time occurs (ex : seek), so let that event handle the buffer
            if ((currentTime - lastTime) == 1 && timeBuffer.length == settings.secondsViewInterval) {
                var range = timeBuffer[0] + '..' + timeBuffer[timeBuffer.length - 1];
                sendVideoEngagement(range);
                timeBuffer = [];
            }
        }

        lastTime = currentTime;
    };

    var sendVideoEngagement = function (range) {
        var params = {
            video: settings.video.id,
            video_name: encodeURI(settings.video.name),
            video_duration: duration,
            range: range
        };
        sendEvent('video_engagement', params);
    };

    var sendEvent = function (eventName, params) {
        params.domain = 'videocloud';
        params.account = settings.accountID;
        params.time = Date.now();
        params.event = eventName;
        params.destination = destination;
        if (source !== "") {
            params.source = source;
        }

        $.get(baseURL + '?' + $.param(params));
    };

    var init = function () {
        if (settings.accountID == null) {
            console.log("accountID cannot be null");
            return false;
        }
        if (settings.video.id == null) {
            console.log("video.id cannot be null");
            return false;
        }
        else if (settings.video.name == null) {
            console.log("video.name cannot be null");
            return false;
        }
        if (settings.secondsViewInterval < 5) {
            console.log("secondsViewInterval cannot be inferior to 5 (avoid too much events)");
            return false;
        }
        if (settings.secondsViewInterval > 20) {
            console.log("secondsViewInterval cannot be superior to 20 (will be discarded by analytics system)");
            return false;
        }
        return true;
    };

    $.extend(settings, options);
    if (!init()) return;

    self.on('loadeddata', function () {
        sendEvent('video_impression', {
            video: settings.video.id,
            video_name: encodeURI(settings.video.name)
        });
        duration = Math.floor(this.duration());
    });

    self.on('firstplay', function () {
        sendEvent('video_view', {
            video: settings.video.id,
            video_name: encodeURI(settings.video.name),
            video_duration: duration
        });
    });

    /** Called by videoJS every 15-250 milliseconds */
    self.on("timeupdate", timeUpdate);

    self.on('pause', function () {
        /**
         * Pause can be triggered if video is already paused and a seek event occurs.
         * Send buffer if at least one second is viewed and if time is continuous between the last seconds viewed (i.e no seek happened)
         */
        if (timeBuffer.length > 1 && (timeBuffer[timeBuffer.length - 1] - timeBuffer[timeBuffer.length - 2]) == 1) {
            var range = timeBuffer[0] + '..' + timeBuffer[timeBuffer.length - 1];
            sendVideoEngagement(range);
            timeBuffer = [];
        }
    });

    self.on('seeked', function () {
        var seekedTime = Math.floor(this.currentTime()); // here currentTime equals the seeked time

        // Send buffer if at least one second has been viewed
        if (timeBuffer.length > 1) {
            var lastSecondViewed; // last second viewed before the seekedTime
            for (var i = 0; i < timeBuffer.length; i++) {
                if (i == 0) {
                    if (timeBuffer[i] != seekedTime) {
                        lastSecondViewed = timeBuffer[i];
                    }
                }
                else {
                    if (timeBuffer[i] - timeBuffer[i - 1] == 1) { // time is continuous between the last seconds viewed
                        lastSecondViewed = timeBuffer[i];
                    }
                }
            }
            var range = timeBuffer[0] + '..' + lastSecondViewed;
            sendVideoEngagement(range);
            timeBuffer = [seekedTime];
        }
    });
});
