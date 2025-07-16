'use client';

import { useState } from 'react';

type Props = {
  onAdd: () => void;
};

export default function AddShipmentForm({ onAdd }: Props) {
  const [form, setForm] = useState({
    trackingNumber: '',
    carrier: 'FedEx',
    sampleType: '',
    priority: 'Medium', // default value
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    onAdd();

    setForm({
      trackingNumber: '',
      carrier: 'FedEx',
      sampleType: '',
      priority: 'Medium',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Add New Shipment</h2>

      <input
        name="trackingNumber"
        placeholder="Tracking Number"
        value={form.trackingNumber}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded text-black placeholder-gray-500"
      />

      <select
        name="carrier"
        value={form.carrier}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black"
      >
        <option value="FedEx">FedEx</option>
        <option value="UPS">UPS</option>
        <option value="DHL">DHL</option>
      </select>

      <input
        name="sampleType"
        placeholder="Sample Type"
        value={form.sampleType}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black placeholder-gray-500"
      />

      {/* 🔽 Priority Dropdown */}
      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold">
        Add Shipment
      </button>
    </form>
  );
}
