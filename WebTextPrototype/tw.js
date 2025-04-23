
/**
 * Mount path of fonts
 */
var TWFontMountRoot = "/";

/**
 * The module
 */
var Module = {
    _runTimeInitBegin: null,
    preInit : function() {
        Module._runTimeInitBegin = performance.now(); 
    },

    preRun : [function() {
        TWFontLib.preloadFontFiles();
    }],

    postRun : [],

    print : function(text) {
        console.log(text);
    },

    printErr : function(text) {
        console.error(text);
    },

    onAbort : function(what) {
        alert(what);
    },

    // NEXU: fix initialize problem, when logReadFiles set to true
    // it will cause execution fail of the output: js function err() redefined and conflict with FS return code
    // Which seems to be an emscripten bug, change to false for now
    logReadFiles : false,

    onRuntimeInitialized : function() {
        TWLib.ensureLibraryInititlaized();
        TWFontLib.readPreloadedFontFaces();
        if (TWLib['onRuntimeInitialized'])
            TWLib.onRuntimeInitialized();    

        var runTimeInitEnd = performance.now();
        console.log("Runtime init: " + Math.round(runTimeInitEnd - Module._runTimeInitBegin) + " ms");

        TWFontLib.asyncLoadFonts();
    },
};

/**
 * Typesetting Web Library
 */
var TWLib = {
    _libraryInitialized : false,

    onRuntimeInitialized : null,

    /**
     * ensure the Typesetting Web Library initialized
     * @returns {boolean} initalization success or failed.
     */
    ensureLibraryInititlaized : function() {
        if (TWLib._libraryInitialized)
            return true;
        TWLib._libraryInitialized = Module._tw_initialize();
        return TWLib._libraryInitialized;
    },

    /**
     * finalize the Typesetting Web library
     */
    finalizeLibrary : function() {
        return Module._tw_finalize();
    },
};

/**
 * TWFontLib
 */
var TWFontLib = {

    allFaces: [],

    _preloadFontFiles : [
    	"ACaslonPro-Regular.otf"
    ],

    _asyncLoadFontFiles : [
    	"MyriadPro-Regular.otf",
        "MyriadPro-Bold.otf",
        "MyriadPro-BoldCond.otf",
        "MyriadPro-BoldCondIt.otf",
        "MyriadPro-BoldIt.otf",
        "MyriadPro-Cond.otf",
        "MyriadPro-CondIt.otf",
        "MyriadPro-It.otf",
        "MyriadPro-Semibold.otf",
        "MyriadPro-SemiboldIt.otf",
        "AdobeSongStd-Light.otf",
        "Athelas.ttc",
    ],

    _currentLoadingFontFiles: null,

    _getFontFileURL: function(file) {
        // return "./fonts/" + file + "?r=" + Math.random().toString(36).substring(7);
        return "./fonts/" + file;
    },

    /**
     * callback when starting to load fonts
     */
    onFontFilesLoadBegin: function() {},

    /**
     * callback on font is loaded
     * @param {string} url of the font file
     * @param {string} filename font file name in fs
     */
    onFontFileLoaded: function(url, filename) {},
    
    /**
     * callback on font file loading failed.
     */
    onFontFileNotLoaded: function(url, filename) {},

    /**
     * callback when finishing to load fonts
     */
    onFontFilesLoadEnd: function() {},

    /**
     * preload font files into Emscripten FS
     */
    preloadFontFiles: function() {
        TWFontLib._preloadFontFiles.forEach(function(file) {
            Module.FS_createPreloadedFile(TWFontMountRoot, file, TWFontLib._getFontFileURL(file), true, false);
        });
    },

    /**
     * read the preloaded fonts files
     */
    readPreloadedFontFaces: function () {
        TWFontLib._preloadFontFiles.forEach(function(file) {
            TWFontLib._readFaces(TWFontMountRoot + file);
        });
    },

    /**
     * load fonts asynchronously
     */
    asyncLoadFonts: function() {
        TWFontLib._currentLoadingFontFiles = new Set(TWFontLib._asyncLoadFontFiles);
        if (TWFontLib['onFontFilesLoadBegin'])
            TWFontLib.onFontFilesLoadBegin();

        TWFontLib._asyncLoadFontFiles.forEach(function(file) {
            TWFontLib.asyncLoadFont(TWFontLib._getFontFileURL(file), file).then(([url, filename]) => {
                if (TWFontLib['onFontFileLoaded']) TWFontLib.onFontFileLoaded(url, filename);
                TWFontLib._removeFromLoadingList(filename);
            }, ([url, filename]) => {
                if (TWFontLib['onFontFileNotLoaded']) TWFontLib.onFontFileNotLoaded(url, filename);
                TWFontLib._removeFromLoadingList(filename);
            });
        });
    },

    /**
     * load font file asynchronously
     * @param {string} font file url
     * @param {string} filename file name in FS
     */
    asyncLoadFont: function(url, filename) {
        return new Promise((resolve, reject) => {
            // Emscripten v1.38.40: 07/24/2019 API change Module['readAsync'] moved to readAsync() https://emscripten.org/docs/introducing_emscripten/release_notes.html?highlight=wasm
            readAsync(url, function(arrayBuffer) {
                var data = new Uint8Array(arrayBuffer);
                if (TWFontLib._writeFontDataAndCreateFaces(data, filename))
                    resolve([url, filename]);
                else 
                    reject([url, filename]);
            }, function(error) {
                reject([url, filename]);
            }); 
        });
    },

    /**
     * upload the font file to Emscripten FS
     * @param {File} file object
     * @return {Promise} promise
     */
    uploadFontFile : function (file) {
        var reader = new FileReader();
        return new Promise((resolve, reject) => {
		    reader.onload = function () {
			    var filename = file.name;
                var data = new Uint8Array(reader.result);
                if (TWFontLib._writeFontDataAndCreateFaces(data, filename))
                    resolve(TWFontMountRoot + filename);
                else
                    reject(filename);               
            };
            reader.onerror = function () {
                reader.abort();
                reject(file.name);
            };
            
		    reader.readAsArrayBuffer(file);
        });
    },

    /**
     * remove the file from current loading list
     */
    _removeFromLoadingList: function(filename) {
        if (TWFontLib._currentLoadingFontFiles.has(filename))
            TWFontLib._currentLoadingFontFiles.delete(filename);
        if (TWFontLib._currentLoadingFontFiles.size == 0) {
            if (TWFontLib['onFontFilesLoadEnd'])
                TWFontLib.onFontFilesLoadEnd();
        }          
    },

    /**
     * write the font data to Emscripten FS and create faces
     * @param {Uint8Array} data the font data
     * @param {string} filename the font file name 
     */
    _writeFontDataAndCreateFaces: function(data, filename) {
        try {
            Module.FS_createDataFile(TWFontMountRoot, filename, data, true, false, false);
            if (!TWFontLib._readFaces(TWFontMountRoot + filename)) {
                Module.FS_unlink(TWFontMountRoot + filename);
                return false;
            }
            return true;
        } catch(error) {
            return false;
        }
    },

    /**
     * find font by ps name
     * @param {string} postscriptName
     * @returns {TWFontFace} font face, null if not found
     */
    find: function(postscriptName) {
        for (var i = 0; i < TWFontLib.allFaces.length; ++ i) {
            var face = TWFontLib.allFaces[i];
            if (face.postscriptName === postscriptName)
                return face;
        }
        return null;
    },

    /**
     * read all faces in the font file
     * @param {string} path path of font file in Emscripten FS
     * @return {boolean} read ok or failed.
     */
    _readFaces: function(path) {
        var count = TWFontLib.countFaces(path);
        if (count === 0)
            return false;
        for (var index = 0; index < count; ++ index) 
            TWFontLib.allFaces.push(new TWFontFace(path, index));
        return true;
    },

    /**
     * create face key by file path and face index
     * @returns {number} the face key
     */
    createFaceKey : function(path, index) {
        return Module.ccall('tw_create_face_key', 'number', [ 'string', 'number' ], [ path, index ]);
    },

    /**
     * @param {string} font file path
     * @return {number} number of faces in the font file (ttc)
     */
    countFaces : function(path) {
        return Module.ccall('tw_font_count_faces', 'number', [ 'string' ], [ path ]);
    },

    /**
     * validate the font file
     * @param {string} font file path
     * @return {boolean} font file valid or not
     */
    validateFontFile : function(path) {
        return Module.ccall('tw_font_validate', 'boolean', [ 'string' ], [ path ]);
    },
};

/**
 * TWFontFace
 */
class TWFontFace {
    constructor(path, index) {
        this.path = path;
        this.index = index;
        this.key = TWFontLib.createFaceKey(path, index);

        // TODO: more attibutes
        var _face = Module.ccall('tw_create_face', 'number', [ 'string', 'number' ], [ path, index ]);
        this.postscriptName = Module.ccall('tw_face_get_psname', 'string', [ 'number' ], [ _face ]);
        Module._tw_destroy_face(_face);
    }
};

/**
 * TWTextStory
 */
class TWTextStory {
    constructor(text) {
        this._st =
            Module.ccall('tw_create_story', 'number', [ 'string' ], [ text ]);
    }

    destroy() {
        Module._tw_destroy_story(this._st);
        this._st = null;
    }

    /**
     * set font in range. Note the the range is in [from, to) form.
     * @param {number} from start index in the text
     * @param {number} to end index in the text
     * @param {TWCharFeatures} charFeats character features
     */
    setCharFeaturs(from, to, charFeats) {
        return Module._tw_story_set_char_features(this._st, from, to,
                                                  charFeats.native());
    }

    /**
     * Dump the text story
     */
    dump() {
        return Module._tw_dump_story(this._st);
    }

    /**
     * compose the text story
     * @param {number} width
     * @param {number} height
     * @returns {TWGlyphs} the glyphs, return null if failed
     */
    compose(width, height) {
        var glyphs = Module._tw_compose(this._st, width, height);
        if (glyphs == 0)
            return null;
        return new TWGlyphs(glyphs);
    }
}

/**
 * Character Features
 */
class TWCharFeatures {
    constructor() {
        this._feats = Module._tw_create_char_features();
    }

    destroy() {
        Module._tw_destroy_char_features(this._feats);
        this._feats = null;
    }

    native() {
        return this._feats;
    }

    /**
     * set font in range. Note the the range is in [from, to) form.
     * @param {number} key font key
     * @param {number} size font size
     */
    setFont(key, size) {
        return Module._tw_char_features_set_font(this._feats, key, size);
    }

    /**
     * turn on or off ligature
     */
    setLigature(state) {
        return Module._tw_char_features_set_ligature(this._feats, state);
    }

    /**
     * turn on or off auto kerning
     */
    setAutoKerning(state) {
        return Module._tw_char_features_set_auto_kern(this._feats, state);
    }

    /**
     * set tracking
     * @param {number} tracking
     */
    setTracking(tracking) {
        return Module._tw_char_features_set_tracking(this._feats, tracking);
    }
}

/**
 * TWGlyphs
 */
class TWGlyphs {
    constructor(glyphs) {
        this._glyphs = glyphs;
    }

    destroy() {
        Module._tw_destroy_glyphs(this._glyphs);
        this._glyphs = null;
    }

    /**
     * dump the glyphs
     */
    dump() {
        Module._tw_dump_glyphs(this._glyphs);
    }

    /**
     * render the glyphs to svg path
     * @returns {string} svg path
     */
    render_as_svg() {
        return Module.ccall('tw_render_glyphs_as_svg', 'string', [ 'number' ], [ this._glyphs ]);
    }
}

/**
 * TWTrace
 */
var TWTrace = {
    _latencies: [],
    _latencySum: 0,
    latencyResetThreshold: 500, // in ms

    pushContext: function (name) {
        Module.ccall('tw_trace_push_context', null, [ 'string' ], [ name ]);
    },

    popContext: function() {
        Module._tw_trace_pop_context();
    },

    frameStart: function() {
        Module._tw_trace_frame_start();
    },

    frameEnd: function() {
        Module._tw_trace_frame_end();
    },

    reportMemory: function() {
        Module._tw_trace_report_memory();
    },

    recordLatency: function(start, end) {
        if (TWTrace._latencies.length > 0) {
            var last = TWTrace._latencies[TWTrace._latencies.length - 1];
            var d = start - last.start;
            if (d >= TWTrace.latencyResetThreshold) {
                TWTrace._latencies = [];
                TWTrace._latencySum = 0;
            }
        }
        TWTrace._latencies.push({start: start, end: end});
        TWTrace._latencySum += (end - start);
    },

    lastLatency: function() {
        if (TWTrace._latencies.length > 0) {
            var last = TWTrace._latencies[TWTrace._latencies.length - 1];
            return Math.round(last.end - last.start);
        }
        return 0;
    },

    fps: function() {
        if (TWTrace._latencies.length == 0)
            return 0;
        return Math.round(1000/ (TWTrace._latencySum / TWTrace._latencies.length));
    }

};

window.onbeforeunload = function() {
    TWLib.finalizeLibrary();
};
