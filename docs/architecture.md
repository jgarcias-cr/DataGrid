# DataGrid Architecture

Status: Draft
Last updated: 2026-05-21

This document defines the internal structure we should aim for when implementing the grid. The purpose is to keep the component composable and avoid turning the first version into a monolith.

## High-Level Structure

The grid should be built from a small set of coordinated layers:

1. Root container
2. Header region
3. Body scroll region
4. Optional filter row
5. Optional summary row
6. Optional footer region
7. Optional pagination region
8. Optional mobile transpose renderer

## Suggested Component Breakdown

- `DataGrid`
  - top-level orchestrator for state and layout
- `DataGridHeader`
  - renders column labels, sort controls, and optional filter row
- `DataGridBody`
  - renders visible rows and manages vertical scrolling
- `DataGridRow`
  - renders one row and its cells
- `DataGridCell`
  - renders default or custom cell content
- `DataGridSummary`
  - renders totals or other aggregate content
- `DataGridFooter`
  - renders status text or helper messages
- `DataGridPagination`
  - renders paging controls if enabled
- `DataGridTranspose`
  - renders the mobile vertical-only representation

## State Model

The grid should separate state into a few clear categories:

### Input state

- `columns`
- `rows`
- `theme`
- `mobileMode`
- `pagination`
- `summary`
- `footer`

### Interaction state

- selected row key
- sort model
- filter state
- current page
- hover state
- focus state
- scroll position

### Derived state

- visible columns
- visible rows
- formatted headers
- filtered rows
- sorted rows
- paged rows
- summary values
- responsive mode decision

## Data Flow

Recommended pipeline:

1. Normalize columns.
2. Resolve labels from metadata or derive them from snake_case field names.
3. Resolve theme tokens.
4. Apply filtering.
5. Apply sorting.
6. Apply pagination if enabled.
7. Determine visible rows for the current viewport or page.
8. Render header and body with synchronized horizontal scroll.
9. Render optional summary and footer.
10. Switch to transpose mode when the responsive rules require it.

## Scroll Model

The layout should use a split-scroll approach:

- The header lives in a non-scrolling horizontal layer or a shared horizontal sync layer.
- The body owns vertical scrolling.
- Horizontal scroll events should update the header and body content together.
- Any scrollbar gutter or padding needed for the body must be accounted for so the scrollbar never overlays the header row.

## Selection Model

Selection should be centralized at the grid level so that row clicks, keyboard navigation, filtering, and paging all resolve to the same selected row state.

Recommended rule:

- If selection is enabled and there are visible rows, one row is always selected.
- Selection is restored or corrected after filtering, sorting, or paging changes.

## Custom Rendering Model

Custom rendering should be passed through render hooks rather than by requiring consumers to replace entire grid sections.

Recommended render flow:

- column metadata chooses default vs custom header renderer
- column metadata chooses default vs custom cell renderer
- renderers receive a consistent params object
- default renderer remains available for simple cases

## Theme Model

Themeing should follow a token-based model:

- consume CSS variables from the host app where available
- fall back to grid-specific variables when host tokens are missing
- keep structural styles separate from color tokens where possible

This allows the grid to fit into unknown host applications without copying their entire design system.

## Responsive Strategy

The grid should support two presentation modes:

- `grid`: standard table-like layout with horizontal scrolling
- `transpose`: stacked label-value layout suitable for mobile

The responsive selector should be based on explicit props first, then a breakpoint fallback when `mobileMode="auto"`.

## Testing Implications

The architecture should make these seams testable:

- normalization and label derivation helpers
- sort/filter/pagination transforms
- selection restoration
- scroll synchronization
- theme fallback resolution
- transpose layout switching

Keeping these concerns isolated will make the later test suite much easier to maintain.

