# FAQ

## Is C·Path a server-side online judge?

No. C·Path compiles and runs short programs in a sandboxed browser Worker. Sample and local-test results come from real stdout comparison. Static hosting cannot provide hidden tests or anti-cheating guarantees.

## Why is the first run slower?

The C runtime is lazy-loaded. The first run downloads and initializes the xcc WebAssembly runtime; later runs use the browser cache.

## Where are my drafts and progress stored?

Drafts, progress, favorites, review markers and recent activity are stored in LocalStorage in the current browser. Export the progress file before clearing site data. There is no account or cross-device sync.

## Where do I enter `scanf` input?

Put the input in the custom input box, for example `3 5`. The program receives that text through stdin.

## Why are source archive records separate?

The 38 C_PAT records preserve local paths and titles, but their original statements, tests and redistribution basis are not fully verified. They remain available as a separate archive and are excluded from formal practice counts.

## What C features are supported?

Short C99/C11 teaching programs using stdio, variables, conditions, loops, arrays, functions and strings work best. Complex GCC extensions, very large programs and parts of the standard library may not be compatible.

## How do I report a bug?

Include the page URL, browser and device, reproduction steps, expected and actual behavior, and whether the issue reproduces in a private window. For a question issue, include its ID and input.
