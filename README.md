# hot-data

Data only — there is no app here.

`state.json` is the hot board's running history, rewritten every half hour by
the `hot snapshot` workflow on `master`. The site reads it over
`raw.githubusercontent.com`; nothing builds from this branch, which is why
`vercel.json` turns deployments off for it.

The branch is kept at a single commit on purpose: the workflow amends and
force-pushes, because a commit every thirty minutes is seventeen thousand a
year and the history worth keeping (`firstSeen`, `polls`, `peakSources`)
lives inside the file.
