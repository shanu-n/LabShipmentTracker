'use client';
import { useState } from 'react';
import AddShipmentForm from './AddShipmentForm';
import { DateTime } from 'luxon'; // ✅ Import Luxon

type Shipment = {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  sample_type: string | null;
  priority: string | null;
  expected_delivery_date: string | null;
  date_received: string | null;
};

type Props = {
  shipments: Shipment[];
  onMarkAsReceived: () => void;
};

export default function ShipmentsList({ shipments, onMarkAsReceived }: Props) {
  const [showReceived, setShowReceived] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);

  const itemsPerPage = 10;

  const activeShipments = shipments.filter((s) => !s.date_received);
  const receivedShipments = shipments.filter((s) => s.date_received);

  const paginateItems = (items: Shipment[], pageNumber: number) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const currentActiveShipments = paginateItems(activeShipments, activePage);
  const currentReceivedShipments = paginateItems(receivedShipments, receivedPage);

  const markAsReceived = async (id: string) => {
    await fetch(`/api/shipments/${id}`, {
      method: 'PATCH',
    });
    setSuccess('Shipment marked as received!');
    onMarkAsReceived();
    setTimeout(() => setSuccess(null), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600';
      case 'Delayed':
        return 'bg-red-600';
      case 'Out for Delivery':
        return 'bg-blue-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
  
    return DateTime.fromISO(iso, { zone: 'utc' }) // ⏰ Treat as UTC
      .setZone('America/Los_Angeles') // 🌎 Convert to Pacific Time
      .toFormat("cccc, M/d/yy 'at' h:mm a"); // 🗓️ Exact format like FedEx
  };
  
  

  const PaginationControls = ({
    total,
    currentPage,
    setPage,
  }: {
    total: number;
    currentPage: number;
    setPage: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, total);
    const hasResults = total > 0;

    return (
      <div className="mt-4 flex items-center justify-between px-4">
        <div className="text-sm text-gray-700">
          Showing {total > 0 ? startIndex + 1 : 0}-{endIndex} of {total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || !hasResults}
            className={`px-3 py-1 rounded border transition-colors ${
              currentPage === 1 || !hasResults
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || !hasResults}
            className={`px-3 py-1 rounded border transition-colors ${
              currentPage === totalPages || !hasResults
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 w-full px-6 py-6 bg-[#f5f7fa] rounded shadow-xl overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold text-[#003366] uppercase tracking-wide">Current Shipments</h2>
        <button
          onClick={() => setShowReceived((prev) => !prev)}
          className="px-6 py-2 bg-[#0059c2] text-white rounded hover:bg-[#0044a8]"
        >
          {showReceived ? 'Hide Received Shipments' : 'Show Received Shipments'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-lg font-medium text-[#1c1c1e]">
          <thead className="sticky top-0 bg-[#003366] text-white text-left text-sm uppercase tracking-wider">
            <tr>
              <th className="p-1 border">Tracking Number</th>
              <th className="p-1 border">Status</th>
              <th className="p-1 border">Carrier</th>
              <th className="p-1 border">Shipment Type</th>
              <th className="p-1 border">Priority</th>
              <th className="p-1 border">Expected Delivery</th>
              <th className="p-1 border">Date Received</th>
              <th className="p-1 border">Action</th>
            </tr>
          </thead>
          <tbody>
            <AddShipmentForm onAdd={onMarkAsReceived} />
            {success && (
              <tr>
                <td colSpan={8}>
                  <div className="my-2 mx-2 px-4 py-2 text-sm rounded bg-green-100 text-green-800 border border-green-300">
                    {success}
                  </div>
                </td>
              </tr>
            )}
            {currentActiveShipments.map((s) => (
              <tr key={s.id} className="border-t text-gray-900">
                <td className="p-1 border font-mono text-base">{s.tracking_number}</td>
                <td className="p-1 border text-center">
                  <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(s.status)}`}>{s.status}</span>
                </td>
                <td className="px-3 py-1 border">{s.carrier}</td>
                <td className="px-3 py-1 border">{s.sample_type || '—'}</td>
                <td className="px-3 py-1 border">{s.priority || '—'}</td>
                <td className="px-3 py-1 border">
                  {s.status === 'Delivered' && s.date_received
                    ? formatDate(s.date_received)
                    : formatDate(s.expected_delivery_date)}
                </td>
                <td className="px-3 py-1 border">{formatDate(s.date_received)}</td>
                <td className="px-3 py-1 border">
                  {s.date_received ? (
                    <button
                      disabled
                      className="bg-green-600 text-white px-4 py-2 rounded cursor-not-allowed"
                    >
                      ✓ Received
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsReceived(s.id)}
                      className="bg-[#0059c2] text-white text-sm px-6 py-1 rounded hover:bg-[#0044a8]"
                    >
                      Mark as Received
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls
        total={activeShipments.length}
        currentPage={activePage}
        setPage={setActivePage}
      />

      {showReceived && (
        <div className="mt-8 bg-white p-1 rounded shadow">
          <h3 className="text-xl font-semibold mb-3 text-[#003366]">Received Shipments</h3>
          <table className="min-w-full table-auto border text-base text-[#1c1c1e]">
            <thead className="bg-[#dbe9f4] text-left">
              <tr>
                <th className="p-1 border">Tracking Number</th>
                <th className="p-1 border">Carrier</th>
                <th className="p-1 border">Shipment Type</th>
                <th className="p-1 border">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {currentReceivedShipments.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-1 border font-mono">{s.tracking_number}</td>
                  <td className="p-1 border">{s.carrier}</td>
                  <td className="p-1 border">{s.sample_type || '—'}</td>
                  <td className="p-1 border">{formatDate(s.date_received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            total={receivedShipments.length}
            currentPage={receivedPage}
            setPage={setReceivedPage}
          />
        </div>
      )}
    </div>
  );
}


//pushing by adding comment