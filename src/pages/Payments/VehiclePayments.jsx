import React, { useEffect, useState } from "react";
import axios from "axios";

function VehiclePayments() {

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8087/paymentcontroller/vehicel-payments"
      );

      console.log("Vehicle Payments:", res.data);
      setPayments(res.data);

    } catch (error) {
      console.error("Error fetching vehicle payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "CONFIRM":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await axios.put(
        `http://localhost:8087/paymentcontroller/vehicle-payments/${id}/mark-paid`
      );

      loadPayments();
    } catch (error) {
      console.error("Error marking vehicle payment as paid:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Vehicle Payments
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and track vehicle payout records
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">

            <thead className="border-b text-gray-600">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="px-3">Reference ID</th>
                <th className="px-3">Vehicle</th>
                <th className="px-3">Amount (LKR)</th>
                <th className="px-3">Status</th>
                <th className="px-3">Payment Date</th>
                <th className="px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-3 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-3 font-semibold">
                      {payment.refereeId}
                    </td>

                    <td className="px-3">
                      {payment.vehicleNumber}
                    </td>

                    <td className="px-3 font-semibold">
                      Rs. {Number(payment.amount).toLocaleString()}
                    </td>

                    <td className="px-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-3 text-gray-500">
                      {new Date(payment.paymentDateTime).toLocaleString()}
                    </td>

                    <td className="px-3 text-center">
                      {payment.status !== "PAID" && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default VehiclePayments;
