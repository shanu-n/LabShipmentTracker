import { supabase } from './lib/supabaseClient'

export default async function Home() {
  const { data, error } = await supabase.from('shipments').select('*')
  
  // Debug logging
  console.log('Data:', data)
  console.log('Error:', error)
  console.log('Data length:', data?.length)
  
  if (error) {
    console.error('Error fetching data:', error)
    return <div>Error loading data: {error.message}</div>
  }

  if (!data || data.length === 0) {
    return <div>No shipments found</div>
  }

  return (
    <div>
      <h1>Lab Shipment Tracker</h1>
      <p>Found {data.length} shipments</p>
      {data?.map(shipment => (
        <div key={shipment.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>Tracking: {shipment.tracking_number}</p>
          <p>Carrier: {shipment.carrier}</p>
          <p>Status: {shipment.status}</p>
          <p>Sample Type: {shipment.sample_type}</p>
          <p>Priority: {shipment.priority}</p>
        </div>
      ))}
    </div>
  )
}