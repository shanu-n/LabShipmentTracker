'use client';

import { useEffect, useState } from 'react';
import AddShipmentForm from '../components/AddShipmentForm';
import ShipmentsList from '../components/ShipmentsList';

// Type matching your Supabase table structure
type Shipment = {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  expected_delivery_date: string | null;
  sample_type: string | null;
  priority: string | null;
  date_created: string;
  date_received: string | null;
};

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/shipments');
      const data = await res.json();
      setShipments(data.shipments || []);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <AddShipmentForm onAdd={fetchShipments} />
      <ShipmentsList shipments={shipments} onMarkAsReceived={fetchShipments} />
    </main>
  );
}
