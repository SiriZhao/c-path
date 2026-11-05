# Architecture

C·Path keeps the learning shell deliberately small:

- `src/main.tsx` owns the hash router and the dashboard, roadmap, bank, help and practice views.
- `src/data/` contains validated JSON data. `formalQuestions` contains the 48 original exercises; `sourceArchive` contains the 38 imported C_PAT records.
- `src/lib/storage.ts` owns LocalStorage v2 migration, learning events, progress states and export/import.
- `src/lib/judge.ts` exposes the stable judge boundary. `BrowserCompilerAdapter` lazy-loads the static Sandrun entry and leaves C execution in a sandboxed Worker.
- `src/lib/comparator.ts` compares real stdout with configured local tests.
- `public/sandrun/` contains the untransformed runtime modules required by the Worker; the xcc runtime is loaded lazily from its pinned CDN assets.

GitHub Pages hosts the React bundle only. There is no trusted server compiler and no hidden server-side judge. This boundary is part of the product contract.
