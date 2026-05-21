import { Fragment, isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import './DataGrid.css'

const SORT_DIRECTIONS = ['none', 'asc', 'desc']
const DEFAULT_ROW_KEY = 'id'
const DEFAULT_SORTABLE = true
const DEFAULT_FILTERABLE = false
const DEFAULT_PAGE_SIZE = 10
const EMPTY_OBJECT = {}
const MOBILE_BREAKPOINT = 768
const DENSITY_PRESETS = {
   compact: {
      rowHeight: 34,
      headerHeight: 40,
      filterHeight: 40,
      paginationHeight: 46,
      footerHeight: 46,
      cellPaddingX: 10,
      filterInputHeight: 26,
      filterInputPaddingX: 10,
      stateMinHeight: 150,
      statePaddingY: 16,
      statePaddingX: 18,
      actionButtonHeight: 26,
   },
   comfortable: {
      rowHeight: 42,
      headerHeight: 46,
      filterHeight: 46,
      paginationHeight: 52,
      footerHeight: 52,
      cellPaddingX: 12,
      filterInputHeight: 30,
      filterInputPaddingX: 12,
      stateMinHeight: 180,
      statePaddingY: 18,
      statePaddingX: 20,
      actionButtonHeight: 30,
   },
   spacious: {
      rowHeight: 50,
      headerHeight: 54,
      filterHeight: 54,
      paginationHeight: 58,
      footerHeight: 58,
      cellPaddingX: 14,
      filterInputHeight: 34,
      filterInputPaddingX: 12,
      stateMinHeight: 210,
      statePaddingY: 20,
      statePaddingX: 22,
      actionButtonHeight: 34,
   },
}

const FALLBACK_LIGHT_THEME = {
   '--text': '#4b5563',
   '--text-h': '#0f172a',
   '--bg': '#f3f6fb',
   '--border': '#d7dbe4',
   '--accent': '#4f46e5',
   '--accent-bg': 'rgba(79, 70, 229, 0.12)',
}

const FALLBACK_DARK_THEME = {
   '--text': '#9ca3af',
   '--text-h': '#f8fafc',
   '--bg': '#0b1220',
   '--border': '#243043',
   '--accent': '#60a5fa',
   '--accent-bg': 'rgba(96, 165, 250, 0.14)',
}

const HOST_THEME_KEYS = ['--bg', '--text', '--text-h', '--border', '--accent', '--accent-bg']

const ACRONYMS = new Set(['id', 'api', 'ui', 'ux', 'url', 'sku', 'ip', 'json', 'csv'])

function PaginationIcon({ name }) {
   const iconProps = {
      className: 'dg-paginationIcon',
      viewBox: '0 0 16 16',
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false',
   }

   switch (name) {
      case 'first':
         return (
            <svg {...iconProps}>
               <path d="M4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0V10l7.146 5.646a.5.5 0 0 0 .708-.708L5.707 9l7.147-7.146a.5.5 0 0 0-.708-.708L5 6.293V1.5a.5.5 0 0 0-.5-.5z" />
            </svg>
         )
      case 'prev':
         return (
            <svg {...iconProps}>
               <path d="M10.854 1.146a.5.5 0 0 1 0 .708L5.707 7l5.147 5.146a.5.5 0 0 1-.708.708l-5.5-5.5a.5.5 0 0 1 0-.708l5.5-5.5a.5.5 0 0 1 .708 0z" />
            </svg>
         )
      case 'next':
         return (
            <svg {...iconProps}>
               <path d="M5.146 1.146a.5.5 0 0 0 0 .708L10.293 7 5.146 12.146a.5.5 0 0 0 .708.708l5.5-5.5a.5.5 0 0 0 0-.708l-5.5-5.5a.5.5 0 0 0-.708 0z" />
            </svg>
         )
      case 'last':
      default:
         return (
            <svg {...iconProps}>
               <path d="M11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0V10L3.854 15.646a.5.5 0 0 1-.708-.708L10.293 9 3.146 1.854a.5.5 0 0 1 .708-.708L11 6.293V1.5a.5.5 0 0 1 .5-.5z" />
            </svg>
         )
   }
}

function isTransposeControlContent(content) {
   if (Array.isArray(content)) {
      return content.some(isTransposeControlContent)
   }

   if (!isValidElement(content)) {
      return false
   }

   if (typeof content.type === 'string') {
      return ['button', 'select', 'input', 'textarea'].includes(content.type)
   }

   return isTransposeControlContent(content.props?.children)
}

function resolveColumnWidth(column) {
   if (typeof column.width === 'number') {
      return `${column.width}px`
   }

   if (typeof column.width === 'string' && column.width.trim()) {
      return column.width
   }

   return '180px'
}

function toHeaderLabel(field = '') {
   if (!field) {
      return ''
   }

   return field
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => {
         const lower = part.toLowerCase()

         if (ACRONYMS.has(lower)) {
            return lower.toUpperCase()
         }

         return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
      .join(' ')
}

function normalizeColumns(columns) {
   return columns.map((column) => ({
      ...column,
      key: column.key ?? column.field,
      headerName: column.headerName ?? toHeaderLabel(column.field ?? column.key),
      align: column.align ?? 'left',
      sortable: column.sortable ?? DEFAULT_SORTABLE,
      filterable: column.filterable ?? DEFAULT_FILTERABLE,
   }))
}

function getRowKeyValue(row, rowKey, index) {
   if (typeof rowKey === 'function') {
      return rowKey(row, index)
   }

   return row?.[rowKey] ?? index
}

function coerceComparable(value) {
   if (value == null) {
      return ''
   }

   if (typeof value === 'number') {
      return value
   }

   if (value instanceof Date) {
      return value.getTime()
   }

   if (typeof value === 'string') {
      const trimmed = value.trim()
      const numeric = Number(trimmed.replace(/[^0-9.-]/g, ''))

      if (trimmed && !Number.isNaN(numeric) && /[0-9]/.test(trimmed)) {
         return numeric
      }

      return trimmed.toLowerCase()
   }

   return String(value).toLowerCase()
}

function compareValues(left, right) {
   const a = coerceComparable(left)
   const b = coerceComparable(right)

   if (a < b) {
      return -1
   }

   if (a > b) {
      return 1
   }

   return 0
}

function filterRow(row, columns, filters) {
   return columns.every((column) => {
      const filterValue = filters[column.key]

      if (filterValue == null || filterValue === '') {
         return true
      }

      const cellValue = row[column.field]
      const normalizedCell = String(cellValue ?? '').toLowerCase()
      const normalizedFilter = String(filterValue).toLowerCase()

      if (column.filterType === 'select' || column.filterType === 'boolean') {
         return normalizedCell === normalizedFilter
      }

      return normalizedCell.includes(normalizedFilter)
   })
}

function sortRows(rows, columns, sortModel) {
   if (!sortModel) {
      return rows
   }

   const column = columns.find((item) => item.key === sortModel.key)

   if (!column) {
      return rows
   }

   const sorted = [...rows].sort((leftRow, rightRow) => {
      const leftValue = leftRow[column.field]
      const rightValue = rightRow[column.field]
      const result = compareValues(leftValue, rightValue)

      return sortModel.direction === 'desc' ? -result : result
   })

   return sorted
}

function paginateRows(rows, pageSize, currentPage) {
   const start = (currentPage - 1) * pageSize
   return rows.slice(start, start + pageSize)
}

function parseNumber(value) {
   if (value == null || value === '') {
      return null
   }

   if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null
   }

   const numeric = Number(String(value).replace(/[^0-9.-]/g, ''))
   return Number.isFinite(numeric) ? numeric : null
}

function getAggregateValue(rows, column, summaryConfig) {
   if (!column?.summary) {
      return null
   }

   const config = typeof column.summary === 'function' ? { value: column.summary } : column.summary

   if (typeof config?.value === 'function') {
      return config.value(rows, column, summaryConfig)
   }

   const values = rows
      .map((row) => parseNumber(row[column.field]))
      .filter((value) => value != null)

   switch (config?.aggregate) {
      case 'count':
         return rows.length
      case 'min':
         return values.length ? Math.min(...values) : ''
      case 'max':
         return values.length ? Math.max(...values) : ''
      case 'avg':
         return values.length
            ? values.reduce((total, value) => total + value, 0) / values.length
            : ''
      case 'sum':
      default:
         return values.length ? values.reduce((total, value) => total + value, 0) : ''
   }
}

function buildSummaryRow(rows, columns, summaryConfig) {
   if (!summaryConfig) {
      return null
   }

   const explicitRow = summaryConfig.row ?? (typeof summaryConfig.compute === 'function'
      ? summaryConfig.compute(rows, columns)
      : null)
   const summaryRow = explicitRow ? { ...explicitRow } : {}

   columns.forEach((column, index) => {
      const explicitValue =
         summaryRow[column.key] ??
         summaryRow[column.field] ??
         summaryRow[`${column.key}_summary`] ??
         summaryRow[`${column.field}_summary`]

      if (explicitValue != null) {
         summaryRow[column.key] = explicitValue
         return
      }

      if (index === 0 && summaryConfig.label) {
         summaryRow[column.key] = summaryConfig.label
         return
      }

      const aggregateValue = getAggregateValue(rows, column, summaryConfig)
      if (aggregateValue != null && aggregateValue !== '') {
         summaryRow[column.key] = aggregateValue
      }
   })

   return Object.keys(summaryRow).length ? summaryRow : null
}

function buildEventContext({
   row,
   rowIndex,
   column,
   value,
   event,
   pageSize,
   page,
   isSummary = false,
}) {
   return {
      row,
      rowIndex,
      column,
      value,
      event,
      page,
      pageSize,
      isSummary,
   }
}

function detectHostTheme() {
   if (typeof window === 'undefined') {
      return false
   }

   const computedStyle = window.getComputedStyle(document.documentElement)
   return HOST_THEME_KEYS.some((key) => computedStyle.getPropertyValue(key).trim())
}

function detectColorScheme() {
   if (typeof window === 'undefined') {
      return 'light'
   }

   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useResponsiveState(mobileBreakpoint) {
   const [isNarrow, setIsNarrow] = useState(false)
   const [prefersDark, setPrefersDark] = useState(detectColorScheme() === 'dark')
   const [hostThemeDetected] = useState(() => detectHostTheme())

   useEffect(() => {
      if (typeof window === 'undefined') {
         return undefined
      }

      const breakpointQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const updateBreakpoint = () => setIsNarrow(breakpointQuery.matches)
      const updateColorScheme = () => setPrefersDark(colorSchemeQuery.matches)

      updateBreakpoint()
      updateColorScheme()

      breakpointQuery.addEventListener?.('change', updateBreakpoint)
      colorSchemeQuery.addEventListener?.('change', updateColorScheme)

      return () => {
         breakpointQuery.removeEventListener?.('change', updateBreakpoint)
         colorSchemeQuery.removeEventListener?.('change', updateColorScheme)
      }
   }, [mobileBreakpoint])

   return {
      hostThemeDetected,
      prefersDark,
      isNarrow,
   }
}

function resolveHeight({
   height,
   bodyRowCount,
   filterRowVisible,
   summaryRowVisible,
   paginationEnabled,
   footerVisible,
   density,
}) {
   if (height != null) {
      return height
   }

   const metrics = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.compact
   const bodyRows = Math.max(bodyRowCount ?? DEFAULT_PAGE_SIZE, 1)
   const totalHeight =
      metrics.headerHeight +
      (filterRowVisible ? metrics.filterHeight : 0) +
      bodyRows * metrics.rowHeight +
      (summaryRowVisible ? metrics.rowHeight : 0) +
      (paginationEnabled ? metrics.paginationHeight : 0) +
      (footerVisible ? metrics.footerHeight : 0)

   return `${totalHeight}px`
}

function resolveTransposeHeight({ height, columnCount, density, footerSpace = 0 }) {
   if (height != null) {
      return height
   }

   if (!columnCount || columnCount < 1) {
      return '100svh'
   }

   const metrics = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.compact
   const estimatedFieldHeight = metrics.headerHeight + metrics.rowHeight + 10
   const estimatedRecordHeight = columnCount * estimatedFieldHeight + 28 + footerSpace

   return `${estimatedRecordHeight}px`
}

function DataGrid({
   columns,
   rows,
   height,
   className = '',
   rowKey = DEFAULT_ROW_KEY,
   sortable = true,
   filterable = false,
   selection = 'single',
   density = 'compact',
   theme = 'auto',
   mobileMode = 'auto',
   mobileBreakpoint = MOBILE_BREAKPOINT,
   summary = false,
   pagination = false,
   footer = false,
   loading = false,
   emptyState = 'No rows available.',
   loadingState = 'Loading rows...',
   visibleRowCount,
   onRowClick,
   onRowDoubleClick,
   onCellClick,
   onCellDoubleClick,
   onPageChange,
}) {
   const headerScrollRef = useRef(null)
   const bodyScrollRef = useRef(null)
   const transposeTableWrapRef = useRef(null)
   const { hostThemeDetected, prefersDark, isNarrow } = useResponsiveState(mobileBreakpoint)
   const normalizedColumns = useMemo(() => normalizeColumns(columns), [columns])
   const [sortModel, setSortModel] = useState(null)
   const [filters, setFilters] = useState({})
   const [internalPage, setInternalPage] = useState(1)
   const [measuredTransposeHeight, setMeasuredTransposeHeight] = useState(null)
   const [selectedRowIndex, setSelectedRowIndex] = useState(null)

   const [internalPageSize, setInternalPageSize] = useState(() => {
      if (typeof pagination === 'object' && pagination && pagination.pageSize) {
         return Math.max(1, Number(pagination.pageSize) || DEFAULT_PAGE_SIZE)
      }

      return DEFAULT_PAGE_SIZE
   })

   const densityMetrics = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.compact
   const isTransposeMode = mobileMode === 'transpose' || (mobileMode === 'auto' && isNarrow)

   const effectiveTheme = useMemo(() => {
      if (theme !== 'auto') {
         return theme
      }

      if (hostThemeDetected) {
         return 'host'
      }

      return prefersDark ? 'dark' : 'light'
   }, [hostThemeDetected, prefersDark, theme])

   const themeVars = useMemo(() => {
      if (theme === 'auto' && hostThemeDetected) {
         return {}
      }

      return effectiveTheme === 'dark' ? FALLBACK_DARK_THEME : FALLBACK_LIGHT_THEME
   }, [effectiveTheme, hostThemeDetected, theme])

   const visibleRows = useMemo(
      () => getVisibleRows(rows, normalizedColumns, filters, sortModel),
      [filters, normalizedColumns, rows, sortModel],
   )

   const paginationEnabled = Boolean(pagination)
   const pageSize = paginationEnabled ? internalPageSize : visibleRows.length
   const pageCount = paginationEnabled ? Math.max(1, Math.ceil(visibleRows.length / pageSize)) : 1
   const currentPage = paginationEnabled ? pagination.currentPage ?? internalPage : 1
   const safeCurrentPage = paginationEnabled ? Math.min(Math.max(currentPage, 1), pageCount) : 1

   const pagedRows = useMemo(() => {
      if (!paginationEnabled) {
         return visibleRows
      }

      return paginateRows(visibleRows, pageSize, safeCurrentPage)
   }, [pageSize, paginationEnabled, safeCurrentPage, visibleRows])

   const summaryConfig = summary ? (typeof summary === 'object' ? summary : EMPTY_OBJECT) : null
   const summarySourceRows = summaryConfig?.rows ?? pagedRows

   const summaryRow = useMemo(
      () => buildSummaryRow(summarySourceRows, normalizedColumns, summaryConfig),
      [normalizedColumns, summaryConfig, summarySourceRows],
   )
   const hasFilterRow = filterable && normalizedColumns.some((column) => column.filterable)
   const hasFooterRow = !paginationEnabled && Boolean(footer)
   const hasSummaryRow = Boolean(summaryRow)

   useEffect(() => {
      if (selection === 'none') {
         setSelectedRowIndex(null)
         return
      }

      if (!pagedRows.length) {
         setSelectedRowIndex(null)
         return
      }

      setSelectedRowIndex((currentIndex) => {
         if (currentIndex == null) {
            return 0
         }

         return Math.min(Math.max(currentIndex, 0), pagedRows.length - 1)
      })
   }, [pagedRows.length, selection])

   const transposeFooterSpace = isTransposeMode
      ? paginationEnabled
         ? densityMetrics.paginationHeight
         : !paginationEnabled && Boolean(footer)
           ? densityMetrics.footerHeight
           : 0
      : 0

   useEffect(() => {
      if (typeof window === 'undefined') {
         return undefined
      }

      if (!isTransposeMode || height != null || !pagedRows.length || loading) {
         return undefined
      }

      const measureTransposeHeight = () => {
         const record = transposeTableWrapRef.current?.querySelector('.dg-transposeRecordShell')

         if (!record) {
            return
         }

         const layoutPadding = 28 + transposeFooterSpace
         const nextHeight = record.offsetHeight + layoutPadding

         if (nextHeight > 0) {
            setMeasuredTransposeHeight(nextHeight)
         }
      }

      const rafId = window.requestAnimationFrame(measureTransposeHeight)

      const onResize = () => {
         window.requestAnimationFrame(measureTransposeHeight)
      }

      window.addEventListener('resize', onResize)

      return () => {
         window.cancelAnimationFrame(rafId)
         window.removeEventListener('resize', onResize)
      }
   }, [height, isTransposeMode, loading, pagedRows.length, transposeFooterSpace])

   const gridTemplateColumns = normalizedColumns.map(resolveColumnWidth).join(' ')
   const resolvedHeight = isTransposeMode
      ? measuredTransposeHeight ?? resolveTransposeHeight({
           height,
           columnCount: normalizedColumns.length,
           density,
           footerSpace: transposeFooterSpace,
        })
      : resolveHeight({
           height,
           bodyRowCount:
              visibleRowCount ?? (paginationEnabled ? pageSize : DEFAULT_PAGE_SIZE),
           filterRowVisible: hasFilterRow,
           summaryRowVisible: hasSummaryRow,
           paginationEnabled,
           footerVisible: hasFooterRow,
           density,
        })

   const syncHorizontalScroll = (source, target) => {
      if (!source || !target) {
         return
      }

      if (target.scrollLeft !== source.scrollLeft) {
         target.scrollLeft = source.scrollLeft
      }
   }

   const handleSortChange = (column) => {
      if (!sortable || column.sortable === false) {
         return
      }

      setSortModel((currentSort) => {
         if (!currentSort || currentSort.key !== column.key) {
            return { key: column.key, direction: 'asc' }
         }

         const currentIndex = SORT_DIRECTIONS.indexOf(currentSort.direction)
         const nextDirection = SORT_DIRECTIONS[(currentIndex + 1) % SORT_DIRECTIONS.length]

         if (nextDirection === 'none') {
            return null
         }

         return {
            key: column.key,
            direction: nextDirection,
         }
      })
   }

   const handleFilterChange = (columnKey, value) => {
      setFilters((currentFilters) => ({
         ...currentFilters,
         [columnKey]: value,
      }))
   }

   const handleRowSelect = (index) => {
      if (selection === 'none') {
         return
      }

      setSelectedRowIndex(index)
   }

   const changePage = (nextPage) => {
      if (!paginationEnabled) {
         return
      }

      const clampedPage = Math.min(Math.max(nextPage, 1), pageCount)

      if (pagination.currentPage == null) {
         setInternalPage(clampedPage)
      }

      onPageChange?.(clampedPage, {
         pageSize,
         totalRows: visibleRows.length,
         pageCount,
      })
   }

   const changePageSize = (nextPageSize) => {
      if (!paginationEnabled) {
         return
      }

      const normalizedPageSize = Math.max(1, Number(nextPageSize) || DEFAULT_PAGE_SIZE)
      setInternalPageSize(normalizedPageSize)
      setInternalPage(1)
   }

   const getCellContent = (column, row, rowIndex, isSelected, isSummary = false) => {
      const value = row?.[column.field]
      const baseParams = {
         value,
         row,
         rowIndex,
         column,
         selected: isSelected,
         density,
         page: safeCurrentPage,
         pageSize,
         rows: pagedRows,
         isSummary,
      }

      if (typeof column.renderCell === 'function') {
         return column.renderCell(baseParams)
      }

      const formattedValue =
         typeof column.valueFormatter === 'function'
            ? column.valueFormatter(value, row, column)
            : value

      return String(formattedValue ?? '')
   }

   const getHeaderContent = (column, sortState) => {
      if (typeof column.renderHeader === 'function') {
         return column.renderHeader({
            column,
            sortState,
            density,
            page: safeCurrentPage,
            pageSize,
            rows: pagedRows,
         })
      }

      return column.headerName
   }

   const getSortState = (columnKey) => {
      if (!sortModel || sortModel.key !== columnKey) {
         return 'none'
      }

      return sortModel.direction
   }

   const showFooter = !paginationEnabled && footer
   const summaryRowCount = summaryRow ? 1 : 0
   const renderTransposeRecord = (
      row,
      rowIndex,
      isSelected,
      isSummary = false,
      rowKeyValue,
   ) => (
      <div
         key={rowKeyValue ?? (isSummary ? 'summary-row' : rowIndex)}
         className={`dg-transposeRecordShell ${isSelected ? 'is-selected' : ''} ${
            isSummary ? 'dg-transposeRecordShell--summary' : ''
         }`.trim()}
      >
         <table className="dg-transposeRecord" aria-label={isSummary ? 'Summary row' : `Row ${rowIndex + 1}`}>
            <tbody>
               {normalizedColumns.map((column) => {
                  const value = row?.[column.field]
                  const content = getCellContent(column, row, rowIndex, isSelected, isSummary)
                  const isControlCell = isTransposeControlContent(content)

                  return (
                     <Fragment key={column.key}>
                        <tr className="dg-transposeFieldHeaderRow">
                           <th scope="row" className="dg-transposeLabelCell dg-align-left">
                              {column.headerName}
                           </th>
                        </tr>
                        <tr className="dg-transposeFieldValueRow">
                           <td
                              className={`dg-transposeValueCell ${
                                 isControlCell ? 'dg-transposeValueCell--control' : 'dg-align-left'
                              }`}
                              tabIndex={isSummary ? -1 : 0}
                              onClick={(event) => {
                                 event.stopPropagation()

                                 if (isSummary) {
                                    return
                                 }

                                 handleRowSelect(rowIndex)
                                 onRowClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column,
                                       value,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                       isSummary,
                                    }),
                                 )
                                 onCellClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column,
                                       value,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                       isSummary,
                                    }),
                                 )
                              }}
                              onDoubleClick={(event) => {
                                 event.stopPropagation()

                                 if (isSummary) {
                                    return
                                 }

                                 onRowDoubleClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column,
                                       value,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                       isSummary,
                                    }),
                                 )
                                 onCellDoubleClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column,
                                       value,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                       isSummary,
                                    }),
                                 )
                              }}
                              onKeyDown={(event) => {
                                 if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    event.stopPropagation()

                                    if (isSummary) {
                                       return
                                    }

                                    handleRowSelect(rowIndex)
                                    onRowClick?.(
                                       row,
                                       buildEventContext({
                                          row,
                                          rowIndex,
                                          column,
                                          value,
                                          event,
                                          pageSize,
                                          page: safeCurrentPage,
                                          isSummary,
                                       }),
                                    )
                                    onCellClick?.(
                                       row,
                                       buildEventContext({
                                          row,
                                          rowIndex,
                                          column,
                                          value,
                                          event,
                                          pageSize,
                                          page: safeCurrentPage,
                                          isSummary,
                                       }),
                                    )
                                 }
                              }}
                           >
                              <span className="dg-transposeValue">{content}</span>
                           </td>
                        </tr>
                     </Fragment>
                  )
               })}
            </tbody>
         </table>
      </div>
   )

   const renderPaginationFooter = () =>
      paginationEnabled ? (
         <div
            className={`dg-pagination ${isTransposeMode ? 'dg-pagination--transpose' : ''}`.trim()}
            role="navigation"
            aria-label="Table pagination"
         >
            <div className="dg-pagination__sizeControl">
               {!isTransposeMode ? (
                  <label className="dg-pagination__label" htmlFor="dg-page-size">
                     Rows per page
                  </label>
               ) : null}
               <input
                  id="dg-page-size"
                  className="dg-paginationInput"
                  type="number"
                  min="1"
                  step="1"
                  value={pageSize}
                  onChange={(event) => changePageSize(event.target.value)}
                  aria-label="Rows per page"
               />
            </div>
            <div className="dg-pagination__summary">
               {isTransposeMode
                  ? `Page ${safeCurrentPage} / ${pageCount}`
                  : `${pagedRows.length} rows per page · Page ${safeCurrentPage} of ${pageCount}`}
            </div>
            <div className="dg-pagination__actions">
               <button
                  type="button"
                  className="dg-paginationButton"
                  onClick={() => changePage(1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="First page"
               >
                  {isTransposeMode ? <PaginationIcon name="first" /> : 'First'}
               </button>
               <button
                  type="button"
                  className="dg-paginationButton"
                  onClick={() => changePage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
               >
                  {isTransposeMode ? <PaginationIcon name="prev" /> : 'Prev'}
               </button>
               <button
                  type="button"
                  className="dg-paginationButton"
                  onClick={() => changePage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === pageCount}
                  aria-label="Next page"
               >
                  {isTransposeMode ? <PaginationIcon name="next" /> : 'Next'}
               </button>
               <button
                  type="button"
                  className="dg-paginationButton"
                  onClick={() => changePage(pageCount)}
                  disabled={safeCurrentPage === pageCount}
                  aria-label="Last page"
               >
                  {isTransposeMode ? <PaginationIcon name="last" /> : 'Last'}
               </button>
            </div>
         </div>
      ) : showFooter ? (
         <div className="dg-footer" role="note" aria-label="Grid footer">
            {typeof footer === 'string' ? footer : footer.content}
         </div>
      ) : null

   if (isTransposeMode) {
         return (
         <div
            className={`dg-shell dg-shell--transpose ${className}`.trim()}
            style={{
               '--dg-height': typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
               ...themeVars,
            }}
            data-density={density}
            data-theme={effectiveTheme}
         >
            <div className="dg-frame dg-frame--transpose">
               <div className="dg-transposeLayout">
                  <div className="dg-transposeList">
                     {loading ? (
                        <div className="dg-state" role="status" aria-live="polite">
                           <div className="dg-stateCard">
                              <strong>Loading</strong>
                              <span>{loadingState}</span>
                           </div>
                        </div>
                     ) : pagedRows.length ? (
                        <div
                           className="dg-transposeTableWrap"
                           ref={transposeTableWrapRef}
                           aria-label="Transposed data"
                        >
                           {pagedRows.map((row, rowIndex) => {
                              const resolvedRowKey = getRowKeyValue(row, rowKey, rowIndex)
                              const isSelected = rowIndex === selectedRowIndex

                              return renderTransposeRecord(row, rowIndex, isSelected, false, resolvedRowKey)
                           })}
                        </div>
                     ) : (
                        <div className="dg-state" role="status" aria-live="polite">
                           <div className="dg-stateCard">
                              <strong>Nothing to show</strong>
                              <span>{emptyState}</span>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
               {renderPaginationFooter()}
            </div>
         </div>
      )
   }

   return (
      <div
         className={`dg-shell ${className}`.trim()}
         style={{
            '--dg-height': typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
            '--dg-columns': gridTemplateColumns,
            '--dg-filter-row-height': hasFilterRow ? `${densityMetrics.filterHeight}px` : '0px',
            '--dg-row-height': `${densityMetrics.rowHeight}px`,
            '--dg-header-height': `${densityMetrics.headerHeight}px`,
            '--dg-cell-padding-x': `${densityMetrics.cellPaddingX}px`,
            '--dg-filter-height': `${densityMetrics.filterHeight}px`,
            '--dg-filter-input-height': `${densityMetrics.filterInputHeight}px`,
            '--dg-filter-input-padding-x': `${densityMetrics.filterInputPaddingX}px`,
            '--dg-state-min-height': `${densityMetrics.stateMinHeight}px`,
            '--dg-state-padding-y': `${densityMetrics.statePaddingY}px`,
            '--dg-state-padding-x': `${densityMetrics.statePaddingX}px`,
            '--dg-action-button-height': `${densityMetrics.actionButtonHeight}px`,
            '--dg-pagination-height': `${densityMetrics.paginationHeight}px`,
            '--dg-footer-height': `${densityMetrics.footerHeight}px`,
            ...themeVars,
         }}
         data-density={density}
         data-theme={effectiveTheme}
         role="grid"
         aria-rowcount={pagedRows.length + summaryRowCount}
         aria-colcount={normalizedColumns.length}
      >
         <div className="dg-frame">
            <div
               className="dg-headerScroll"
               ref={headerScrollRef}
               onScroll={(event) => syncHorizontalScroll(event.currentTarget, bodyScrollRef.current)}
            >
               <div className="dg-surface">
                  <div className="dg-row dg-row--header" role="row" aria-label="Data grid header">
                     {normalizedColumns.map((column) => {
                        const sortState = getSortState(column.key)

                        return (
                           <div
                              key={column.key}
                              className={`dg-cell dg-cell--header dg-align-${column.align}`}
                              role="columnheader"
                           >
                              <button
                                 type="button"
                                 className={`dg-headerButton ${sortState !== 'none' ? 'is-active' : ''}`}
                                 onClick={() => handleSortChange(column)}
                                 aria-label={`Sort by ${column.headerName}`}
                                 aria-pressed={sortState !== 'none'}
                                 disabled={!sortable || column.sortable === false}
                              >
                                 <span className="dg-label">{getHeaderContent(column, sortState)}</span>
                                 <span
                                    className={`dg-sortMark ${
                                       sortState === 'none' ? '' : `is-${sortState}`
                                    }`}
                                    aria-hidden="true"
                                 >
                                    {sortState === 'asc' ? '↑' : sortState === 'desc' ? '↓' : '↕'}
                                 </span>
                              </button>
                           </div>
                        )
                     })}
                  </div>

                  {hasFilterRow ? (
                     <div className="dg-row dg-row--filter" role="row" aria-label="Data grid filters">
                        {normalizedColumns.map((column) => (
                           <div
                              key={column.key}
                              className={`dg-cell dg-cell--filter dg-align-${column.align}`}
                              role="gridcell"
                           >
                              {column.filterable ? (
                                 column.filterType === 'select' && Array.isArray(column.filterOptions) ? (
                                    <select
                                       className="dg-filterInput"
                                       value={filters[column.key] ?? ''}
                                       onChange={(event) =>
                                          handleFilterChange(column.key, event.target.value)
                                       }
                                       aria-label={`Filter ${column.headerName}`}
                                    >
                                       <option value="">All</option>
                                       {column.filterOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                             {option.label}
                                          </option>
                                       ))}
                                    </select>
                                 ) : (
                                    <input
                                       className="dg-filterInput"
                                       type="text"
                                       value={filters[column.key] ?? ''}
                                       onChange={(event) =>
                                          handleFilterChange(column.key, event.target.value)
                                       }
                                       placeholder={`Filter ${column.headerName}`}
                                       aria-label={`Filter ${column.headerName}`}
                                    />
                                 )
                              ) : null}
                           </div>
                        ))}
                     </div>
                  ) : null}
               </div>
            </div>

            <div
               className="dg-bodyScroll"
               ref={bodyScrollRef}
               onScroll={(event) =>
                  syncHorizontalScroll(event.currentTarget, headerScrollRef.current)
               }
            >
               <div className="dg-surface">
                  {loading ? (
                     <div className="dg-state" role="status" aria-live="polite">
                        <div className="dg-stateCard">
                           <strong>Loading</strong>
                           <span>{loadingState}</span>
                        </div>
                     </div>
                  ) : pagedRows.length ? (
                     pagedRows.map((row, rowIndex) => {
                        const resolvedRowKey = getRowKeyValue(row, rowKey, rowIndex)
                        const isSelected = rowIndex === selectedRowIndex

                        return (
                           <div
                              key={resolvedRowKey}
                              className={`dg-row dg-row--body ${isSelected ? 'is-selected' : ''}`}
                              role="row"
                              aria-rowindex={rowIndex + 1}
                              aria-selected={isSelected}
                              onClick={(event) => {
                                 handleRowSelect(rowIndex)
                                 onRowClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column: null,
                                       value: null,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                    }),
                                 )
                              }}
                              onDoubleClick={(event) =>
                                 onRowDoubleClick?.(
                                    row,
                                    buildEventContext({
                                       row,
                                       rowIndex,
                                       column: null,
                                       value: null,
                                       event,
                                       pageSize,
                                       page: safeCurrentPage,
                                    }),
                                 )
                              }
                           >
                              {normalizedColumns.map((column) => {
                                 const value = row[column.field]

                                 return (
                                    <div
                                       key={column.key}
                                       className={`dg-cell dg-align-${column.align}`}
                                       role="gridcell"
                                       onClick={(event) => {
                                          event.stopPropagation()
                                          handleRowSelect(rowIndex)
                                          onCellClick?.(
                                             row,
                                             buildEventContext({
                                                row,
                                                rowIndex,
                                                column,
                                                value,
                                                event,
                                                pageSize,
                                                page: safeCurrentPage,
                                             }),
                                          )
                                       }}
                                       onDoubleClick={(event) => {
                                          event.stopPropagation()
                                          onCellDoubleClick?.(
                                             row,
                                             buildEventContext({
                                                row,
                                                rowIndex,
                                                column,
                                                value,
                                                event,
                                                pageSize,
                                                page: safeCurrentPage,
                                             }),
                                          )
                                       }}
                                    >
                                       <span className="dg-value">
                                          {getCellContent(column, row, rowIndex, isSelected)}
                                       </span>
                                    </div>
                                 )
                              })}
                           </div>
                        )
                     })
                  ) : (
                     <div className="dg-state" role="status" aria-live="polite">
                        <div className="dg-stateCard">
                           <strong>Nothing to show</strong>
                           <span>{emptyState}</span>
                        </div>
                     </div>
                  )}
                  {summaryRow ? (
                     <div className="dg-row dg-row--summary" role="row" aria-label="Summary row">
                        {normalizedColumns.map((column, rowIndex) => {
                           const value = summaryRow[column.key]

                           return (
                              <div
                                 key={column.key}
                                 className={`dg-cell dg-cell--summary dg-align-${column.align}`}
                                 role="gridcell"
                              >
                                 <span className="dg-value">
                                    {getCellContent(column, summaryRow, rowIndex, false, true) ||
                                       String(value ?? '')}
                                 </span>
                              </div>
                           )
                        })}
                     </div>
                  ) : null}
               </div>
            </div>

            {renderPaginationFooter()}
         </div>
      </div>
   )
}

function getVisibleRows(rows, columns, filters, sortModel) {
   return sortRows(
      rows.filter((row) => filterRow(row, columns, filters)),
      columns,
      sortModel,
   )
}

export default DataGrid
