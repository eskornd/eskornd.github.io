function toString(obj) {
    if (typeof obj == 'object') {
        return (JSON && JSON.stringify ? JSON.stringify(obj, null, '    ') : obj);
    } else {
        return obj;
    }
}

var current_file = null;
var fetching_count = 0;
var tiffHandle = 0;

function fetchBinary(url, outFileName, onFetchedCallback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.open("GET", url, true);
    xhr.onload = function (xhrEvent) {
        var arrayBuffer = xhr.response;

        // if you want to access the bytes:
        var byteArray = new Uint8Array(arrayBuffer);
        Module['FS_createDataFile']("/", outFileName, byteArray, true, true);
        console.log('URL fetched: ' + url + ' -> ' + '/' + outFileName + ' ' + byteArray.length + ' bytes');
        onFetchedCallback(url, true);
    };
    xhr.send();
    ++fetching_count;
}

function onFetched(fileName, isOK) {
    --fetching_count;
    console.log('onFetched ' + fileName + ' ' + isOK + ' fetching count:' + fetching_count);
    if (0 == fetching_count) {
        current_file = 'colorchecker_eu_uncoated.tif';
        reloadTiff();
        reloadCanvas();
    }
}

// mount the file object into the folder
function mountFile(fileObject, folder, onFileMounted) {
    var reader = new FileReader();
    reader.onload = function () {
        var filename = fileObject.name;
        if (folder != null)
            filename = folder + '/' + filename;

        var data = new Uint8Array(reader.result);
        try {
            FS.createDataFile('/', filename, data, true /*read*/ , false /*write*/ , false /*own*/ );
        } catch (err) {
            console.log('Exception in FS.createDataFile(): ' + err.message);
        }

        console.log('file onload(): ' + filename);
        var stat = FS.stat(filename);
        console.log(stat);
        if (stat.size == 0) {
            alert('Empty file: ' + filename + ' ' + stat.size + ' bytes?');
        }

        onFileMounted(filename);
    }
    reader.readAsArrayBuffer(fileObject);
}

// Module initialization
var Module = {
    _runTimeInitBegin: null,
    preInit: function () {
        Module._runTimeInitBegin = performance.now();
        console.log('Module.preInit');
    },

    preRun: [function () {
        console.log('Module.preRun');
    }],

    postRun: [],

    print: function (text) {
        console.log(text);
    },

    printErr: function (text) {
        console.error(text);
    },

    onAbort: function (what) {
        alert('onAbort' + what);
    },

    // NEXU: fix initialize problem, when logReadFiles set to true
    // it will cause execution fail of the output: js function err() redefined and conflict with FS return code
    // Which seems to be an emscripten bug, change to false for now
    logReadFiles: false,

    onRuntimeInitialized: function () {
        console.log('Module.onRuntimeInitialized()');
        FS.mkdir("/cmyk");
        FS.mkdir("/rgb");

        fetchBinary('resources/bonsai.zip', 'bonsai.zip', onFetched);
        fetchBinary('resources/EuroscaleUncoated.icc', 'cmyk/EuroscaleUncoated.icc', onFetched);
        fetchBinary('resources/EuroscaleCoated.icc', 'cmyk/EuroscaleCoated.icc', onFetched);
        fetchBinary('resources/isocoated_v2_eci.icc', 'cmyk/isocoated_v2_eci.icc', onFetched);

        fetchBinary('resources/sRGB Profile.icc', 'rgb/sRGB Profile.icc', onFetched);
        fetchBinary('resources/AdobeRGB1998.icc', 'rgb/AdobeRGB1998.icc', onFetched);
        fetchBinary('resources/ProPhoto.icm', 'rgb/ProPhoto.icc', onFetched);
        fetchBinary('resources/redtruck_GBR.icc', 'rgb/redtruck_GBR.icc', onFetched);

        fetchBinary('resources/colorchecker_eu_uncoated.tif', 'colorchecker_eu_uncoated.tif', onFetched);
    },
};

function selectOption(elem, value) {
    var options = elem.options;
    for (var i = 0; i < options.length; ++i) {
        if (options[i].value == value) {
            elem.selectedIndex = i;
            return;
        }
    }
    elem.selectedIndex = 0;
}

var progressStart = null;
function beginProgressing() {
    progressStart = Date.now();
    //document.getElementById("preview_overlay").style.display = "block";
    $('#progress').html(`<font color="red">Processing ...</font>`);
}

function endProgressing() {
    var millis = Date.now() - progressStart;
    //document.getElementById("preview_overlay").style.display = "none";
    $('#progress').html(`Done (${(millis/1000).toFixed(1)}s)`);
}

function fillGradient(divID) {
    var canvas = document.getElementById(divID);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var w = 1023;
    var h = 700;
    var imgData = ctx.createImageData(w, h);
    var i = 0;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            imgData.data[i + 0] = 255 * (x / w);
            imgData.data[i + 1] = 0;
            imgData.data[i + 2] = 0;
            imgData.data[i + 3] = 255 * (y / h);
            i += 4;
        }
    }

    ctx.putImageData(imgData, 0, 0);
}


function fillCanvas(rgba, width, height) {
    var divID = 'preview';
    var canvas = document.getElementById(divID);
    canvas.width = canvas.width; // clear canvas
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    var w = width;
    var h = height;
    var imgData = ctx.createImageData(w, h);
    var i = 0;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            imgData.data[i + 0] = rgba[i + 0];
            imgData.data[i + 1] = rgba[i + 1];
            imgData.data[i + 2] = rgba[i + 2];
            imgData.data[i + 3] = rgba[i + 3];
            i += 4;
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

function reloadTiff() {
    Module.rb_close_tiff(tiffHandle);

    tiffHandle = Module.rb_open_tiff(current_file);
    var width = Module.rb_get_width(tiffHandle);
    var height = Module.rb_get_height(tiffHandle);
    var channels = Module.rb_get_channels(tiffHandle);
    console.log('Tiff loaded: ' + width + 'x' + height + ' (' + channels + ' inks)');

    clearSepeartions();
    refreshCMYKProfileList();
    refreshRGBProfileList();
}

function onCanvasMouseMove(x, y) {
    // validate x, y, exclude out of bound values
    var width = Module.rb_get_width(tiffHandle);
    var height = Module.rb_get_height(tiffHandle);
    if (x < 0 || x > width)
        return;

    if (y < 0 || y >= height)
        return;

    var mr = Module.rb_measure(tiffHandle, x, y);
    $("#colorpatch_rgb").html(`<div>r: ${mr.rgb.r}</div><div>g: ${mr.rgb.g}</div><div>b: ${mr.rgb.b}</div>`);
    $("#colorpatch_lab").html(`<div>L: ${mr.lab.L.toFixed(1)}</div><div>a: ${mr.lab.a.toFixed(1)}</div><div>b: ${mr.lab.b.toFixed(1)}</div>`);
    var deltaE_html = '' + mr.deltaE.toFixed(1) + '';
    if (mr.deltaE < 2.0) {
        deltaE_html = '<span>' + mr.deltaE.toFixed(1) + '</span>';
    } else if (mr.deltaE < 10.0) {
        deltaE_html = '<span style="color: #ff9900;" >' + mr.deltaE.toFixed(1) + ' out-of-gamut </span>';
    } else {
        deltaE_html = '<span style="color: #cc3300;" >' + mr.deltaE.toFixed(1) + ' out-of-gamut </span>';
    }

    $("#colorpatch_deltaE").html('deltaE: ' + deltaE_html);
    $("#colorpatch_xy").html('x: ' + x + ' y:' + y);
    // Clear the old !important css
    $("#colorpatch").css('background-color', '');
    $("#colorpatch").css('background-color', 'rgb(' + mr.rgb.r + ',' + mr.rgb.g + ',' + mr.rgb.b + ')');
    $("#colorpatch").css('color', '');
    $("#colorpatch").css('color', 'rgb(' + mr.rgb.r + ',' + mr.rgb.g + ',' + mr.rgb.b + ')');

    // refresh tints
    var inks_c = Module.rb_get_channels(tiffHandle);
    for (var i = 0; i < inks_c; ++i) {
        var ink_val = document.getElementById(`inkval_${i}`);
        ink_val.innerHTML = (mr.tints.get(i) * 100).toFixed(1).toString() + '%';
    }
}

function reloadCanvas() {
    beginProgressing();

    setTimeout(function () {
        reloadCanvasImp();
        endProgressing();
    });
}

function reloadCanvasImp() {
    // get the icc
    var iccFile = $("#cmyk_icc :selected").val();
    var cmyk_icc = 0;
    var rgb_icc = 0;
    if (iccFile != "")
        cmyk_icc = Module.rb_open_icc(iccFile);
    iccFile = $("#rgb_icc :selected").val();
    if (iccFile != "")
        rgb_icc = Module.rb_open_icc(iccFile);

    // get the seperations
    var seps = new Module.VectorInt();
    var inks_c = Module.rb_get_channels(tiffHandle);
    for (var i = 0; i < inks_c; ++i) {
        var ink_ck = document.getElementById(`inkid_${i}`);
        if (ink_ck == null || ink_ck.checked)
            seps.push_back(1);
        else
            seps.push_back(0);
    }

    var width = Module.rb_get_width(tiffHandle);
    var height = Module.rb_get_height(tiffHandle);
    var channels = Module.rb_get_channels(tiffHandle);
    console.log('Tiff loaded: ' + width + 'x' + height + ' (' + channels + ' inks)');

    var names = Module.rb_get_spot_names(tiffHandle);
    console.log('Number of spot channels: ' + names.size());
    for (var i = 0; i < names.size(); ++i) {
        console.log('Spot ink name: ' + names.get(i));
    }

    console.log('before Module.rb_preview_tiff()');
    var startTime = new Date();
    var rgbaU8Array = Module.rb_preview_tiff(tiffHandle, cmyk_icc, rgb_icc, seps);
    var endTime = new Date();
    console.log('after Module.rb_preview_tiff(), took ' + (endTime - startTime) + ' milliseconds');


    initSeperations();
    updateBPCToggle();

    console.log('rgbaU8Array len: ' + rgbaU8Array.length);
    fillCanvas(rgbaU8Array, width, height);

    //Module.rb_close_tiff(tiffHandle);
    Module.rb_close_icc(cmyk_icc);
    Module.rb_close_icc(rgb_icc);
}

function clearSepeartions() {
    $("#sep").empty();
}

function initSeperations() {
    if ($('#sep').checkEmpty()) { // empty
        var inks = Module.rb_get_inks(tiffHandle);
        for (var i = 0; i < inks.size(); ++i)
            $('#sep').append(createSeperationHtml(inks, i));
    }
}

function updateBPCToggle() {
    var bpc = Module.rb_get_bpc(tiffHandle);
    console.log('Module.rb_get_bpc(tiffHandle) returns ' + bpc);
    $("#bpc").prop("checked", bpc);
}

function createSeperationHtml(inks, ink_index) {
    var ink = inks.get(ink_index);
    //console.log(toString(ink));

    return '<div style="display:flex;justify-content:space-between;">' +
        `<div><input type="checkbox" id="inkid_${ink_index}" onclick="reloadCanvas()" checked>${ink.name}</div>` +
        `<div style="display:flex">` +
        `<div id="inkval_${ink_index}">N/A</div>` +
        `<div id="inkrgb_${ink_index}" style="background-color:rgb(${ink.rgb.r},${ink.rgb.g},${ink.rgb.b});width:16px;height:16px;padding: 2px"></div>` +
        `</div>` +
        `</div>`;
}

function updateSeperationsPreview() {
    var inks = Module.rb_get_inks(tiffHandle);
    for (var i = 0; i < inks.size(); ++i) {
        var ink = inks.get(i);
        $(`#inkrgb_${i}`).css('color', `rgb(${ink.rgb.r},${ink.rgb.g},${ink.rgb.b})`);
    }
}

function refreshCMYKProfileList() {
    $('#cmyk_icc').empty();
    $('#cmyk_icc').append(`<option value="">Document Profile (${Module.rb_get_document_profile_name(tiffHandle)})</option>`);
    $('#cmyk_icc').append(`<option disabled>──────────────────────</option>`);
    FS.readdir('cmyk').forEach(function (path) {
        if (path.endsWith('.icc') || path.endsWith('.icm')) {
            var file = "cmyk/" + path;
            $('#cmyk_icc').append(`<option value="${file}">${Module.rb_icc_profile_name(file)}</option>`);
        }
    });
}

function useCMYKProfile(filename) {
    selectOption(document.getElementById('cmyk_icc'), filename);
    reloadCanvas();
}

function refreshRGBProfileList() {
    $('#rgb_icc').empty();
    FS.readdir('rgb').forEach(function (path) {
        if (path.endsWith('.icc') || path.endsWith('.icm')) {
            var file = "rgb/" + path;
            $('#rgb_icc').append(`<option value="${file}">${Module.rb_icc_profile_name(file)}</option>`);
        }
    });

    selectOption(document.getElementById('rgb_icc'), 'rgb/sRGB Profile.icc');
}

function useRGBProfile(filename) {
    selectOption(document.getElementById('rgb_icc'), filename);
    reloadCanvas();
}

function init_dropzone(id) {
    $(id).on('dragenter', function (e) {
        e.preventDefault();
        $(this).css("background", "#AFAFFF");
    });
    $(id).on('dragleave', function (e) {
        e.preventDefault();
        $(this).css("background", "#FFFFFF");
    });
    $(id).on('dragover', function (e) {
        e.preventDefault();
        $(this).css("background", "#AFAFFF");
    });
}

function handle_file_drop(e, folder, file_handler) {
    e.preventDefault();
    if (e.originalEvent.dataTransfer.files.length) {
        console.log(toString(e.originalEvent));
        var files = e.originalEvent.dataTransfer.files;
        console.log('dropped ' + files.length + ' files.');
        var file = files.item(0);

        //clearUI();
        // Async, when file mounted -> onFileMouted
        mountFile(file, folder, file_handler);
    }
}

function init_drop_canvas(id) {
    $(id).on('dragenter', function (e) {
        e.preventDefault();
        $(this).css("border", "3px dashed red;");
    });
    $(id).on('dragleave', function (e) {
        e.preventDefault();
        $(this).css("border", "");
    });
    $(id).on('dragover', function (e) {
        e.preventDefault();
        $(this).css("border", "3px dashed red");
    });
}

$(function () {
    init_drop_canvas("#preview");
    init_dropzone("#cmyk_icc_drop");
    init_dropzone('#rgb_icc_drop');

    $("#preview").on('drop', function (e) {
        handle_file_drop(e, null, function (filename) {
            current_file = filename;
            reloadTiff();
            reloadCanvas();
        });
        $(this).css("border", "");
    });

    $("#cmyk_icc_drop").on('drop', function (e) {
        handle_file_drop(e, "cmyk", function (filename) {
            refreshCMYKProfileList();
            useCMYKProfile(filename);
        });
        $(this).css("background", "#FFFFFF");
    });

    $("#rgb_icc_drop").on('drop', function (e) {
        handle_file_drop(e, "rgb", function (filename) {
            refreshRGBProfileList();
            useRGBProfile(filename);
        });
        $(this).css("background", "#FFFFFF");
    });

    $("#cmyk_icc").on('change', function (e) {
        reloadCanvas();
        updateSeperationsPreview();
    });

    $("#rgb_icc").on('change', function (e) {
        reloadCanvas();
        updateSeperationsPreview();
    });

    var canvas = document.getElementById('preview');
    canvas.addEventListener('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        onCanvasMouseMove(x, y);
    });

    $('#bpc').change(function () {
        Module.rb_set_bpc(tiffHandle, this.checked);
        reloadCanvas();
    });
  
  $("#toggle").click(function(){
                     var isOpened = $("#colorpanel").dialog('isOpen') == true;
                     if ( isOpened )
                     {
                        $("#colorpanel").dialog('close');
                     
                     } else {
                        $("#colorpanel").dialog('open');
                     }
                    });
  
});

(function ($) {
    jQuery.fn.checkEmpty = function () {
        return !$.trim(this.html()).length;
    };
}(jQuery));
