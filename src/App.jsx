import { useState } from 'react'
import DataGrid from './DataGrid'
import './App.css'

const columns = [
   {
      key: 'order_id',
      field: 'order_id',
      align: 'left',
      width: 120,
      filterable: true,
      pin: 'left',
   },
   {
      key: 'customer_name',
      field: 'customer_name',
      align: 'left',
      width: 220,
      filterable: true,
      pin: 'left',
      renderCell: ({ value, row }) => (
         <div className="customer-cell">
            <strong>{value}</strong>
            <span>{row.order_id} · {row.region}</span>
         </div>
      ),
   },
   {
      key: 'order_status',
      field: 'order_status',
      align: 'center',
      width: 160,
      filterable: true,
      filterType: 'select',
      filterOptions: [
         { label: 'Processing', value: 'Processing' },
         { label: 'Shipped', value: 'Shipped' },
         { label: 'Delivered', value: 'Delivered' },
         { label: 'On Hold', value: 'On Hold' },
         { label: 'Queued', value: 'Queued' },
      ],
      renderCell: ({ value }) => {
         const slug = String(value ?? '')
            .toLowerCase()
            .replace(/\s+/g, '-')

         return <span className={`status-pill status-pill--${slug}`}>{value}</span>
      },
   },
   { key: 'region', field: 'region', align: 'left', width: 150, filterable: true },
   { key: 'sales_rep', field: 'sales_rep', align: 'left', width: 180, filterable: true },
   { key: 'priority', field: 'priority', align: 'center', width: 120, filterable: true },
   { key: 'customer_email', field: 'customer_email', align: 'left', width: 250 },
   {
      key: 'order_value',
      field: 'order_value',
      align: 'right',
      width: 160,
      renderCell: ({ value, isSummary }) => {
         const numericValue =
            typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''))
         const displayValue = Number.isFinite(numericValue)
            ? `$${numericValue.toLocaleString('en-US', {
                 maximumFractionDigits: 2,
              })}`
            : value

         return (
            <span className={`currency-cell ${isSummary ? 'currency-cell--summary' : ''}`}>
               {displayValue}
            </span>
         )
      },
      summary: { aggregate: 'sum' },
   },
   { key: 'last_updated', field: 'last_updated', align: 'right', width: 180 },
   { key: 'phone', field: 'phone', align: 'left', width: 170 },
   { key: 'delivery_method', field: 'delivery_method', align: 'left', width: 180 },
   {
      key: 'actions',
      field: 'actions',
      headerName: 'Actions',
      align: 'center',
      width: 105,
      sortable: false,
      filterable: false,
      pin: 'right',
      renderCell: ({ row }) => (
         <button
            type="button"
            className="row-action"
            onClick={(event) => {
               event.stopPropagation()
               alert(`Open order ${row.order_id}`)
            }}
         >
            Open
         </button>
      ),
   },
]

const rows = [
   {
      id: 'ord-1001',
      order_id: 'A-1001',
      customer_name: 'Northwind Traders',
      order_status: 'Processing',
      region: 'SEA',
      sales_rep: 'A. Velez',
      order_value: '$14,210',
      last_updated: '2026-05-20 09:14',
      priority: 'High',
      customer_email: 'sales@northwind.example',
      phone: '+1-206-555-0101',
      delivery_method: 'FedEx',
   },
   {
      id: 'ord-1002',
      order_id: 'A-1002',
      customer_name: 'Blue Ridge Supply',
      order_status: 'Shipped',
      region: 'West',
      sales_rep: 'M. Flores',
      order_value: '$8,560',
      last_updated: '2026-05-20 11:44',
      priority: 'Medium',
      customer_email: 'orders@blueridge.example',
      phone: '+1-415-555-0192',
      delivery_method: 'UPS',
   },
   {
      id: 'ord-1003',
      order_id: 'A-1003',
      customer_name: 'Keystone Logistics',
      order_status: 'On Hold',
      region: 'Central',
      sales_rep: 'D. Kumar',
      order_value: '$21,030',
      last_updated: '2026-05-20 14:02',
      priority: 'Low',
      customer_email: 'contact@keystonelog.example',
      phone: '+1-312-555-0133',
      delivery_method: 'DHL',
   },
   {
      id: 'ord-1004',
      order_id: 'A-1004',
      customer_name: 'Summit Retail',
      order_status: 'Delivered',
      region: 'East',
      sales_rep: 'S. Martin',
      order_value: '$5,420',
      last_updated: '2026-05-20 15:37',
      priority: 'Low',
      customer_email: 'support@summitretail.example',
      phone: '+1-617-555-0144',
      delivery_method: 'Local Pickup',
   },
   {
      id: 'ord-1005',
      order_id: 'A-1005',
      customer_name: 'Harbor Foods',
      order_status: 'Processing',
      region: 'SEA',
      sales_rep: 'A. Velez',
      order_value: '$18,720',
      last_updated: '2026-05-20 16:48',
      priority: 'High',
      customer_email: 'hello@harborfoods.example',
      phone: '+1-206-555-0155',
      delivery_method: 'FedEx',
   },
   {
      id: 'ord-1006',
      order_id: 'A-1006',
      customer_name: 'Nova Health',
      order_status: 'Delivered',
      region: 'West',
      sales_rep: 'M. Flores',
      order_value: '$9,910',
      last_updated: '2026-05-20 17:25',
      priority: 'Medium',
      customer_email: 'orders@novahealth.example',
      phone: '+1-503-555-0166',
      delivery_method: 'UPS',
   },
   {
      id: 'ord-1007',
      order_id: 'A-1007',
      customer_name: 'Atlas Manufacturing',
      order_status: 'Processing',
      region: 'East',
      sales_rep: 'D. Kumar',
      order_value: '$23,100',
      last_updated: '2026-05-20 18:00',
      priority: 'High',
      customer_email: 'sales@atlasmfg.example',
      phone: '+1-212-555-0177',
      delivery_method: 'Freight',
   },
   {
      id: 'ord-1008',
      order_id: 'A-1008',
      customer_name: 'Brightline Markets',
      order_status: 'Queued',
      region: 'Central',
      sales_rep: 'S. Martin',
      order_value: '$11,350',
      last_updated: '2026-05-20 18:45',
      priority: 'Medium',
      customer_email: 'procurement@brightline.example',
      phone: '+1-617-555-0188',
      delivery_method: 'DHL',
   },
   {
      id: 'ord-1009',
      order_id: 'A-1009',
      customer_name: 'Meridian Labs',
      order_status: 'Shipped',
      region: 'SEA',
      sales_rep: 'A. Velez',
      order_value: '$16,780',
      last_updated: '2026-05-20 19:10',
      priority: 'Medium',
      customer_email: 'laborders@meridian.example',
      phone: '+1-206-555-0199',
      delivery_method: 'UPS',
   },
   {
      id: 'ord-1010',
      order_id: 'A-1010',
      customer_name: 'Crescent Ventures',
      order_status: 'Processing',
      region: 'West',
      sales_rep: 'M. Flores',
      order_value: '$12,490',
      last_updated: '2026-05-20 19:42',
      priority: 'Low',
      customer_email: 'info@crescentventures.example',
      phone: '+1-415-555-0110',
      delivery_method: 'FedEx',
   },
   {
      id: 'ord-1011',
      order_id: 'A-1011',
      customer_name: 'Pioneer Foods',
      order_status: 'Delivered',
      region: 'Central',
      sales_rep: 'D. Kumar',
      order_value: '$7,980',
      last_updated: '2026-05-20 20:18',
      priority: 'Low',
      customer_email: 'orders@pioneerfoods.example',
      phone: '+1-312-555-0122',
      delivery_method: 'Local Carrier',
   },
   {
      id: 'ord-1012',
      order_id: 'A-1012',
      customer_name: 'Evergreen Retail',
      order_status: 'On Hold',
      region: 'East',
      sales_rep: 'S. Martin',
      order_value: '$19,620',
      last_updated: '2026-05-20 20:58',
      priority: 'High',
      customer_email: 'support@evergreen.example',
      phone: '+1-617-555-0133',
      delivery_method: 'FedEx',
   },
]

function App() {
   const [eventNote, setEventNote] = useState('Click a row, cell, or action to see the event hooks in action.')

   const describeEvent = (prefix, row, context) => {
      const columnLabel = context?.column?.headerName ?? 'row'
      setEventNote(`${prefix} ${row?.order_id ?? 'summary'} on ${columnLabel}`)
   }

   return (
      <main className="app-shell">

         <section className="grid-panel">
            <div className="grid-panel__header">
               <div>
                  <p className="eyebrow">Preview</p>
                  <h2>Rich data surface</h2>
               </div>
               <p className="grid-panel__caption">
                  Click rows or cells, use the action buttons, and watch the summary row
                  update as you page through the data.
               </p>
            </div>

            <div className="event-banner" role="status" aria-live="polite">
               {eventNote}
            </div>

            <DataGrid
               columns={columns}
               rows={rows}
               sortable
               filterable
               selection="single"
               visibleRowCount={4}
               pagination
               summary={{ label: 'Page total' }}
               onRowClick={(row, context) => describeEvent('Row clicked:', row, context)}
               onRowDoubleClick={(row, context) =>
                  describeEvent('Row double-clicked:', row, context)
               }
               onCellClick={(row, context) => describeEvent('Cell clicked:', row, context)}
               onCellDoubleClick={(row, context) =>
                  describeEvent('Cell double-clicked:', row, context)
               }
            />
         </section>

         <section className="grid-panel grid-panel--secondary">
            <div className="grid-panel__header">
               <div>
                  <p className="eyebrow">Footer demo</p>
                  <h2>No pagination navigator</h2>
               </div>
               <p className="grid-panel__caption">
                  When pagination is hidden, the footer can carry status messages or
                  contextual notes instead of leaving the bottom edge blank.
               </p>
            </div>

            <DataGrid
               columns={columns.slice(0, 4)}
               rows={rows.slice(0, 3)}
               footer={{ content: 'Showing a short dataset with footer messaging enabled.' }}
               visibleRowCount={3}
            />
         </section>
      </main>
   )
}

export default App
