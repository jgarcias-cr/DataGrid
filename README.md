# Grid DataGrid Project

A custom React DataGrid component focused on predictable sizing, synchronized scrolling, rich cell rendering, and responsive behavior.

## What It Offers

- Horizontal scrolling with synchronized header and body regions
- Fixed header while the data body scrolls vertically
- Optional filter row
- Column sorting
- Single-row selection
- Pagination with page-size control
- Summary row support
- Footer support
- Frozen columns on the left or right edge
- Custom header and cell rendering
- Theme-aware styling with light, dark, and host-driven modes
- Responsive mobile transpose mode
- Demo-friendly sizing through `height` and `visibleRowCount`

## Component Highlights

- `columns` and `rows` drive the grid content
- `rowKey` supports stable row identity
- `selection="single"` keeps one visible row selected at a time
- `filterable` enables per-column filters when columns opt in
- `sortable` enables header-driven sort cycling
- `pagination` limits visible rows and exposes paging controls
- `summary` can compute or render an aggregate row
- `footer` can show status text or custom footer content
- `pin: 'left' | 'right'` freezes a column in place while scrolling
- `mobileMode="auto"` switches to a transpose layout on narrow screens

## Layout Behavior

- The grid shell respects the width of its parent container
- The total grid width follows the sum of the column widths
- Horizontal scrolling appears automatically when the columns exceed the available width
- The grid height accounts for the header row, filter row, visible data rows, summary row, and footer row when those regions are rendered

## Demo

The sample app in `src/App.jsx` shows:

- a richer grid with filtering, sorting, selection, pagination, and summary rendering
- a shorter grid with a footer message

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Build the project for production:

```bash
npm run build
```

## Documentation

- [API reference](docs/api.md)
- [Behavior spec](docs/behavior-spec.md)
- [Architecture notes](docs/architecture.md)
- [Roadmap](docs/datagrid-roadmap.md)

## Notes

- The component source lives in `src/DataGrid.jsx`
- Styling lives in `src/DataGrid.css`
- The preview app lives in `src/App.jsx`
