var secondregion=0;
!(function (a, b) {
    "function" == typeof define && define.amd
        ? define("wavesurfer", [], function () {
              return (a.WaveSurfer = b());
          })
        : "object" == typeof exports
        ? (module.exports = b())
        : (a.WaveSurfer = b());
})(this, function () {
    "use strict";
    var a = {
        defaultParams: {
            audioContext: null,
            audioRate: 1,
            autoCenter: !0,
            backend: "WebAudio",
            barHeight: 1,
            closeAudioContext: !1,
            container: null,
            cursorColor: "#333",
            cursorWidth: 1,
            dragSelection: !0,
            fillParent: !0,
            forceDecode: !1,
            height: 128,
            hideScrollbar: !1,
            interact: !0,
            loopSelection: !0,
            mediaContainer: null,
            mediaControls: !1,
            mediaType: "audio",
            minPxPerSec: 20,
            partialRender: !1,
            pixelRatio: window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI,
            progressColor: "#555",
            normalize: !1,
            renderer: "MultiCanvas",
            scrollParent: !1,
            skipLength: 2,
            splitChannels: !1,
            waveColor: "#999",
        },
        init: function (b) {
            if (((this.params = a.util.extend({}, this.defaultParams, b)), (this.container = "string" == typeof b.container ? document.querySelector(this.params.container) : this.params.container), !this.container))
                throw new Error("Container element not found");
            if (
                (null == this.params.mediaContainer
                    ? (this.mediaContainer = this.container)
                    : "string" == typeof this.params.mediaContainer
                    ? (this.mediaContainer = document.querySelector(this.params.mediaContainer))
                    : (this.mediaContainer = this.params.mediaContainer),
                !this.mediaContainer)
            )
                throw new Error("Media Container element not found");
            (this.savedVolume = 0), (this.isMuted = !1), (this.tmpEvents = []), (this.currentAjax = null), this.createDrawer(), this.createBackend(), this.createPeakCache(), (this.isDestroyed = !1);
        },
        createDrawer: function () {
            var b = this;
            (this.drawer = Object.create(a.Drawer[this.params.renderer])),
                this.drawer.init(this.container, this.params),
                this.drawer.on("redraw", function () {
                    b.drawBuffer(), b.drawer.progress(b.backend.getPlayedPercents());
                }),
                this.drawer.on("click", function (a, c) {
                    setTimeout(function () {
                        b.seekTo(c);
                    }, 0);
                }),
                this.drawer.on("scroll", function (a) {
                    b.params.partialRender && b.drawBuffer(), b.fireEvent("scroll", a);
                });
        },
        createBackend: function () {
            var b = this;
            this.backend && this.backend.destroy(),
                "AudioElement" == this.params.backend && (this.params.backend = "MediaElement"),
                "WebAudio" != this.params.backend || a.WebAudio.supportsWebAudio() || (this.params.backend = "MediaElement"),
                (this.backend = Object.create(a[this.params.backend])),
                this.backend.init(this.params),
                this.backend.on("finish", function () {
                    b.fireEvent("finish");
                }),
                this.backend.on("play", function () {
                    b.fireEvent("play");
                }),
                this.backend.on("pause", function () {
                    b.fireEvent("pause");
                }),
                this.backend.on("audioprocess", function (a) {
                    b.drawer.progress(b.backend.getPlayedPercents()), b.fireEvent("audioprocess", a);
                });
        },
        createPeakCache: function () {
            this.params.partialRender && ((this.peakCache = Object.create(a.PeakCache)), this.peakCache.init());
        },
        getDuration: function () {
            return this.backend.getDuration();
        },
        getCurrentTime: function () {
            return this.backend.getCurrentTime();
        },
        play: function (a, b) {
            this.fireEvent("interaction", this.play.bind(this, a, b)), this.backend.play(a, b);
        },
        pause: function () {
            this.backend.isPaused() || this.backend.pause();
        },
        playPause: function () {
            this.backend.isPaused() ? this.play() : this.pause();
        },
        isPlaying: function () {
            return !this.backend.isPaused();
        },
        skipBackward: function (a) {
            this.skip(-a || -this.params.skipLength);
        },
        skipForward: function (a) {
            this.skip(a || this.params.skipLength);
        },
        skip: function (a) {
            var b = this.getCurrentTime() || 0,
                c = this.getDuration() || 1;
            (b = Math.max(0, Math.min(c, b + (a || 0)))), this.seekAndCenter(b / c);
        },
        seekAndCenter: function (a) {
            this.seekTo(a), this.drawer.recenter(a);
        },
        seekTo: function (a) {
            this.fireEvent("interaction", this.seekTo.bind(this, a));
            var b = this.backend.isPaused();
            b || this.backend.pause();
            var c = this.params.scrollParent;
            (this.params.scrollParent = !1), this.backend.seekTo(a * this.getDuration()), this.drawer.progress(this.backend.getPlayedPercents()), b || this.backend.play(), (this.params.scrollParent = c), this.fireEvent("seek", a);
        },
        stop: function () {
            this.pause(), this.seekTo(0), this.drawer.progress(0);
        },
        setVolume: function (a) {
            this.backend.setVolume(a);
        },
        getVolume: function () {
            return this.backend.getVolume();
        },
        setPlaybackRate: function (a) {
            this.backend.setPlaybackRate(a);
        },
        getPlaybackRate: function () {
            return this.backend.getPlaybackRate();
        },
        toggleMute: function () {
            this.setMute(!this.isMuted);
        },
        setMute: function (a) {
            a !== this.isMuted && (a ? ((this.savedVolume = this.backend.getVolume()), this.backend.setVolume(0), (this.isMuted = !0)) : (this.backend.setVolume(this.savedVolume), (this.isMuted = !1)));
        },
        getMute: function () {
            return this.isMuted;
        },
        getFilters: function () {
            return this.backend.filters || [];
        },
        toggleScroll: function () {
            (this.params.scrollParent = !this.params.scrollParent), this.drawBuffer();
        },
        toggleInteraction: function () {
            this.params.interact = !this.params.interact;
        },
        drawBuffer: function () {
            var a = Math.round(this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio),
                b = this.drawer.getWidth(),
                c = a,
                d = this.drawer.getScrollX(),
                e = Math.min(d + b, c);
            if ((this.params.fillParent && (!this.params.scrollParent || a < b) && ((c = b), (d = 0), (e = c)), this.params.partialRender))
                for (var f = this.peakCache.addRangeToPeakCache(c, d, e), g = 0; g < f.length; g++) {
                    var h = this.backend.getPeaks(c, f[g][0], f[g][1]);
                    this.drawer.drawPeaks(h, c, f[g][0], f[g][1]);
                }
            else {
                (d = 0), (e = c);
                var h = this.backend.getPeaks(c, d, e);
                this.drawer.drawPeaks(h, c, d, e);
            }
            this.fireEvent("redraw", h, c);
        },
        zoom: function (a) {
            (this.params.minPxPerSec = a),
                (this.params.scrollParent = !0),
                this.drawBuffer(),
                this.drawer.progress(this.backend.getPlayedPercents()),
                this.drawer.recenter(this.getCurrentTime() / this.getDuration()),
                this.fireEvent("zoom", a);
        },
        loadArrayBuffer: function (a) {
            this.decodeArrayBuffer(
                a,
                function (a) {
                    this.isDestroyed || this.loadDecodedBuffer(a);
                }.bind(this)
            );
        },
        loadDecodedBuffer: function (a) {
            this.backend.load(a), this.drawBuffer(), this.fireEvent("ready");
        },
        loadBlob: function (a) {
            var b = this,
                c = new FileReader();
            c.addEventListener("progress", function (a) {
                b.onProgress(a);
            }),
                c.addEventListener("load", function (a) {
                    b.loadArrayBuffer(a.target.result);
                }),
                c.addEventListener("error", function () {
                    b.fireEvent("error", "Error reading file");
                }),
                c.readAsArrayBuffer(a),
                this.empty();
        },
        load: function (a, b, c) {
            switch ((this.empty(), this.params.backend)) {
                case "WebAudio":
                    return this.loadBuffer(a, b);
                case "MediaElement":
                    return this.loadMediaElement(a, b, c);
            }
        },
        loadBuffer: function (a, b) {
            var c = function (b) {
                return b && this.tmpEvents.push(this.once("ready", b)), this.getArrayBuffer(a, this.loadArrayBuffer.bind(this));
            }.bind(this);
            return b ? (this.backend.setPeaks(b), this.drawBuffer(), this.tmpEvents.push(this.once("interaction", c)), void 0) : c();
        },
        loadMediaElement: function (a, b, c) {
            var d = a;
            if ("string" == typeof a) this.backend.load(d, this.mediaContainer, b, c);
            else {
                var e = a;
                this.backend.loadElt(e, b), (d = e.src);
            }
            this.tmpEvents.push(
                this.backend.once(
                    "canplay",
                    function () {
                        this.drawBuffer(), this.fireEvent("ready");
                    }.bind(this)
                ),
                this.backend.once(
                    "error",
                    function (a) {
                        this.fireEvent("error", a);
                    }.bind(this)
                )
            ),
                b && this.backend.setPeaks(b),
                (b && !this.params.forceDecode) ||
                    !this.backend.supportsWebAudio() ||
                    this.getArrayBuffer(
                        d,
                        function (a) {
                            this.decodeArrayBuffer(
                                a,
                                function (a) {
                                    (this.backend.buffer = a), this.backend.setPeaks(null), this.drawBuffer(), this.fireEvent("waveform-ready");
                                }.bind(this)
                            );
                        }.bind(this)
                    );
        },
        decodeArrayBuffer: function (a, b) {
            (this.arraybuffer = a),
                this.backend.decodeArrayBuffer(
                    a,
                    function (c) {
                        this.isDestroyed || this.arraybuffer != a || (b(c), (this.arraybuffer = null));
                    }.bind(this),
                    this.fireEvent.bind(this, "error", "Error decoding audiobuffer")
                );
        },
        getArrayBuffer: function (b, c) {
            var d = this,
                e = a.util.ajax({ url: b, responseType: "arraybuffer" });
            return (
                (this.currentAjax = e),
                this.tmpEvents.push(
                    e.on("progress", function (a) {
                        d.onProgress(a);
                    }),
                    e.on("success", function (a, b) {
                        c(a), (d.currentAjax = null);
                    }),
                    e.on("error", function (a) {
                        d.fireEvent("error", "XHR error: " + a.target.statusText), (d.currentAjax = null);
                    })
                ),
                e
            );
        },
        onProgress: function (a) {
            if (a.lengthComputable) var b = a.loaded / a.total;
            else b = a.loaded / (a.loaded + 1e6);
            this.fireEvent("loading", Math.round(100 * b), a.target);
        },
        exportPCM: function (a, b, c) {
            (a = a || 1024), (b = b || 1e4), (c = c || !1);
            var d = this.backend.getPeaks(a, b),
                e = [].map.call(d, function (a) {
                    return Math.round(a * b) / b;
                }),
                f = JSON.stringify(e);
            return c || window.open("data:application/json;charset=utf-8," + encodeURIComponent(f)), f;
        },
        exportImage: function (a, b) {
            return a || (a = "image/png"), b || (b = 1), this.drawer.getImage(a, b);
        },
        cancelAjax: function () {
            this.currentAjax && (this.currentAjax.xhr.abort(), (this.currentAjax = null));
        },
        clearTmpEvents: function () {
            this.tmpEvents.forEach(function (a) {
                a.un();
            });
        },
        empty: function () {
            this.backend.isPaused() || (this.stop(), this.backend.disconnectSource()), this.cancelAjax(), this.clearTmpEvents(), this.drawer.progress(0), this.drawer.setWidth(0), this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
        },
        destroy: function () {
            this.fireEvent("destroy"), this.cancelAjax(), this.clearTmpEvents(), this.unAll(), this.backend.destroy(), this.drawer.destroy(), (this.isDestroyed = !0);
        },
    };
    return (
        (a.create = function (b) {
            var c = Object.create(a);
            return c.init(b), c;
        }),
        (a.util = {
            extend: function (a) {
                var b = Array.prototype.slice.call(arguments, 1);
                return (
                    b.forEach(function (b) {
                        Object.keys(b).forEach(function (c) {
                            a[c] = b[c];
                        });
                    }),
                    a
                );
            },
            debounce: function (a, b, c) {
                var d,
                    e,
                    f,
                    g = function () {
                        (f = null), c || a.apply(e, d);
                    };
                return function () {
                    (e = this), (d = arguments);
                    var h = c && !f;
                    clearTimeout(f), (f = setTimeout(g, b)), f || (f = setTimeout(g, b)), h && a.apply(e, d);
                };
            },
            min: function (a) {
                var b = +(1 / 0);
                for (var c in a) a[c] < b && (b = a[c]);
                return b;
            },
            max: function (a) {
                var b = -(1 / 0);
                for (var c in a) a[c] > b && (b = a[c]);
                return b;
            },
            getId: function () {
                return "wavesurfer_" + Math.random().toString(32).substring(2);
            },
            ajax: function (b) {
                var c = Object.create(a.Observer),
                    d = new XMLHttpRequest(),
                    e = !1;
                return (
                    d.open(b.method || "GET", b.url, !0),
                    (d.responseType = b.responseType || "json"),
                    d.addEventListener("progress", function (a) {
                        c.fireEvent("progress", a), a.lengthComputable && a.loaded == a.total && (e = !0);
                    }),
                    d.addEventListener("load", function (a) {
                        e || c.fireEvent("progress", a), c.fireEvent("load", a), 200 == d.status || 206 == d.status ? c.fireEvent("success", d.response, a) : c.fireEvent("error", a);
                    }),
                    d.addEventListener("error", function (a) {
                        c.fireEvent("error", a);
                    }),
                    d.send(),
                    (c.xhr = d),
                    c
                );
            },
        }),
        (a.Observer = {
            on: function (a, b) {
                this.handlers || (this.handlers = {});
                var c = this.handlers[a];
                return c || (c = this.handlers[a] = []), c.push(b), { name: a, callback: b, un: this.un.bind(this, a, b) };
            },
            un: function (a, b) {
                if (this.handlers) {
                    var c = this.handlers[a];
                    if (c)
                        if (b) for (var d = c.length - 1; d >= 0; d--) c[d] == b && c.splice(d, 1);
                        else c.length = 0;
                }
            },
            unAll: function () {
                this.handlers = null;
            },
            once: function (a, b) {
                var c = this,
                    d = function () {
                        b.apply(this, arguments),
                            setTimeout(function () {
                                c.un(a, d);
                            }, 0);
                    };
                return this.on(a, d);
            },
            fireEvent: function (a) {
                if (this.handlers) {
                    var b = this.handlers[a],
                        c = Array.prototype.slice.call(arguments, 1);
                    b &&
                        b.forEach(function (a) {
                            a.apply(null, c);
                        });
                }
            },
        }),
        a.util.extend(a, a.Observer),
        (a.WebAudio = {
            scriptBufferSize: 256,
            PLAYING_STATE: 0,
            PAUSED_STATE: 1,
            FINISHED_STATE: 2,
            supportsWebAudio: function () {
                return !(!window.AudioContext && !window.webkitAudioContext);
            },
            getAudioContext: function () {
                return a.WebAudio.audioContext || (a.WebAudio.audioContext = new (window.AudioContext || window.webkitAudioContext)()), a.WebAudio.audioContext;
            },
            getOfflineAudioContext: function (b) {
                return a.WebAudio.offlineAudioContext || (a.WebAudio.offlineAudioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, b)), a.WebAudio.offlineAudioContext;
            },
            init: function (b) {
                (this.params = b),
                    (this.ac = b.audioContext || this.getAudioContext()),
                    (this.lastPlay = this.ac.currentTime),
                    (this.startPosition = 0),
                    (this.scheduledPause = null),
                    (this.states = [Object.create(a.WebAudio.state.playing), Object.create(a.WebAudio.state.paused), Object.create(a.WebAudio.state.finished)]),
                    this.createVolumeNode(),
                    this.createScriptNode(),
                    this.createAnalyserNode(),
                    this.setState(this.PAUSED_STATE),
                    this.setPlaybackRate(this.params.audioRate),
                    this.setLength(0);
            },
            disconnectFilters: function () {
                this.filters &&
                    (this.filters.forEach(function (a) {
                        a && a.disconnect();
                    }),
                    (this.filters = null),
                    this.analyser.connect(this.gainNode));
            },
            setState: function (a) {
                this.state !== this.states[a] && ((this.state = this.states[a]), this.state.init.call(this));
            },
            setFilter: function () {
                this.setFilters([].slice.call(arguments));
            },
            setFilters: function (a) {
                this.disconnectFilters(),
                    a &&
                        a.length &&
                        ((this.filters = a),
                        this.analyser.disconnect(),
                        a
                            .reduce(function (a, b) {
                                return a.connect(b), b;
                            }, this.analyser)
                            .connect(this.gainNode));
            },
            createScriptNode: function () {
                this.ac.createScriptProcessor ? (this.scriptNode = this.ac.createScriptProcessor(this.scriptBufferSize)) : (this.scriptNode = this.ac.createJavaScriptNode(this.scriptBufferSize)),
                    this.scriptNode.connect(this.ac.destination);
            },
            addOnAudioProcess: function () {
                var a = this;
                this.scriptNode.onaudioprocess = function () {
                    var b = a.getCurrentTime();
                    b >= a.getDuration() ? (a.setState(a.FINISHED_STATE), a.fireEvent("pause")) : b >= a.scheduledPause ? a.pause() : a.state === a.states[a.PLAYING_STATE] && a.fireEvent("audioprocess", b);
                };
            },
            removeOnAudioProcess: function () {
                this.scriptNode.onaudioprocess = null;
            },
            createAnalyserNode: function () {
                (this.analyser = this.ac.createAnalyser()), this.analyser.connect(this.gainNode);
            },
            createVolumeNode: function () {
                this.ac.createGain ? (this.gainNode = this.ac.createGain()) : (this.gainNode = this.ac.createGainNode()), this.gainNode.connect(this.ac.destination);
            },
            setVolume: function (a) {
                this.gainNode.gain.value = a;
            },
            getVolume: function () {
                return this.gainNode.gain.value;
            },
            decodeArrayBuffer: function (a, b, c) {
                this.offlineAc || (this.offlineAc = this.getOfflineAudioContext(this.ac ? this.ac.sampleRate : 44100)),
                    this.offlineAc.decodeAudioData(
                        a,
                        function (a) {
                            b(a);
                        }.bind(this),
                        c
                    );
            },
            setPeaks: function (a) {
                this.peaks = a;
            },
            setLength: function (a) {
                if (!this.mergedPeaks || a != 2 * this.mergedPeaks.length - 1 + 2) {
                    (this.splitPeaks = []), (this.mergedPeaks = []);
                    for (var b = this.buffer ? this.buffer.numberOfChannels : 1, c = 0; c < b; c++) (this.splitPeaks[c] = []), (this.splitPeaks[c][2 * (a - 1)] = 0), (this.splitPeaks[c][2 * (a - 1) + 1] = 0);
                    (this.mergedPeaks[2 * (a - 1)] = 0), (this.mergedPeaks[2 * (a - 1) + 1] = 0);
                }
            },
            getPeaks: function (a, b, c) {
                if (this.peaks) return this.peaks;
                this.setLength(a);
                for (var d = this.buffer.length / a, e = ~~(d / 10) || 1, f = this.buffer.numberOfChannels, g = 0; g < f; g++)
                    for (var h = this.splitPeaks[g], i = this.buffer.getChannelData(g), j = b; j <= c; j++) {
                        for (var k = ~~(j * d), l = ~~(k + d), m = 0, n = 0, o = k; o < l; o += e) {
                            var p = i[o];
                            p > n && (n = p), p < m && (m = p);
                        }
                        (h[2 * j] = n), (h[2 * j + 1] = m), (0 == g || n > this.mergedPeaks[2 * j]) && (this.mergedPeaks[2 * j] = n), (0 == g || m < this.mergedPeaks[2 * j + 1]) && (this.mergedPeaks[2 * j + 1] = m);
                    }
                return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
            },
            getPlayedPercents: function () {
                return this.state.getPlayedPercents.call(this);
            },
            disconnectSource: function () {
                this.source && this.source.disconnect();
            },
            destroy: function () {
                this.isPaused() || this.pause(),
                    this.unAll(),
                    (this.buffer = null),
                    this.disconnectFilters(),
                    this.disconnectSource(),
                    this.gainNode.disconnect(),
                    this.scriptNode.disconnect(),
                    this.analyser.disconnect(),
                    this.params.closeAudioContext &&
                        ("function" == typeof this.ac.close && "closed" != this.ac.state && this.ac.close(),
                        (this.ac = null),
                        this.params.audioContext ? (this.params.audioContext = null) : (a.WebAudio.audioContext = null),
                        (a.WebAudio.offlineAudioContext = null));
            },
            load: function (a) {
                (this.startPosition = 0), (this.lastPlay = this.ac.currentTime), (this.buffer = a), this.createSource();
            },
            createSource: function () {
                this.disconnectSource(),
                    (this.source = this.ac.createBufferSource()),
                    (this.source.start = this.source.start || this.source.noteGrainOn),
                    (this.source.stop = this.source.stop || this.source.noteOff),
                    (this.source.playbackRate.value = this.playbackRate),
                    (this.source.buffer = this.buffer),
                    this.source.connect(this.analyser);
            },
            isPaused: function () {
                return this.state !== this.states[this.PLAYING_STATE];
            },
            getDuration: function () {
                return this.buffer ? this.buffer.duration : 0;
            },
            seekTo: function (a, b) {
                if (this.buffer)
                    return (
                        (this.scheduledPause = null),
                        null == a && ((a = this.getCurrentTime()), a >= this.getDuration() && (a = 0)),
                        null == b && (b = this.getDuration()),
                        (this.startPosition = a),
                        (this.lastPlay = this.ac.currentTime),
                        this.state === this.states[this.FINISHED_STATE] && this.setState(this.PAUSED_STATE),
                        { start: a, end: b }
                    );
            },
            getPlayedTime: function () {
                return (this.ac.currentTime - this.lastPlay) * this.playbackRate;
            },
            play: function (a, b) {
                if (this.buffer) {
                    this.createSource();
                    var c = this.seekTo(a, b);
                    (a = c.start), (b = c.end), (this.scheduledPause = b), this.source.start(0, a, b - a), "suspended" == this.ac.state && this.ac.resume && this.ac.resume(), this.setState(this.PLAYING_STATE), this.fireEvent("play");
                }
            },
            pause: function () {
                (this.scheduledPause = null), (this.startPosition += this.getPlayedTime()), this.source && this.source.stop(0), this.setState(this.PAUSED_STATE), this.fireEvent("pause");
            },
            getCurrentTime: function () {
                return this.state.getCurrentTime.call(this);
            },
            getPlaybackRate: function () {
                return this.playbackRate;
            },
            setPlaybackRate: function (a) {
                (a = a || 1), this.isPaused() ? (this.playbackRate = a) : (this.pause(), (this.playbackRate = a), this.play());
            },
        }),
        (a.WebAudio.state = {}),
        (a.WebAudio.state.playing = {
            init: function () {
                this.addOnAudioProcess();
            },
            getPlayedPercents: function () {
                var a = this.getDuration();
                return this.getCurrentTime() / a || 0;
            },
            getCurrentTime: function () {
                return this.startPosition + this.getPlayedTime();
            },
        }),
        (a.WebAudio.state.paused = {
            init: function () {
                this.removeOnAudioProcess();
            },
            getPlayedPercents: function () {
                var a = this.getDuration();
                return this.getCurrentTime() / a || 0;
            },
            getCurrentTime: function () {
                return this.startPosition;
            },
        }),
        (a.WebAudio.state.finished = {
            init: function () {
                this.removeOnAudioProcess(), this.fireEvent("finish");
            },
            getPlayedPercents: function () {
                return 1;
            },
            getCurrentTime: function () {
                return this.getDuration();
            },
        }),
        a.util.extend(a.WebAudio, a.Observer),
        (a.MediaElement = Object.create(a.WebAudio)),
        a.util.extend(a.MediaElement, {
            init: function (a) {
                (this.params = a),
                    (this.media = { currentTime: 0, duration: 0, paused: !0, playbackRate: 1, play: function () {}, pause: function () {} }),
                    (this.mediaType = a.mediaType.toLowerCase()),
                    (this.elementPosition = a.elementPosition),
                    this.setPlaybackRate(this.params.audioRate),
                    this.createTimer();
            },
            createTimer: function () {
                var a = this,
                    b = function () {
                        if (!a.isPaused()) {
                            a.fireEvent("audioprocess", a.getCurrentTime());
                            var c = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
                            c(b);
                        }
                    };
                this.on("play", b);
            },
            load: function (a, b, c, d) {
                var e = document.createElement(this.mediaType);
                (e.controls = this.params.mediaControls), (e.autoplay = this.params.autoplay || !1), (e.preload = null == d ? "auto" : d), (e.src = a), (e.style.width = "100%");
                var f = b.querySelector(this.mediaType);
                f && b.removeChild(f), b.appendChild(e), this._load(e, c);
            },
            loadElt: function (a, b) {
                var c = a;
                (c.controls = this.params.mediaControls), (c.autoplay = this.params.autoplay || !1), this._load(c, b);
            },
            _load: function (a, b) {
                var c = this;
                "function" == typeof a.load && a.load(),
                    a.addEventListener("error", function () {
                        c.fireEvent("error", "Error loading media element");
                    }),
                    a.addEventListener("canplay", function () {
                        c.fireEvent("canplay");
                    }),
                    a.addEventListener("ended", function () {
                        c.fireEvent("finish");
                    }),
                    (this.media = a),
                    (this.peaks = b),
                    (this.onPlayEnd = null),
                    (this.buffer = null),
                    this.setPlaybackRate(this.playbackRate);
            },
            isPaused: function () {
                return !this.media || this.media.paused;
            },
            getDuration: function () {
                var a = (this.buffer || this.media).duration;
                return a >= 1 / 0 && (a = this.media.seekable.end(0)), a;
            },
            getCurrentTime: function () {
                return this.media && this.media.currentTime;
            },
            getPlayedPercents: function () {
                return this.getCurrentTime() / this.getDuration() || 0;
            },
            getPlaybackRate: function () {
                return this.playbackRate || this.media.playbackRate;
            },
            setPlaybackRate: function (a) {
                (this.playbackRate = a || 1), (this.media.playbackRate = this.playbackRate);
            },
            seekTo: function (a) {
                null != a && (this.media.currentTime = a), this.clearPlayEnd();
            },
            play: function (a, b) {
                this.seekTo(a), this.media.play(), b && this.setPlayEnd(b), this.fireEvent("play");
            },
            pause: function () {
                this.media && this.media.pause(), this.clearPlayEnd(), this.fireEvent("pause");
            },
            setPlayEnd: function (a) {
                var b = this;
                (this.onPlayEnd = function (c) {
                    c >= a && (b.pause(), b.seekTo(a));
                }),
                    this.on("audioprocess", this.onPlayEnd);
            },
            clearPlayEnd: function () {
                this.onPlayEnd && (this.un("audioprocess", this.onPlayEnd), (this.onPlayEnd = null));
            },
            getPeaks: function (b, c, d) {
                return this.buffer ? a.WebAudio.getPeaks.call(this, b, c, d) : this.peaks || [];
            },
            getVolume: function () {
                return this.media.volume;
            },
            setVolume: function (a) {
                this.media.volume = a;
            },
            destroy: function () {
                this.pause(), this.unAll(), this.media && this.media.parentNode && this.media.parentNode.removeChild(this.media), (this.media = null);
            },
        }),
        (a.AudioElement = a.MediaElement),
        (a.Drawer = {
            init: function (a, b) {
                (this.container = a), (this.params = b), (this.width = 0), (this.height = b.height * this.params.pixelRatio), (this.lastPos = 0), this.initDrawer(b), this.createWrapper(), this.createElements();
            },
            createWrapper: function () {
                (this.wrapper = this.container.appendChild(document.createElement("wave"))),
                    this.style(this.wrapper, { display: "block", position: "relative", userSelect: "none", webkitUserSelect: "none", height: this.params.height + "px" }),
                    (this.params.fillParent || this.params.scrollParent) && this.style(this.wrapper, { width: "100%"}),
                    this.setupWrapperEvents();
            },
            handleEvent: function (a, b) {
                !b && a.preventDefault();
                var c,
                    d = a.targetTouches ? a.targetTouches[0].clientX : a.clientX,
                    e = this.wrapper.getBoundingClientRect(),
                    f = this.width,
                    g = this.getWidth();
                return !this.params.fillParent && f < g ? ((c = ((d - e.left) * this.params.pixelRatio) / f || 0), c > 1 && (c = 1)) : (c = (d - e.left + this.wrapper.scrollLeft) / this.wrapper.scrollWidth || 0), c;
            },
            setupWrapperEvents: function () {
                var a = this;
                this.wrapper.addEventListener("click", function (b) {
                    var c = a.wrapper.offsetHeight - a.wrapper.clientHeight;
                    if (0 != c) {
                        var d = a.wrapper.getBoundingClientRect();
                        if (b.clientY >= d.bottom - c) return;
                    }
                    a.params.interact && a.fireEvent("click", b, a.handleEvent(b));
                }),
                    this.wrapper.addEventListener("scroll", function (b) {
                        a.fireEvent("scroll", b);
                    });
            },
            drawPeaks: function (a, b, c, d) {
                this.setWidth(b), this.params.barWidth ? this.drawBars(a, 0, c, d) : this.drawWave(a, 0, c, d);
            },
            style: function (a, b) {
                return (
                    Object.keys(b).forEach(function (c) {
                        a.style[c] !== b[c] && (a.style[c] = b[c]);
                    }),
                    a
                );
            },
            resetScroll: function () {
                null !== this.wrapper && (this.wrapper.scrollLeft = 0);
            },
            recenter: function (a) {
                var b = this.wrapper.scrollWidth * a;
                this.recenterOnPosition(b, !0);
            },
            recenterOnPosition: function (a, b) {
                var c = this.wrapper.scrollLeft,
                    d = ~~(this.wrapper.clientWidth / 2),
                    e = a - d,
                    f = e - c,
                    g = this.wrapper.scrollWidth - this.wrapper.clientWidth;
                if (0 != g) {
                    if (!b && -d <= f && f < d) {
                        var h = 5;
                        (f = Math.max(-h, Math.min(h, f))), (e = c + f);
                    }
                    (e = Math.max(0, Math.min(g, e))), e != c && (this.wrapper.scrollLeft = e);
                }
            },
            getScrollX: function () {
                return Math.round(this.wrapper.scrollLeft * this.params.pixelRatio);
            },
            getWidth: function () {
                return Math.round(this.container.clientWidth * this.params.pixelRatio);
            },
            setWidth: function (a) {
                this.width != a &&
                    ((this.width = a), this.params.fillParent || this.params.scrollParent ? this.style(this.wrapper, { width: "" }) : this.style(this.wrapper, { width: ~~(this.width / this.params.pixelRatio) + "px" }), this.updateSize());
            },
            setHeight: function (a) {
                a != this.height && ((this.height = a), this.style(this.wrapper, { height: ~~(this.height / this.params.pixelRatio) + "px" }), this.updateSize());
            },
            progress: function (a) {
                var b = 1 / this.params.pixelRatio,
                    c = Math.round(a * this.width) * b;
                if (c < this.lastPos || c - this.lastPos >= b) {
                    if (((this.lastPos = c), this.params.scrollParent && this.params.autoCenter)) {
                        var d = ~~(this.wrapper.scrollWidth * a);
                        this.recenterOnPosition(d);
                    }
                    this.updateProgress(c);
                }
            },
            destroy: function () {
                this.unAll(), this.wrapper && (this.container.removeChild(this.wrapper), (this.wrapper = null));
            },
            initDrawer: function () {},
            createElements: function () {},
            updateSize: function () {},
            drawWave: function (a, b) {},
            clearWave: function () {},
            updateProgress: function (a) {},
        }),
        a.util.extend(a.Drawer, a.Observer),
        (a.Drawer.Canvas = Object.create(a.Drawer)),
        a.util.extend(a.Drawer.Canvas, {
            createElements: function () {
                var a = this.wrapper.appendChild(this.style(document.createElement("canvas"), { position: "absolute", zIndex: 1, left: 0, top: 0, bottom: 0 }));
                if (
                    ((this.waveCc = a.getContext("2d")),
                    (this.progressWave = this.wrapper.appendChild(
                        this.style(document.createElement("wave"), {
                            position: "absolute",
                            zIndex: 2,
                            left: 0,
                            top: 0,
                            bottom: 0,
                            //overflow: "hidden",
                            width: "0",
                            display: "none",
                            boxSizing: "border-box",
                            borderRightStyle: "solid",
                            borderRightWidth: this.params.cursorWidth + "px",
                            borderRightColor: this.params.cursorColor,
                        })
                    )),
                    this.params.waveColor != this.params.progressColor)
                ) {
                    var b = this.progressWave.appendChild(document.createElement("canvas"));
                    this.progressCc = b.getContext("2d");
                }
            },
            updateSize: function () {
                var a = Math.round(this.width / this.params.pixelRatio);
                (this.waveCc.canvas.width = this.width),
                    (this.waveCc.canvas.height = this.height),
                    this.style(this.waveCc.canvas, { width: a + "px" }),
                    this.style(this.progressWave, { display: "block" }),
                    this.progressCc && ((this.progressCc.canvas.width = this.width), (this.progressCc.canvas.height = this.height), this.style(this.progressCc.canvas, { width: a + "px" })),
                    this.clearWave();
            },
            clearWave: function () {
                this.waveCc.clearRect(0, 0, this.width, this.height), this.progressCc && this.progressCc.clearRect(0, 0, this.width, this.height);
            },
            drawBars: function (b, c, d, e) {
                var f = this;
                if (b[0] instanceof Array) {
                    var g = b;
                    if (this.params.splitChannels)
                        return (
                            this.setHeight(g.length * this.params.height * this.params.pixelRatio),
                            void g.forEach(function (a, b) {
                                f.drawBars(a, b, d, e);
                            })
                        );
                    b = g[0];
                }
                var h = [].some.call(b, function (a) {
                        return a < 0;
                    }),
                    i = 1;
                h && (i = 2);
                var j = 0.5 / this.params.pixelRatio,
                    k = this.width,
                    l = this.params.height * this.params.pixelRatio,
                    m = l * c || 0,
                    n = l / 2,
                    o = b.length / i,
                    p = this.params.barWidth * this.params.pixelRatio,
                    q = Math.max(this.params.pixelRatio, ~~(p / 2)),
                    r = p + q,
                    s = 1 / this.params.barHeight;
                if (this.params.normalize) {
                    var t = a.util.max(b),
                        u = a.util.min(b);
                    s = -u > t ? -u : t;
                }
                var v = o / k;
                (this.waveCc.fillStyle = this.params.waveColor),
                    this.progressCc && (this.progressCc.fillStyle = this.params.progressColor),
                    [this.waveCc, this.progressCc].forEach(function (a) {
                        if (a)
                            for (var c = d / v; c < e / v; c += r) {
                                var f = b[Math.floor(c * v * i)] || 0,
                                    g = Math.round((f / s) * n);
                                a.fillRect(c + j, n - g + m, p + j, 2 * g);
                            }
                    }, this);
            },
            drawWave: function (b, c, d, e) {
                var f = this;
                if (b[0] instanceof Array) {
                    var g = b;
                    if (this.params.splitChannels)
                        return (
                            this.setHeight(g.length * this.params.height * this.params.pixelRatio),
                            void g.forEach(function (a, b) {
                                f.drawWave(a, b, d, e);
                            })
                        );
                    b = g[0];
                }
                var h = [].some.call(b, function (a) {
                    return a < 0;
                });
                if (!h) {
                    for (var i = [], j = 0, k = b.length; j < k; j++) (i[2 * j] = b[j]), (i[2 * j + 1] = -b[j]);
                    b = i;
                }
                var l = 0.5 / this.params.pixelRatio,
                    m = this.params.height * this.params.pixelRatio,
                    n = m * c || 0,
                    o = m / 2,
                    p = ~~(b.length / 2),
                    q = 1;
                this.params.fillParent && this.width != p && (q = this.width / p);
                var r = 1 / this.params.barHeight;
                if (this.params.normalize) {
                    var s = a.util.max(b),
                        t = a.util.min(b);
                    r = -t > s ? -t : s;
                }
                (this.waveCc.fillStyle = this.params.waveColor),
                    this.progressCc && (this.progressCc.fillStyle = this.params.progressColor),
                    [this.waveCc, this.progressCc].forEach(function (a) {
                        if (a) {
                            a.beginPath(), a.moveTo(d * q + l, o + n);
                            for (var c = d; c < e; c++) {
                                var f = Math.round((b[2 * c] / r) * o);
                                a.lineTo(c * q + l, o - f + n);
                            }
                            for (var c = e - 1; c >= d; c--) {
                                var f = Math.round((b[2 * c + 1] / r) * o);
                                a.lineTo(c * q + l, o - f + n);
                            }
                            a.closePath(), a.fill(), a.fillRect(0, o + n - l, this.width, l);
                        }
                    }, this);
            },
            updateProgress: function (a) {
                this.style(this.progressWave, { width: a + "px" });
            },
            getImage: function (a, b) {
                return this.waveCc.canvas.toDataURL(a, b);
            },
        }),
        (a.Drawer.MultiCanvas = Object.create(a.Drawer)),
        a.util.extend(a.Drawer.MultiCanvas, {
            initDrawer: function (a) {
                if (((this.maxCanvasWidth = null != a.maxCanvasWidth ? a.maxCanvasWidth : 4e3), (this.maxCanvasElementWidth = Math.round(this.maxCanvasWidth / this.params.pixelRatio)), this.maxCanvasWidth <= 1))
                    throw "maxCanvasWidth must be greater than 1.";
                if (this.maxCanvasWidth % 2 == 1) throw "maxCanvasWidth must be an even number.";
                (this.hasProgressCanvas = this.params.waveColor != this.params.progressColor), (this.halfPixel = 0.5 / this.params.pixelRatio), (this.canvases = []);
            },
            createElements: function () {
                (this.progressWave = this.wrapper.appendChild(
                    this.style(document.createElement("wave"), {
                        position: "absolute",
                        zIndex: 2,
                        left: 0,
                        top: 0,
                        bottom: 0,
                        //overflow: "hidden",
                        width: "0",
                        display: "none",
                        boxSizing: "border-box",
                        borderRightStyle: "solid",
                        borderRightWidth: this.params.cursorWidth + "px",
                        borderRightColor: this.params.cursorColor,
                    })
                )),
                    this.addCanvas();
            },
            updateSize: function () {
                for (var a = Math.round(this.width / this.params.pixelRatio), b = Math.ceil(a / this.maxCanvasElementWidth); this.canvases.length < b; ) this.addCanvas();
                for (; this.canvases.length > b; ) this.removeCanvas();
                for (var c in this.canvases) {
                    var d = this.maxCanvasWidth + 2 * Math.ceil(this.params.pixelRatio / 2);
                    c == this.canvases.length - 1 && (d = this.width - this.maxCanvasWidth * (this.canvases.length - 1)), this.updateDimensions(this.canvases[c], d, this.height), this.clearWaveForEntry(this.canvases[c]);
                }
            },
            addCanvas: function () {
                var a = {},
                    b = this.maxCanvasElementWidth * this.canvases.length;
                (a.wave = this.wrapper.appendChild(this.style(document.createElement("canvas"), { position: "absolute", zIndex: 1, left: b + "px", top: 0, bottom: 0 }))),
                    (a.waveCtx = a.wave.getContext("2d")),
                    this.hasProgressCanvas &&
                        ((a.progress = this.progressWave.appendChild(this.style(document.createElement("canvas"), { position: "absolute", left: b + "px", top: 0, bottom: 0 }))), (a.progressCtx = a.progress.getContext("2d"))),
                    this.canvases.push(a);
            },
            removeCanvas: function () {
                var a = this.canvases.pop();
                a.wave.parentElement.removeChild(a.wave), this.hasProgressCanvas && a.progress.parentElement.removeChild(a.progress);
            },
            updateDimensions: function (a, b, c) {
                var d = Math.round(b / this.params.pixelRatio),
                    e = Math.round(this.width / this.params.pixelRatio);
                (a.start = a.waveCtx.canvas.offsetLeft / e || 0),
                    (a.end = a.start + d / e),
                    (a.waveCtx.canvas.width = b),
                    (a.waveCtx.canvas.height = c),
                    this.style(a.waveCtx.canvas, { width: d + "px" }),
                    this.style(this.progressWave, { display: "block" }),
                    this.hasProgressCanvas && ((a.progressCtx.canvas.width = b), (a.progressCtx.canvas.height = c), this.style(a.progressCtx.canvas, { width: d + "px" }));
            },
            clearWave: function () {
                for (var a in this.canvases) this.clearWaveForEntry(this.canvases[a]);
            },
            clearWaveForEntry: function (a) {
                a.waveCtx.clearRect(0, 0, a.waveCtx.canvas.width, a.waveCtx.canvas.height), this.hasProgressCanvas && a.progressCtx.clearRect(0, 0, a.progressCtx.canvas.width, a.progressCtx.canvas.height);
            },
            drawBars: function (b, c, d, e) {
                var f = this;
                if (b[0] instanceof Array) {
                    var g = b;
                    if (this.params.splitChannels)
                        return (
                            this.setHeight(g.length * this.params.height * this.params.pixelRatio),
                            void g.forEach(function (a, b) {
                                f.drawBars(a, b, d, e);
                            })
                        );
                    b = g[0];
                }
                var h = [].some.call(b, function (a) {
                        return a < 0;
                    }),
                    i = 1;
                h && (i = 2);
                var j = this.width,
                    k = this.params.height * this.params.pixelRatio,
                    l = k * c || 0,
                    m = k / 2,
                    n = b.length / i,
                    o = this.params.barWidth * this.params.pixelRatio,
                    p = Math.max(this.params.pixelRatio, ~~(o / 2)),
                    q = o + p,
                    r = 1 / this.params.barHeight;
                if (this.params.normalize) {
                    var s = a.util.max(b),
                        t = a.util.min(b);
                    r = -t > s ? -t : s;
                }
                for (var u = n / j, v = d / u; v < e / u; v += q) {
                    var w = b[Math.floor(v * u * i)] || 0,
                        x = Math.round((w / r) * m);
                    this.fillRect(v + this.halfPixel, m - x + l, o + this.halfPixel, 2 * x);
                }
            },
            drawWave: function (b, c, d, e) {
                var f = this;
                if (b[0] instanceof Array) {
                    var g = b;
                    if (this.params.splitChannels)
                        return (
                            this.setHeight(g.length * this.params.height * this.params.pixelRatio),
                            void g.forEach(function (a, b) {
                                f.drawWave(a, b, d, e);
                            })
                        );
                    b = g[0];
                }
                var h = [].some.call(b, function (a) {
                    return a < 0;
                });
                if (!h) {
                    for (var i = [], j = 0, k = b.length; j < k; j++) (i[2 * j] = b[j]), (i[2 * j + 1] = -b[j]);
                    b = i;
                }
                var l = this.params.height * this.params.pixelRatio,
                    m = l * c || 0,
                    n = l / 2,
                    o = 1 / this.params.barHeight;
                if (this.params.normalize) {
                    var p = a.util.max(b),
                        q = a.util.min(b);
                    o = -q > p ? -q : p;
                }
                this.drawLine(b, o, n, m, d, e), this.fillRect(0, n + m - this.halfPixel, this.width, this.halfPixel);
            },
            drawLine: function (a, b, c, d, e, f) {
                for (var g in this.canvases) {
                    var h = this.canvases[g];
                    this.setFillStyles(h), this.drawLineToContext(h, h.waveCtx, a, b, c, d, e, f), this.drawLineToContext(h, h.progressCtx, a, b, c, d, e, f);
                }
            },
            drawLineToContext: function (a, b, c, d, e, f, g, h) {
                if (b) {
                    var i = c.length / 2,
                        j = 1;
                    this.params.fillParent && this.width != i && (j = this.width / i);
                    var k = Math.round(i * a.start),
                        l = Math.round(i * a.end);
                    if (!(k > h || l < g)) {
                        var m = Math.max(k, g),
                            n = Math.min(l, h);
                        b.beginPath(), b.moveTo((m - k) * j + this.halfPixel, e + f);
                        for (var o = m; o < n; o++) {
                            var p = c[2 * o] || 0,
                                q = Math.round((p / d) * e);
                            b.lineTo((o - k) * j + this.halfPixel, e - q + f);
                        }
                        for (var o = n - 1; o >= m; o--) {
                            var p = c[2 * o + 1] || 0,
                                q = Math.round((p / d) * e);
                            b.lineTo((o - k) * j + this.halfPixel, e - q + f);
                        }
                        b.closePath(), b.fill();
                    }
                }
            },
            fillRect: function (a, b, c, d) {
                for (var e = Math.floor(a / this.maxCanvasWidth), f = Math.min(Math.ceil((a + c) / this.maxCanvasWidth) + 1, this.canvases.length), g = e; g < f; g++) {
                    var h = this.canvases[g],
                        i = g * this.maxCanvasWidth,
                        j = { x1: Math.max(a, g * this.maxCanvasWidth), y1: b, x2: Math.min(a + c, g * this.maxCanvasWidth + h.waveCtx.canvas.width), y2: b + d };
                    j.x1 < j.x2 && (this.setFillStyles(h), this.fillRectToContext(h.waveCtx, j.x1 - i, j.y1, j.x2 - j.x1, j.y2 - j.y1), this.fillRectToContext(h.progressCtx, j.x1 - i, j.y1, j.x2 - j.x1, j.y2 - j.y1));
                }
            },
            fillRectToContext: function (a, b, c, d, e) {
                a && a.fillRect(b, c, d, e);
            },
            setFillStyles: function (a) {
                (a.waveCtx.fillStyle = this.params.waveColor), this.hasProgressCanvas && (a.progressCtx.fillStyle = this.params.progressColor);
            },
            updateProgress: function (a) {
                this.style(this.progressWave, { width: a + "px" });
            },
            getImage: function (a, b) {
                var c = [];
                return (
                    this.canvases.forEach(function (d) {
                        c.push(d.wave.toDataURL(a, b));
                    }),
                    c.length > 1 ? c : c[0]
                );
            },
        }),
        (a.Drawer.SplitWavePointPlot = Object.create(a.Drawer.Canvas)),
        a.util.extend(a.Drawer.SplitWavePointPlot, {
            defaultPlotParams: {
                plotNormalizeTo: "whole",
                plotTimeStart: 0,
                plotMin: 0,
                plotMax: 1,
                plotColor: "#f63",
                plotProgressColor: "#F00",
                plotPointHeight: 2,
                plotPointWidth: 2,
                plotSeparator: !0,
                plotSeparatorColor: "black",
                plotRangeDisplay: !1,
                plotRangeUnits: "",
                plotRangePrecision: 4,
                plotRangeIgnoreOutliers: !1,
                plotRangeFontSize: 12,
                plotRangeFontType: "Ariel",
                waveDrawMedianLine: !0,
                plotFileDelimiter: "\t",
            },
            plotTimeStart: 0,
            plotTimeEnd: -1,
            plotArrayLoaded: !1,
            plotArray: [],
            plotPoints: [],
            plotMin: 0,
            plotMax: 1,
            initDrawer: function (a) {
                var b = this;
                for (var c in this.defaultPlotParams) void 0 === this.params[c] && (this.params[c] = this.defaultPlotParams[c]);
                if (((this.plotTimeStart = this.params.plotTimeStart), void 0 !== this.params.plotTimeEnd && (this.plotTimeEnd = this.params.plotTimeEnd), Array.isArray(a.plotArray)))
                    (this.plotArray = a.plotArray), (this.plotArrayLoaded = !0);
                else {
                    var d = function (a) {
                        (b.plotArray = a), (b.plotArrayLoaded = !0), b.fireEvent("plot_array_loaded");
                    };
                    this.loadPlotArrayFromFile(a.plotFileUrl, d, this.params.plotFileDelimiter);
                }
            },
            drawPeaks: function (a, b, c, d) {
                if (1 == this.plotArrayLoaded)
                    this.setWidth(b),
                        (this.splitChannels = !0),
                        (this.params.height = this.params.height / 2),
                        a[0] instanceof Array && (a = a[0]),
                        this.params.barWidth ? this.drawBars(a, 1, c, d) : this.drawWave(a, 1, c, d),
                        (this.params.height = 2 * this.params.height),
                        this.calculatePlots(),
                        this.drawPlots();
                else {
                    var e = this;
                    e.on("plot-array-loaded", function () {
                        e.drawPeaks(a, b, c, d);
                    });
                }
            },
            drawPlots: function () {
                var a = (this.params.height * this.params.pixelRatio) / 2,
                    b = 0.5 / this.params.pixelRatio;
                (this.waveCc.fillStyle = this.params.plotColor), this.progressCc && (this.progressCc.fillStyle = this.params.plotProgressColor);
                for (var c in this.plotPoints) {
                    var d = parseInt(c),
                        e = a - this.params.plotPointHeight - this.plotPoints[c] * (a - this.params.plotPointHeight),
                        f = this.params.plotPointHeight;
                    this.waveCc.fillRect(d, e, this.params.plotPointWidth, f), this.progressCc && this.progressCc.fillRect(d, e, this.params.plotPointWidth, f);
                }
                this.params.plotSeparator && ((this.waveCc.fillStyle = this.params.plotSeparatorColor), this.waveCc.fillRect(0, a, this.width, b)), this.params.plotRangeDisplay && this.displayPlotRange();
            },
            displayPlotRange: function () {
                var a = this.params.plotRangeFontSize * this.params.pixelRatio,
                    b = this.plotMax.toPrecision(this.params.plotRangePrecision) + " " + this.params.plotRangeUnits,
                    c = this.plotMin.toPrecision(this.params.plotRangePrecision) + " " + this.params.plotRangeUnits;
                (this.waveCc.font = a.toString() + "px " + this.params.plotRangeFontType), this.waveCc.fillText(b, 3, a), this.waveCc.fillText(c, 3, this.height / 2);
            },
            calculatePlots: function () {
                (this.plotPoints = {}), this.calculatePlotTimeEnd();
                for (var a = [], b = -1, c = 0, d = 99999999999999, e = 0, f = 99999999999999, g = this.plotTimeEnd - this.plotTimeStart, h = 0; h < this.plotArray.length; h++) {
                    var i = this.plotArray[h];
                    if ((i.value > c && (c = i.value), i.value < d && (d = i.value), i.time >= this.plotTimeStart && i.time <= this.plotTimeEnd)) {
                        var j = Math.round((this.width * (i.time - this.plotTimeStart)) / g);
                        if ((a.push(i.value), j !== b && a.length > 0)) {
                            var k = this.avg(a);
                            k > e && (e = k), k < f && (f = k), (this.plotPoints[b] = k), (a = []);
                        }
                        b = j;
                    }
                }
                "whole" == this.params.plotNormalizeTo
                    ? ((this.plotMin = d), (this.plotMax = c))
                    : "values" == this.params.plotNormalizeTo
                    ? ((this.plotMin = this.params.plotMin), (this.plotMax = this.params.plotMax))
                    : ((this.plotMin = f), (this.plotMax = e)),
                    this.normalizeValues();
            },
            normalizeValues: function () {
                var a = {};
                if ("none" !== this.params.plotNormalizeTo) {
                    for (var b in this.plotPoints) {
                        var c = (this.plotPoints[b] - this.plotMin) / (this.plotMax - this.plotMin);
                        c > 1 ? this.params.plotRangeIgnoreOutliers || (a[b] = 1) : c < 0 ? this.params.plotRangeIgnoreOutliers || (a[b] = 0) : (a[b] = c);
                    }
                    this.plotPoints = a;
                }
            },
            loadPlotArrayFromFile: function (b, c, d) {
                void 0 === d && (d = "\t");
                var e = [],
                    f = { url: b, responseType: "text" },
                    g = a.util.ajax(f);
                g.on("load", function (a) {
                    if (200 == a.currentTarget.status) {
                        for (var b = a.currentTarget.responseText.split("\n"), f = 0; f < b.length; f++) {
                            var g = b[f].split(d);
                            2 == g.length && e.push({ time: parseFloat(g[0]), value: parseFloat(g[1]) });
                        }
                        c(e);
                    }
                });
            },
            calculatePlotTimeEnd: function () {
                void 0 !== this.params.plotTimeEnd ? (this.plotTimeEnd = this.params.plotTimeEnd) : (this.plotTimeEnd = this.plotArray[this.plotArray.length - 1].time);
            },
            avg: function (a) {
                var b = a.reduce(function (a, b) {
                    return a + b;
                });
                return b / a.length;
            },
        }),
        a.util.extend(a.Drawer.SplitWavePointPlot, a.Observer),
        (a.PeakCache = {
            init: function () {
                this.clearPeakCache();
            },
            clearPeakCache: function () {
                (this.peakCacheRanges = []), (this.peakCacheLength = -1);
            },
            addRangeToPeakCache: function (a, b, c) {
                a != this.peakCacheLength && (this.clearPeakCache(), (this.peakCacheLength = a));
                for (var d = [], e = 0; e < this.peakCacheRanges.length && this.peakCacheRanges[e] < b; ) e++;
                for (e % 2 == 0 && d.push(b); e < this.peakCacheRanges.length && this.peakCacheRanges[e] <= c; ) d.push(this.peakCacheRanges[e]), e++;
                e % 2 == 0 && d.push(c),
                    (d = d.filter(function (a, b, c) {
                        return 0 == b ? a != c[b + 1] : b == c.length - 1 ? a != c[b - 1] : a != c[b - 1] && a != c[b + 1];
                    })),
                    (this.peakCacheRanges = this.peakCacheRanges.concat(d)),
                    (this.peakCacheRanges = this.peakCacheRanges
                        .sort(function (a, b) {
                            return a - b;
                        })
                        .filter(function (a, b, c) {
                            return 0 == b ? a != c[b + 1] : b == c.length - 1 ? a != c[b - 1] : a != c[b - 1] && a != c[b + 1];
                        }));
                var f = [];
                for (e = 0; e < d.length; e += 2) f.push([d[e], d[e + 1]]);
                return f;
            },
            getCacheRanges: function () {
                for (var a = [], b = 0; b < this.peakCacheRanges.length; b += 2) a.push([this.peakCacheRanges[b], this.peakCacheRanges[b + 1]]);
                return a;
            },
        }),
        (function () {
            var b = function () {
                var b = document.querySelectorAll("wavesurfer");
                Array.prototype.forEach.call(b, function (b) {
                    var c = a.util.extend({ container: b, backend: "MediaElement", mediaControls: !0 }, b.dataset);
                    b.style.display = "block";
                    var d = a.create(c);
                    if (b.dataset.peaks) var e = JSON.parse(b.dataset.peaks);
                    d.load(b.dataset.url, e);
                });
            };
            "complete" === document.readyState ? b() : window.addEventListener("load", b);
        })(),
        a
    );
});





// REGIONS_START-----------------------------------------------------------------------------------------------------
!(function (a, b) {
    "function" == typeof define && define.amd
        ? define(["wavesurfer"], function (a) {
              return b(a);
          })
        : "object" == typeof exports
        ? (module.exports = b(require("wavesurfer.js")))
        : b(WaveSurfer);
})(this, function (a) {
    "use strict";
    (a.Regions = {
        init: function (a) {
            (this.wavesurfer = a), (this.wrapper = this.wavesurfer.drawer.wrapper), (this.list = {});
        },
        add: function (b) {
            var c = Object.create(a.Region);
            return (
                c.init(b, this.wavesurfer),
                (this.list[c.id] = c),
                c.on(
                    "remove",
                    function () {
                        delete this.list[c.id];
                    }.bind(this)
                ),
                c
            );
        },
        clear: function () {
            Object.keys(this.list).forEach(function (a) {
                this.list[a].remove();
            }, this);
        },
        enableDragSelection: function (a) {
            var b,
                c,
                d,
                e,
                f = this,
                g = a.slop || 2,
                h = 0,
                i = function (a) {
                    (a.touches && a.touches.length > 1) || a.target.childElementCount > 0 || ((e = a.targetTouches ? a.targetTouches[0].identifier : null), (b = !0), (c = f.wavesurfer.drawer.handleEvent(a, !0)), (d = null));
                };
            this.wrapper.addEventListener("mousedown", i),
                this.wrapper.addEventListener("touchstart", i),
                this.on("disable-drag-selection", function () {
                    f.wrapper.removeEventListener("touchstart", i), f.wrapper.removeEventListener("mousedown", i);
                });
            var j = function (a) {
                (a.touches && a.touches.length > 1) || ((b = !1), (h = 0), d && (d.fireEvent("update-end", a), f.wavesurfer.fireEvent("region-update-end", d, a)), (d = null));
            };
            this.wrapper.addEventListener("mouseup", j),
                this.wrapper.addEventListener("touchend", j),
                this.on("disable-drag-selection", function () {
                    f.wrapper.removeEventListener("touchend", j), f.wrapper.removeEventListener("mouseup", j);
                });
            var k = function (i) {
                if (b && !(++h <= g || (i.touches && i.touches.length > 1) || (i.targetTouches && i.targetTouches[0].identifier != e))) {
                    d || (d = f.add(a || {}));
                    var j = f.wavesurfer.getDuration(),
                        k = f.wavesurfer.drawer.handleEvent(i);
                    d.update({ start: Math.min(k * j, c * j), end: Math.max(k * j, c * j) });
                }
            };
            this.wrapper.addEventListener("mousemove", k),
                this.wrapper.addEventListener("touchmove", k),
                this.on("disable-drag-selection", function () {
                    f.wrapper.removeEventListener("touchmove", k), f.wrapper.removeEventListener("mousemove", k);
                });
        },
        disableDragSelection: function () {
            this.fireEvent("disable-drag-selection");
        },
    }),
        a.util.extend(a.Regions, a.Observer),
        (a.Region = {
            style: a.Drawer.style,
            init: function (b, c) {
                (this.wavesurfer = c),
                    (this.wrapper = c.drawer.wrapper),
                    (this.id = null == b.id ? a.util.getId() : b.id),
                    (this.start = Number(b.start) || 0),
                    (this.end = null == b.end ? this.start + (4 / this.wrapper.scrollWidth) * this.wavesurfer.getDuration() : Number(b.end)),
                    (this.resize = void 0 === b.resize || Boolean(b.resize)),
                    (this.drag = void 0 === b.drag || Boolean(b.drag)),
                    (this.loop = Boolean(b.loop)),
                    (this.color = b.color || "rgba(0, 0, 0, 0.1)"),
                    (this.data = b.data || {}),
                    (this.attributes = b.attributes || {}),
                    (this.maxLength = b.maxLength),
                    (this.minLength = b.minLength),
                    this.bindInOut(),
                    this.render(),
                    this.wavesurfer.on("zoom", this.updateRender.bind(this)),
                    this.wavesurfer.fireEvent("region-created", this);
            },
            update: function (a) {
                null != a.start && (this.start = Number(a.start)),
                    null != a.end && (this.end = Number(a.end)),
                    null != a.loop && (this.loop = Boolean(a.loop)),
                    null != a.color && (this.color = a.color),
                    null != a.data && (this.data = a.data),
                    null != a.resize && (this.resize = Boolean(a.resize)),
                    null != a.drag && (this.drag = Boolean(a.drag)),
                    null != a.maxLength && (this.maxLength = Number(a.maxLength)),
                    null != a.minLength && (this.minLength = Number(a.minLength)),
                    null != a.attributes && (this.attributes = a.attributes),
                    this.updateRender(),
                    this.fireEvent("update"),
                    this.wavesurfer.fireEvent("region-updated", this);
            },
            remove: function () {
                this.element && (this.wrapper.removeChild(this.element), (this.element = null), this.fireEvent("remove"), this.wavesurfer.un("zoom", this.updateRender.bind(this)), this.wavesurfer.fireEvent("region-removed", this));
            },
            play: function () {
                this.wavesurfer.play(this.start, this.end), this.fireEvent("play"), this.wavesurfer.fireEvent("region-play", this);
            },
            playLoop: function () {
                this.play(), this.once("out", this.playLoop.bind(this));
            },
            render: function () {
                var a = document.createElement("region");
                (a.className = "wavesurfer-region");
                for (var b in this.attributes) a.setAttribute("data-region-" + b, this.attributes[b]);
                this.wrapper.scrollWidth;
                if ((this.style(a, { position: "absolute", zIndex: 2, height: "100%", top: "0px" }), this.resize)) {
                    var c = a.appendChild(document.createElement("handle")),
                        d = a.appendChild(document.createElement("handle"));

                        c.innerHTML='<span class="circle-region"></span><span class="circle-region"></span><span class="circle-region"></span>';
                        d.innerHTML='<span class="circle-region"></span><span class="circle-region"></span><span class="circle-region"></span>';
                    (c.className = "wavesurfer-handle wavesurfer-handle-start"), (d.className = "wavesurfer-handle wavesurfer-handle-end");
                    if(secondregion==0){
                        this.style(c,{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontSize:"100%",cursor:"col-resize",position:"absolute",top:"0px",left:"-10px",height:"100%",width:"10px",background:"#44C9C5",borderRadius:"7px 0 0 7px"}),this.style(d, {display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontSize:"100%",cursor:"col-resize",position:"absolute",top:"0px",left:"100%",height:"100%",width:"10px",background:"#44C9C5",borderRadius:"0 7px 7px 0"});
                        secondregion++;
                        a.innerHTML+='<div class="regionstart" style="position:absolute;bottom:100%;right:100%;"></div><div class="regionend" style="position:absolute;bottom:100%;left:100%;"></div>';
                    }else{
                        this.style(c,{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontSize:"100%",cursor:"col-resize",position:"absolute",top:"0px",left:"-10px",height:"100%",width:"10px",background:"#F63867",borderRadius:"7px 0 0 7px"}),this.style(d, {display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontSize:"100%",cursor:"col-resize",position:"absolute",top:"0px",left:"100%",height:"100%",width:"10px",background:"#F63867",borderRadius:"0 7px 7px 0"});
                        secondregion--;
                        a.innerHTML+='<div class="regionstart" style="position:absolute;top:100%;right:100%;"></div><div class="regionend" style="position:absolute;top:100%;left:100%;"></div>';
                    }
                }
                (this.element = this.wrapper.appendChild(a)), this.updateRender(), this.bindEvents(a);
            },
            formatTime: function (a, b) {
                return (a == b ? [a] : [a, b])
                    .map(function (a) {
                        return [Math.floor((a % 3600) / 60), ("00" + Math.floor(a % 60)).slice(-2)].join(":");
                    })
                    .join("-");
            },
            updateRender: function (a) {
                var b,
                    c = this.wavesurfer.getDuration();
                if (
                    ((b = a ? Math.round(this.wavesurfer.getDuration() * a) : this.wrapper.scrollWidth),
                    this.start < 0 && ((this.start = 0), (this.end = this.end - this.start)),
                    this.end > c && ((this.end = c), (this.start = c - (this.end - this.start))),
                    null != this.minLength && (this.end = Math.max(this.start + this.minLength, this.end)),
                    null != this.maxLength && (this.end = Math.min(this.start + this.maxLength, this.end)),
                    null != this.element)
                ) {
                    var d = Math.round((this.start / c) * b),
                        e = Math.round((this.end / c) * b) - d;
                    this.style(this.element, { left: d + "px", width: e + "px", backgroundColor: this.color, cursor: this.drag ? "move" : "default" });
                    for (var f in this.attributes) this.element.setAttribute("data-region-" + f, this.attributes[f]);
                }
            },
            bindInOut: function () {
                var a = this;
                (a.firedIn = !1), (a.firedOut = !1);
                var b = function (b) {
                    !a.firedOut && a.firedIn && (a.start >= Math.round(100 * b) / 100 || a.end <= Math.round(100 * b) / 100) && ((a.firedOut = !0), (a.firedIn = !1), a.fireEvent("out"), a.wavesurfer.fireEvent("region-out", a)),
                        !a.firedIn && a.start <= b && a.end > b && ((a.firedIn = !0), (a.firedOut = !1), a.fireEvent("in"), a.wavesurfer.fireEvent("region-in", a));
                };
                this.wavesurfer.backend.on("audioprocess", b),
                    this.on("remove", function () {
                        a.wavesurfer.backend.un("audioprocess", b);
                    }),
                    this.on("out", function () {
                        a.loop && a.wavesurfer.play(a.start);
                    });
            },
            bindEvents: function () {
                var a = this;
                this.element.onmouseenter= function (b) {
                    a.fireEvent("mouseenter", b), a.wavesurfer.fireEvent("region-mouseenter", a, b);
                },
                    this.element.onmouseleave= function (b) {
                        a.fireEvent("mouseleave", b), a.wavesurfer.fireEvent("region-mouseleave", a, b);
                    },
                    this.element.onclick= function (b) {
                        b.preventDefault(), a.fireEvent("click", b), a.wavesurfer.fireEvent("region-click", a, b);
                    },
                    this.element.ondblclick=function(b){
                        b.stopPropagation(), b.preventDefault(), a.fireEvent("dblclick", b), a.wavesurfer.fireEvent("region-dblclick", a, b);
                    },

                    (this.drag || this.resize) &&
                        (function () {
                            var b,
                                c,
                                d,
                                e,
                                f = a.wavesurfer.getDuration(),
                                g = function (g) {
                                    (g.touches && g.touches.length > 1) ||
                                        ((e = g.targetTouches ? g.targetTouches[0].identifier : null),
                                        g.stopPropagation(),
                                        (d = a.wavesurfer.drawer.handleEvent(g, !0) * f),
                                        "handle" == g.target.tagName.toLowerCase() ? (c = g.target.classList.contains("wavesurfer-handle-start") ? "start" : "end") : ((b = !0), (c = !1)));
                                },
                                h = function (d) {
                                    (d.touches && d.touches.length > 1) || ((b || c) && ((b = !1), (c = !1), a.fireEvent("update-end", d), a.wavesurfer.fireEvent("region-update-end", a, d)));
                                },
                                i = function (g) {
                                    if (!(g.touches && g.touches.length > 1) && (!g.targetTouches || g.targetTouches[0].identifier == e) && (b || c)) {
                                        var h = a.wavesurfer.drawer.handleEvent(g) * f,
                                            i = h - d;
                                        (d = h), a.drag && b && a.onDrag(i), a.resize && c && a.onResize(i, c);
                                    }
                                };
                            a.element.addEventListener("mousedown", g),
                                a.element.addEventListener("touchstart", g),
                                a.wrapper.addEventListener("mousemove", i),
                                a.wrapper.addEventListener("touchmove", i),
                                document.body.addEventListener("mouseup", h),
                                document.body.addEventListener("touchend", h),
                                a.on("remove", function () {
                                    document.body.removeEventListener("mouseup", h), document.body.removeEventListener("touchend", h), a.wrapper.removeEventListener("mousemove", i), a.wrapper.removeEventListener("touchmove", i);
                                }),
                                a.wavesurfer.on("destroy", function () {
                                    document.body.removeEventListener("mouseup", h), document.body.removeEventListener("touchend", h);
                                });
                        })();
            },
            onDrag: function (a) {
                var b = this.wavesurfer.getDuration();
                this.end + a > b || this.start + a < 0 || this.update({ start: this.start + a, end: this.end + a });
            },
            onResize: function (a, b) {
                "start" == b ? this.update({ start: Math.min(this.start + a, this.end), end: Math.max(this.start + a, this.end) }) : this.update({ start: Math.min(this.end + a, this.start), end: Math.max(this.end + a, this.start) });
            },
        }),
        a.util.extend(a.Region, a.Observer),
        (a.initRegions = function () {
            this.regions || ((this.regions = Object.create(a.Regions)), this.regions.init(this));
        }),
        (a.addRegion = function (a) {
            return this.initRegions(), this.regions.add(a);
        }),
        (a.clearRegions = function () {
            this.regions && this.regions.clear();
        }),
        (a.enableDragSelection = function (a) {
            this.initRegions(), this.regions.enableDragSelection(a);
        }),
        (a.disableDragSelection = function () {
            this.regions.disableDragSelection();
        });
});