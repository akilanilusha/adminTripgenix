import React, { useEffect, useState } from "react";
import { Search, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../../api/ToursApi";

export default function AllTours() {
  const navigate = useNavigate();

  // 🔹 Filters
  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  // 🔹 Data
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 LOAD ALL BOOKINGS
  useEffect(() => {
    setLoading(true);
    bookingApi
      .getAllTours()
      .then((res) => {
        setTours(res.data);
        console.log(res.data);
        setFilteredTours(res.data);
      })
      .catch((err) => {
        console.error("Failed to load bookings", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 SEARCH HANDLER
  const handleSearch = () => {
    const results = tours.filter((tour) => {
      // Reference ID
      const matchesRef = searchRef
        ? tour.referenceId?.toLowerCase().includes(searchRef.toLowerCase())
        : true;

      // Created date
      const createdDate = tour.createdAt ? new Date(tour.createdAt) : null;

      const matchesStartDate = startDate
        ? createdDate && createdDate >= new Date(startDate)
        : true;

      const matchesEndDate = endDate
        ? createdDate && createdDate <= new Date(endDate)
        : true;

      // Status
      const matchesStatus = status ? tour.status === status : true;

      return matchesRef && matchesStartDate && matchesEndDate && matchesStatus;
    });

    setFilteredTours(results);
  };

  // 🔹 CLEAR FILTERS
  const clearFilters = () => {
    setSearchRef("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setFilteredTours(tours);
  };

  // 🔹 STATUS BADGE
  const statusBadge = (status) => {
    const styles = {
      NEW: "bg-blue-100 text-blue-700",
      ONGOING: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-gray-900">All Tours</h2>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Reference ID */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Reference ID"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none"
          />
        </div>

        {/* Start Date */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded-lg px-4 py-2.5 outline-none"
        />

        {/* End Date */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-lg px-4 py-2.5 outline-none"
        />

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-4 py-2.5 outline-none"
        >
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* SEARCH */}
        <button
          onClick={handleSearch}
          className="bg-slate-800 hover:bg-slate-600 text-white rounded-lg"
        >
          Search
        </button>

        {/* CLEAR */}
        <button
          onClick={clearFilters}
          className="border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Reference ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Created Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredTours.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No tours found
                </td>
              </tr>
            ) : (
              filteredTours.map((tour) => (
                <tr key={tour.bookingId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-salt-600">
                    {tour.referenceId}
                  </td>
                  <td className="px-4 py-3">{tour.bookerName}</td>
                  <td className="px-4 py-3">{tour.route?.join(" → ")}</td>
                  <td className="px-4 py-3">
                    {tour.createdAt?.substring(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                        tour.status,
                      )}`}
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`viewTour/${tour.bookingId}`)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`edit/${tour.bookingId}`)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
