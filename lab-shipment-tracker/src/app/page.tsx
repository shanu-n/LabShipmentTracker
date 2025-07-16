'use client';

import { useEffect, useState } from 'react';
import AddShipmentForm from '../components/AddShipmentForm';
import ShipmentsList from '../components/ShipmentsList';

// Type matching your Supabase table structure
type Shipment = {
  id: string;
  trackingnumber: string;
  carrier: string;
  status: string;
  expecteddelivery: string | null;
  sampletype: string | null;
  priority: string | null;
  datecreated: string;
  datereceived: string | null;
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
