# DataGrid API

Status: Draft
Last updated: 2026-05-21

This document defines the public contract for the grid component. The goal is to keep the API stable, predictable, and easy to extend without forcing consumers to reach into internal implementation details.

## Component Shape

The component is expected to follow this general shape:

```jsx
<DataGrid
  columns={columns}
  rows={rows}
  rowKey="id"
  height={480}
  density="comfortable"
  selection="single"
  sortable
  filterable
/>
```

The exact export name and module path can be finalized during implementation, but the contract below should remain stable.

## Core Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `columns` | `Array<ColumnDef>` | Yes | Column definitions in render order. |
| `rows` | `Array<object>` | Yes | Data rows to render. |
| `rowKey` | `string \| (row, index) => string` | Yes | Unique key for each row. |
| `height` | `number \| string` | No | Overall grid height. If omitted, the grid can size itself from layout constraints or derive from `visibleRowCount`. |
| `visibleRowCount` | `number` | No | Optional sizing hint that lets the grid height correspond to a target number of visible body rows, including when pagination is enabled. |
| `density` | `'compact' \| 'comfortable' \| 'spacious'` | No | Controls row height and spacing. Default should be `compact`. |
| `theme` | `'auto' \| 'light' \| 'dark' \| string` | No | Theme mode or named theme token set. `auto` should follow host CSS variables when present and fall back to the grid's built-in theme when no host theme is detected. |
| `mobileMode` | `'auto' \| 'transpose' \| 'grid'` | No | Controls whether the grid switches to mobile transpose mode. |
| `mobileBreakpoint` | `number` | No | Width threshold for enabling mobile layout when `mobileMode="auto"`. |
| `selection` | `'single' \| 'none'` | No | Selection mode. The default for this project is `single`. |
| `sortable` | `boolean` | No | Enables sorting interactions globally. |
| `filterable` | `boolean` | No | Enables the optional filter row globally. |
| `pagination` | `PaginationDef \| false` | No | Enables pagination when provided. The paginator can expose an editable rows-per-page input and should default to 10 rows when no page size is supplied. |
| `summary` | `SummaryDef \| false` | No | Enables the summary row when provided. |
| `footer` | `FooterDef \| false` | No | Enables the footer row when provided. |
| `virtualization` | `VirtualizationDef \| false` | No | Enables row virtualization or bounded row rendering. |
| `scrollMode` | `'body-only' \| 'body-and-pagination'` | No | Governs how scrolling interacts with pagination. |
| `className` | `string` | No | Extra class name for the root element. |
| `style` | `CSSProperties` | No | Inline styles applied to the root container. |

## Column Definition

`ColumnDef` should support the following fields:

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Unique column key, usually matching the data field name. |
| `field` | `string` | Data field name from the row object. |
| `headerName` | `string` | Explicit header label. If omitted, the grid should derive a label from the field name. |
| `align` | `'left' \| 'center' \| 'right'` | Alignment for header and cell content. |
| `width` | `number \| string` | Fixed or preferred width. |
| `minWidth` | `number` | Minimum width. |
| `maxWidth` | `number` | Maximum width. |
| `sortable` | `boolean` | Overrides global sorting behavior for this column. |
| `filterable` | `boolean` | Overrides global filtering behavior for this column. |
| `hidden` | `boolean` | Hides the column without removing it from metadata. |
| `resizable` | `boolean` | Allows user resizing if supported. |
| `pin` | `'left' \| 'right'` | Optional pinned positioning for freezing columns on the left or right edge. |
| `renderHeader` | `(params) => ReactNode` | Custom header renderer. |
| `renderCell` | `(params) => ReactNode` | Custom cell renderer. |
| `valueGetter` | `(row) => any` | Derived value accessor. |
| `valueFormatter` | `(value, row) => string` | Text formatter used for display and filter defaults. |
| `filterType` | `'text' \| 'number' \| 'date' \| 'select' \| 'boolean' \| 'custom'` | Filter mode. |
| `filterOptions` | `Array<{ label: string; value: string }>` | Options for select-like filters. |
| `summary` | `SummaryColumnDef` | Per-column summary config. |

## Sorting

Sorting should be controlled through the following props and events:

| Prop / Event | Type | Description |
| --- | --- | --- |
| `sortModel` | `Array<{ key: string; direction: 'asc' \| 'desc' }>` | Controlled sort state. |
| `defaultSortModel` | same as above | Initial sort state for uncontrolled mode. |
| `onSortChange` | `(model, context) => void` | Fired whenever sort state changes. |

Expected behavior:

- Clicking a sortable header should cycle `none -> asc -> desc -> none`.
- Sorting can be single-column or multi-column depending on implementation settings.
- The active sort direction should be visible in the header.

## Filtering

| Prop / Event | Type | Description |
| --- | --- | --- |
| `filters` | `Record<string, any>` | Controlled filter state keyed by column key. |
| `defaultFilters` | `Record<string, any>` | Initial filter state for uncontrolled mode. |
| `onFilterChange` | `(filters, context) => void` | Fired when a filter value changes. |

Expected behavior:

- The filter row is optional and only appears when enabled.
- Each column may expose its own filter input.
- Filtering should be composable with sorting and pagination.

## Selection

| Prop / Event | Type | Description |
| --- | --- | --- |
| `selection` | `'single' \| 'none'` | Selection mode. |
| `onRowSelect` | `(row, context) => void` | Fired when the selected row changes. |

Expected behavior:

- One row must always be selected when selection is enabled.
- Selection is based on the currently visible row order, not a persisted row key.
- If the visible rows change because of filtering, paging, sorting, or data updates, the grid should keep a valid visible row selected and fall back to the first available row when needed.

## Events

| Event | Signature | Description |
| --- | --- | --- |
| `onRowClick` | `(row, context) => void` | Row pointer activation. |
| `onRowDoubleClick` | `(row, context) => void` | Row double activation. |
| `onRowSelect` | `(row, context) => void` | Selection change. |
| `onCellClick` | `(cell, context) => void` | Cell activation. |
| `onCellFocus` | `(cell, context) => void` | Cell focus change. |
| `onSortChange` | `(model, context) => void` | Sort update. |
| `onFilterChange` | `(filters, context) => void` | Filter update. |
| `onPageChange` | `(page, context) => void` | Page update. |
| `onScroll` | `(position, context) => void` | Scroll position update. |
| `onReachEnd` | `(context) => void` | Emitted when the body scroll approaches the end, if supported. |

`context` should include the active column, row index, data snapshot, event source, and grid instance metadata where useful.

## Pagination

| Prop | Type | Description |
| --- | --- | --- |
| `pagination` | `{ pageSize?: number; currentPage?: number; pageSizeOptions?: number[] } \| false` | Enables paging. If `pageSize` is omitted, the grid should expose a rows-per-page input and default to 10 rows. |
| `onPageChange` | `(page, context) => void` | Page change handler. |

Expected behavior:

- Pagination can be used alone or combined with vertical scrolling.
- The API should make it explicit whether scrolling applies to the current page only or the whole dataset.

## Summary

| Prop | Type | Description |
| --- | --- | --- |
| `summary` | `{ rows?: Array<object>; compute?: (rows, columns) => object; visible?: boolean } \| false` | Summary row configuration. |

Expected behavior:

- Summary values may be computed automatically or provided by the consumer.
- Summary rows should visually match the rest of the grid.

## Footer

| Prop | Type | Description |
| --- | --- | --- |
| `footer` | `{ content?: ReactNode; visible?: boolean } \| false` | Footer content or configuration. |

Expected behavior:

- The footer is useful when pagination controls are hidden.
- It should not compete visually with the data body.

## Custom Rendering

Custom rendering should work for both headers and cells:

| Prop | Type | Description |
| --- | --- | --- |
| `renderHeader` | `(params) => ReactNode` | Renders custom header content. |
| `renderCell` | `(params) => ReactNode` | Renders custom cell content. |

Custom renderers should receive:

- value
- row
- row index
- column metadata
- selected state
- hover state when applicable
- editing state when applicable

## Row and Cell Events

| Event | Signature | Description |
| --- | --- | --- |
| `onRowClick` | `(row, context) => void` | Fired when a row is clicked. |
| `onRowDoubleClick` | `(row, context) => void` | Fired when a row is double-clicked. |
| `onCellClick` | `(row, context) => void` | Fired when a cell is clicked. |
| `onCellDoubleClick` | `(row, context) => void` | Fired when a cell is double-clicked. |

The `context` object should include the row, column, row index, cell value, page information, and native event reference.

## Summary Row

The summary row can be configured through the `summary` prop and optional per-column `summary` metadata.

`summary` may support:

- `visible` to toggle the summary row
- `label` for the first summary cell
- `row` for explicit summary values
- `compute(rows, columns)` for custom summary generation

Per-column summary metadata may support:

- `aggregate: 'sum' | 'avg' | 'min' | 'max' | 'count'`
- `value(rows, column)` for custom aggregation

Expected behavior:

- The summary row should use the same column widths as the body.
- Summary values should normally reflect the currently visible or paged rows.
- Custom cell renderers may also render summary cells when needed.

## Theme Contract

The grid should consume theme values through CSS variables or a theme object. At minimum, the theme contract should cover:

- background
- foreground text
- borders
- row hover state
- selected row state
- header background
- header text
- filter input styling
- summary row styling
- footer styling
- scrollbar-friendly spacing

Expected behavior:

- When `theme="auto"`, the grid should inherit host theme CSS variables if they are available.
- When no host theme is detected, the grid should apply its internal light or dark fallback tokens.
- Explicit `theme="light"` and `theme="dark"` should override the automatic detection.

## Responsive Mode

| Prop | Type | Description |
| --- | --- | --- |
| `mobileMode` | `'auto' \| 'transpose' \| 'grid'` | Controls whether the grid switches to a transpose layout on small screens or stays in the standard grid mode. |
| `mobileBreakpoint` | `number` | Breakpoint used when `mobileMode="auto"`. |

Expected behavior:

- `grid` keeps the classic horizontally scrollable layout.
- `transpose` always renders the vertical card layout.
- `auto` switches to transpose when the viewport is narrower than `mobileBreakpoint`.
- The transpose layout should remain readable and usable without horizontal scrolling.

If no host theme is present, the grid must apply its own default token set.

## Mobile Mode

The `mobileMode` prop should support:

- `grid` for the normal table-like layout
- `transpose` for the vertical-only layout
- `auto` for responsive switching by breakpoint

In transpose mode:

- each data row may be rendered as a stacked card or label-value panel
- the user should still be able to select rows and trigger actions
- sorting and filtering controls should remain available where possible
