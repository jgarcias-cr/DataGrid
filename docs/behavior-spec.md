# DataGrid Behavior Spec

Status: Draft
Last updated: 2026-05-21

This document describes the behaviors the grid must guarantee. It is intentionally more opinionated than the API document because the UX requirements are part of the product contract.

## Layout Rules

- The header row must remain visually fixed while the body scrolls vertically.
- Horizontal scrolling must move the header and body content together.
- The vertical scrollbar must belong to the body area only and must never cover the header row.
- All visible rows must use a uniform height within a given density mode.
- The grid must maintain full row borders and cell borders throughout all states.
- Columns marked as frozen must remain visible while horizontal scrolling occurs.
- Frozen columns should support both left and right placement.

## Selection Rules

- A selected row must always exist when selection is enabled.
- Initial selection comes from the first visible row.
- Selection follows visible row order, not a persisted row key.
- If the selected row is removed by filtering, paging, sorting, or data refresh, the grid must fall back to the first valid visible row.
- Clicking an already selected row should keep it selected unless a future editing mode requires otherwise.

## Sorting Rules

- Sorting is activated from the header row.
- Default cycle: unsorted -> ascending -> descending -> unsorted.
- Sort indicators must be visible in the header.
- Sorting should not destroy selection unless the selected row is no longer present in the current result set.

## Filtering Rules

- The filter row is optional and may be shown only for columns that support filtering.
- Filters should be applied consistently with sorting and pagination.
- Filtering should update visible data without forcing layout jumps.
- When filters produce no rows, the grid must show an empty state.

## Scrolling Rules

- Vertical scrolling applies only to the body area.
- Horizontal scrolling applies to the full table width, including headers and body cells.
- Scrolling must remain stable when the grid is embedded inside layouts with overflow constraints.
- The header area must not change position while body scroll is occurring.

## Pagination Rules

- Pagination is optional.
- Pagination may be used with or without body scrolling.
- If pagination is combined with scrolling, the product should define whether the scrollbar is scoped to the page or to the dataset; the implementation must not leave this ambiguous.
- Pagination controls must not interfere with summary or footer content.

## Summary Rules

- Summary rows are optional.
- Summary rows should visually align with the data grid and use the same height system.
- Summary values may be derived from the visible rows, the paged rows, or the full dataset depending on the configured mode.
- Summary rendering must remain stable if the grid is filtered or paged.

## Footer Rules

- The footer is optional.
- The footer is useful when pagination controls are hidden or when the host app needs to surface status text.
- Footer content should be clearly separated from the data region.

## Custom Cell Rules

- Cells may render arbitrary content such as buttons, images, dropdowns, checkboxes, or multiline layouts.
- Custom cells must still respect selection styling and grid borders.
- Custom content must not break row height assumptions unless the row is explicitly configured for variable height.
- Cell-level interactions should not accidentally trigger row-level selection unless that behavior is intended and documented.
- Custom renderers should receive enough context to adapt to selected state, page state, and summary mode.

## Summary Rules

- Summary rows are optional but should align with the body columns when enabled.
- Summary values should normally reflect the currently loaded or visible rows.
- The first summary cell may be used as a label such as `Total` or `Page total`.
- Summary rows should stay visually distinct from data rows without breaking the table width or scroll behavior.

## Theme Rules

- The grid should first look for host theme tokens or CSS variables.
- If no host theme is available, the grid must apply its own default theme.
- Theme application should not require the consumer to rewrite the grid markup.
- Theme changes should propagate predictably across all regions of the grid.
- Explicit light and dark modes should override automatic theme detection.

## Responsive Rules

- The grid must adapt to narrow screens without becoming unusable.
- The mobile transpose mode should be a first-class presentation option, not an ad hoc fallback.
- Responsive behavior must preserve selection and essential row actions.
- The transpose layout may relax horizontal scrolling, but it must keep the data legible and navigable.
- `auto` mobile mode should switch to transpose under the configured breakpoint.
- `transpose` mode should stack labels and values vertically without requiring horizontal scroll.

## Accessibility Rules

- Header actions, filter controls, and row interactions must be keyboard reachable.
- Focus states must be visible.
- The grid should expose semantic structure that screen readers can understand.
- Color contrast must remain readable in both light and dark themes.

## Empty and Loading Rules

- Empty state must appear when no rows are available after all transforms.
- Loading state must be distinguishable from empty state.
- If the grid is loading data while preserving old rows, that interim state must be visually clear to the user.
