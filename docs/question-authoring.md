# Question Authoring

C·Path formal exercises are original teaching content. Do not copy third-party statements, examples or solutions without a clear redistribution basis.

Each question must provide a stable `orig-` ID, chapter, topics, difficulty, statement, input and output formats, constraints, two meaningful examples, three progressive hints, an original reference solution and at least five meaningful test cases.

Validate the reference solution with an independent GCC or Clang run. Keep tests varied: include zero, negative values, boundaries and representative normal cases where the topic allows them. Run `npm run audit:formal` and `npm run validate:originals` before opening a pull request.

Use `sourceKind: original`, `contentStatus: ready-for-local-judge`, `reviewStatus: reviewed`, and a provenance path under the authored data file. Source archive records must remain `sourceKind: pat-import` and must not be relabeled as official or complete exercises.
