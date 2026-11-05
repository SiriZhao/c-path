# Third-party notices

Phase 5 uses `@browserrun/sandrun@0.4.0` under the MIT License.

Sandrun's C default runtime loads xcc-wasm (MIT) and `browser_wasi_shim` (MIT OR Apache-2.0) at runtime. The package also documents its runtime CDN sources and licenses in its upstream notice file:

- https://github.com/browserrun/sandrun
- https://github.com/tyfkda/xcc
- https://github.com/bjorn3/browser_wasi_shim

The C runtime is loaded on first use and cached by the browser. C·Path does not call a remote compilation API and does not send source code to a server-side compiler.
