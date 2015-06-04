(function (win, doc) {
    'use strict';
    var wrapClass = '.wrapper',  // the main area for everything
        wrapEl,     // element of the image wrap (not the wrap for everything)
        statsWorldEl, // element of the world stats container
        statsUnreachEl, // element of the unreached stats container
        settings,   // settings set by the user
        images,     // array of all images currently being displayed
        current,    // index of currently showing image
        previous,   // index of previously showing image
        running,    // true/false - whether cycling through images
        timer,      // timeout value to stop timeout when needed
        statsRunning = false,
        statsTimer,
        dt,         // current date and time (at the last time incremented)
        currentWorldPop,
        currentUnreachPop,
        checking = false; // checking if next valid image matches
                    //  the only time we actually know we're not checking
    function loadSettings(userSettings) {
        var setting;
        userSettings = userSettings || {};
        settings = settings || {
            'template'  : {
                'id'            : 'full-tv',    // id of the template (for
                                                //  retrieval)
                'imageWrapClass': 'image-wrap', // element that wraps all
                                                //  the images
                'imageHeight'       : 1,     // 0.71 for stats template;
                                                //  1 for full height
                'imageWidth'        : 1,        // 1 for full width; different
                                                //  for future templates
                'statsWorldClass'   : 'world-pop',
                'statsUnReachClass' : 'ureach-pop'
            },
            'imageTimeout': 8000,
            'statsTimeout': 3000,
			// these next two are the world and unreached base populations
            //  taken at certain times with a certain growth rate
			'baseWorld'	: {
                                // month is zero based
								'time'	: new Date(2012, 9, 2, 13, 43, 0),
								'pop'	: 7043122856,
								'rate'	: 2.45
							},
			'baseUnreached'	: {
								'time'	: new Date(1999, 4, 4, 0, 0, 0),
								'pop'	: 2989262347,
								'rate'	: 1.394
							}
        };

        // merge user settings with defaults (userSettings override, of course)
        for (setting in userSettings) {
            if (Object.prototype.hasOwnProperty.call(userSettings, setting)) {
                settings[setting] = userSettings[setting];
            }
        }
        updateDt();
    }
    function elByClass(classToGet) {
        return doc.querySelector(classToGet) ||
                doc.querySelector('.' + classToGet);
    }
    function loadTemplate() {
        var template = doc.getElementById(settings.template.id).innerHTML;
        doc.querySelector(wrapClass).innerHTML = template;
        wrapEl = elByClass(settings.template.imageWrapClass);
        statsWorldEl = elByClass(settings.template.statsWorldClass);
        statsUnreachEl = elByClass(settings.template.statsUnReachClass);
        statsRunning = !! (statsWorldEl && statsUnreachEl);
    }
    function loadImages(response) {
        var clone,
            imgTemplate = doc.createElement('img'),
            width = Math.round(win.innerWidth * settings.template.imageWidth),
            height = Math.round(win.innerHeight *
                        settings.template.imageHeight),
            resp, i = 0;
        try {
            resp = JSON.parse(response.currentTarget.responseText);
        } catch (e) {
            setTimeout(retrieveImages, 3000);
            return false;
        }
        for (; i < resp.files.length; i += 1) {
            clone = imgTemplate.cloneNode();
            clone.src = resp.files[i];
            clone.setAttribute('width', width);
            clone.setAttribute('height', height);
            wrapEl.appendChild(clone);
            images.push(clone);
        }
        current = images.length - 1;
        previous = images.length;
        fadeIn(current);
        running = true;
        timer = win.setTimeout(flipper, settings.imageTimeout);
    }
    function retrieveImages() {
        var xhr = new XMLHttpRequest();
        xhr.onload = loadImages;
        xhr.open('get', 'ws/files.php?action=get_files&from=web', true);
        xhr.send();
    }
    function updateImages() {
        images = [];
        wrapEl = elByClass(settings.template.imageWrapClass);
        retrieveImages();
    }
    function removeAllImages() {
        while(wrapEl.firstChild) {
            wrapEl.removeChild(wrapEl.firstChild);
        }
    }
    function nextValidIndex(slideNumber) {
        var nv = slideNumber + 1;
        return (nv >= images.length) ? 0 : nv;
    }
    function prevValidIndex(slideNumber) {
        var pv = slideNumber - 1;
        return (pv < 0) ? images.length - 1 : pv;
    }
    function checkNext(slideNumber) {
        var xhr,
            queryURL = 'ws/files.php?action=get_next&from=web&current=',
            myCurSrc, myNextSrc;
        if (! checking) {
            checking = true;
            if (images[slideNumber]) {
                // use getAttribute so we don't get the whole url
                myCurSrc = images[slideNumber].getAttribute('src');
                myNextSrc = images[nextValidIndex(slideNumber)].
                                getAttribute('src');
                queryURL += myCurSrc;
                xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var resp, serverCurSrc, serverNextSrc;
                    // check to see if this is still a valid image
                    resp = JSON.parse(xhr.response);
                    if (resp.success) {
                        if (resp.reload) {
                            win.location.reload();
                        } else if (resp.reset) {
                            running = false;
                            removeEvents();
                            win.clearTimeout(timer);
                            removeAllImages();
                            loadPage();
                            addEvents();
                        } else {
                            serverCurSrc = resp.current;
                            serverNextSrc = resp.next;
                            // check that the current slide is equal to the one
                            // the server returns next
                            if (serverNextSrc !== myNextSrc) {
                                running = false;
                                win.clearTimeout(timer);
                                removeAllImages();
                                updateImages();
                            }
                        }
                    }
                    // allow next check
                    checking = false;
                };
                xhr.open('get', queryURL, true);
                xhr.send();
            }
        }
    }
    function nextPair() {
        // increment through images
        current = nextValidIndex(current);
        previous = prevValidIndex(current); // in case image is removed
    }
    function fadeOut(slideNumber) {
        if (images[slideNumber].classList.contains('current')) {
            images[slideNumber].classList.remove('current');
        }
    }
    function fadeIn(slideNumber) {
        images[slideNumber].classList.add('current');
    }
    function flipper() {
        nextPair();
        if (current !== previous) {
            // handling fading
            try { // we could possibly encounter an undefined image depending
                  //    on what gets removed and added to the image list
                fadeOut(previous);
                fadeIn(current);
            } catch (e) {
                nextPair();
            }
        }
        // use the time until the next time -previous- is shown to check
        //  to see if it's still valid
        checkNext(previous);
        if (running) {
            timer = win.setTimeout(flipper, settings.imageTimeout);
        }
    }
    function updateDt() {
		dt = new Date();
    }
    function updateStats() {
        if (statsRunning) {
            updateDt();
            currentWorldPop = Math.round(
                    (dt.getTime() - settings.baseWorld.time.getTime()) / 1000 *
                    settings.baseWorld.rate) + settings.baseWorld.pop;
            currentUnreachPop = Math.round((dt.getTime() -
                    settings.baseUnreached.time.getTime()) / 1000 *
                    settings.baseUnreached.rate) + settings.baseUnreached.pop;
            statsTimer = win.setTimeout(updateStats, settings.statsTimeout);
            displayStats();
        }
    }
	function formatLargeNumber(num) {
		var nnumStr = num += '', rgx = /(\d+)(\d{3})/;
		while (rgx.test(nnumStr)) {
			nnumStr = nnumStr.replace(rgx, '$1' + ',' + '$2');
		}
		return nnumStr;
	}
    function displayStats() {
        statsWorldEl.innerHTML = formatLargeNumber(currentWorldPop);
        statsUnreachEl.innerHTML = formatLargeNumber(currentUnreachPop);
    }
    function loadPage() {
        loadSettings();
        loadTemplate();
        updateImages();
        updateStats();
    }
    function resizeImagesCaller() {
        setTimeout(function () {
            resizeImages();
        }, 1500);
    }
    function addEvents() {
        win.addEventListener('resize', resizeImagesCaller);
    }
    function removeEvents() {
        win.removeEventListener('resize', resizeImagesCaller);
    }
    function resizeImages() {
        var i = 0, len = images.length,
            width = Math.round(win.innerWidth * settings.template.imageWidth),
            height = Math.round(win.innerHeight *
                        settings.template.imageHeight);
        for (; i < len; i += 1) {
            images[i].setAttribute('width', width);
            images[i].setAttribute('height', height);
        }
    }
    loadPage();
    addEvents();
}(window, document));
