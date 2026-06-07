// WASM download progress bar.
//
// This replaces Emscripten's built-in .wasm fetch with our own streaming
// download so we can track bytes received vs Content-Length and show a
// progress bar. After download, we call WebAssembly.instantiate() ourselves
// and hand the result back to Emscripten via successCallback.
//
// If this file is missing, Main.js detects that createWasmProgressLoader is
// undefined and passes no instantiateWasm option — Emscripten then falls back
// to its default .wasm loading (no progress bar, but everything still works).
function createWasmProgressLoader() {
    return function(imports, successCallback) {
        const wasmUrl = 'Glyph.wasm';
        const progressBar = document.getElementById('progressbar');
        const progressParent = document.getElementById('progressbar_parent');
        progressParent.style.display = 'block';
        progressBar.style.background = '#007fff';
        progressBar.style.fontFamily = 'GLYPH_BODYTEXT_FACE';
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 0.2s';

        fetch(wasmUrl).then(function(response) {
            const contentLength = response.headers.get('Content-Length');
            if (!contentLength || !response.body) {
                progressBar.textContent = 'Loading WASM...';
                progressBar.style.width = '100%';
                return response.arrayBuffer();
            }
            const total = parseInt(contentLength, 10);
            let loaded = 0;
            const reader = response.body.getReader();
            const chunks = [];

            function pump() {
                return reader.read().then(function(result) {
                    if (result.done) {
                        const combined = new Uint8Array(loaded);
                        let offset = 0;
                        for (const chunk of chunks) {
                            combined.set(chunk, offset);
                            offset += chunk.length;
                        }
                        return combined.buffer;
                    }
                    chunks.push(result.value);
                    loaded += result.value.length;
                    const pct = Math.min(100, Math.round((loaded / total) * 100));
                    progressBar.style.width = pct + '%';
                    progressBar.textContent = 'Loading WASM... ' + pct + '%';
                    return pump();
                });
            }
            return pump();
        }).then(function(buf) {
            progressBar.style.width = '100%';
            progressBar.textContent = 'Compiling...';
            return WebAssembly.instantiate(buf, imports);
        }).then(function(output) {
            progressParent.style.display = 'none';
            successCallback(output.instance, output.module);
        }).catch(function(err) {
            progressBar.style.background = '#f44336';
            progressBar.textContent = 'Failed to load WASM: ' + err.message;
            console.error('WASM load error:', err);
        });

        return {}; // indicates async instantiation
    };
}
