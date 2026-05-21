# DataGrid Roadmap

Status: In Progress
Last updated: 2026-05-21

## Goal

Build a responsive DataGrid component with AG Grid-like behavior, but with improved UX, mobile-aware presentation, strong theming, and a clean public API.

## Non-Negotiable Requirements

- Horizontal scroll must move headers and body cells together.
- Vertical scroll must affect only the body; the header row must never be covered by the scrollbar.
- A row must always remain selected.
- Rows and cells must support custom rendering.
- The grid must adapt to the host app theme, and fall back to its own theme when no host theme exists.
- The grid must be fully responsive.
- A mobile vertical-only transpose mode must be available via prop.

## Work Phases

### Phase 0: Specification and API design

Scope:

- Define the public prop API.
- Define column metadata.
- Define event contracts for rows, cells, sorting, filtering, scrolling, and pagination.
- Define behavior rules for selection, theming, summary rows, footer, and mobile transpose mode.

Deliverables:

- `docs/api.md`
- `docs/behavior-spec.md`
- `docs/architecture.md`

Status: Done

### Phase 1: Base grid shell

Scope:

- Build the grid container and layout structure.
- Separate header and body scrolling correctly.
- Sync horizontal scrolling across header and body.
- Keep the header fixed while the body scrolls vertically.
- Establish uniform row height rules.
- Add border styling for the grid shell and rows.

Deliverables:

- Initial `DataGrid` component shell
- Base styles and responsive layout foundation

Status: Done

### Phase 2: Core data behaviors

Scope:

- Implement sortable headers.
- Add optional per-column filter row.
- Support default label formatting for snake_case column names.
- Add text alignment options for headers and cells.
- Enforce one selected row at all times.

Deliverables:

- Sorting UI and state
- Filtering UI and state
- Selection state and event hooks

Status: Done

### Phase 3: Data density and navigation

Scope:

- Limit visible rows through grid height and scrolling.
- Add pagination support.
- Allow combined pagination and vertical scrolling mode.
- Add empty state, loading state, and footer support.

Deliverables:

- Scroll behavior for data-heavy grids
- Pagination controls
- Footer messages when pagination is hidden

Status: Done

### Phase 4: Advanced cell and row composition

Scope:

- Support custom cells for multi-line content, buttons, dropdowns, checkboxes, images, and other rich UI.
- Add row-level and cell-level events.
- Add summary row support for totals and custom aggregations.

Deliverables:

- Custom cell rendering API
- Event coordination hooks
- Summary row rendering

Status: Done

### Phase 5: Theme and responsive modes

Scope:

- Detect host-app theme tokens or CSS variables.
- Fall back to a bundled default theme when none is available.
- Add a mobile transpose mode that renders a vertical-only layout.
- Validate responsive behavior across desktop and mobile widths.

Deliverables:

- Theme adapter and fallback styles
- Mobile transpose rendering path

Status: Done

### Phase 6: Testing and hardening

Scope:

- Add unit tests for formatting, selection, sorting, filtering, and summaries.
- Add integration tests for scrolling, pagination, and custom cells.
- Add accessibility checks.
- Add manual QA scenarios and visual regression coverage.

Deliverables:

- Test suite
- QA checklist
- Regression fixtures

Status: Pending

### Phase 7: Documentation and examples

Scope:

- Document the API, behavior rules, architecture, and test strategy.
- Add usage examples for common grid configurations.
- Document mobile transpose mode and theme integration.

Deliverables:

- `README.md` updates
- `docs/examples.md`
- `docs/testing.md`

Status: Pending

## Progress Tracker

| Phase | Status | Notes |
| --- | --- | --- |
| 0. Specification and API design | Done | API, behavior, and architecture docs created |
| 1. Base grid shell | Done | Header/body scroll split implemented |
| 2. Core data behaviors | Done | Sorting, filtering, derived labels, selection |
| 3. Data density and navigation | Done | Pagination, scrolling, footer, loading, and empty states |
| 4. Advanced cell and row composition | Done | Custom renderers, row/cell events, and summary row |
| 5. Theme and responsive modes | Done | Host theme fallback and transpose layout |
| 6. Testing and hardening | Pending | Automated and manual validation |
| 7. Documentation and examples | Pending | Usage docs and examples |

## Definition of Done

- The grid behaves consistently across supported layouts and screen sizes.
- The header remains fixed during vertical body scroll.
- Horizontal scrolling stays synchronized between header and body.
- A row is always selected.
- Theming falls back safely when the host app provides no theme.
- The mobile transpose mode is documented and functional.
- Tests cover the primary behaviors and regressions.
- Documentation is sufficient for another developer to extend the grid safely.

## How To Update This Document

- Mark a phase as `In Progress` when implementation starts.
- Move a phase to `Done` only after the code, tests, and docs for that phase are complete.
- Add short notes in the progress table for blockers or scope changes.
- Keep the `Last updated` date current whenever the roadmap changes.
