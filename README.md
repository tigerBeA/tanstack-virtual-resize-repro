# TanStack Virtual: previous row resize breaks end anchoring

[Open in StackBlitz](https://stackblitz.com/github/tigerBeA/tanstack-virtual-resize-repro/tree/4ddae457fb773332b0c395938ac3c5eb74b1d117)

A standalone reproduction for [TanStack/virtual#1265](https://github.com/TanStack/virtual/pull/1265), using the published `@tanstack/react-virtual@3.14.10` package (`@tanstack/virtual-core@3.17.8`). No application data, mocked observers, or SDK patches are needed.

## Reproduce

1. Open the preview and wait for **Actual bottom gap: 0 px**.
2. Click **Grow previous message by 24 px** once.
3. The bottom gap becomes **24 px** and remains there. The expected gap is **0 px**.
4. Reload to reset.

The eight-row list uses `anchorTo: 'end'`, `directDomUpdates: true`, and `useFlushSync: false`. The final row remains 300 px tall, matching the viewport. Only the preceding row grows. Native CSS scroll anchoring is disabled to isolate the virtualizer's own scroll adjustment.

The displayed values come from the actual scroll element. A separate diagnostics component observes its scroll and size changes without rerendering the list.

## Run locally

```sh
npm ci
npm run dev
```

The fixture is adapted from the regression test in the linked PR. This project uses published npm packages, so it demonstrates the bug without first building the TanStack repository.
