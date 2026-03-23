import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Eye,
  Pencil,
  MailCheck,
  Send,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import bookingApi from "../../api/ToursApi";

import { Client } from "@stomp/stompjs";

export default function NewTours() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 LOAD DATA
  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    if (location.state?.reload) {
      loadTours();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

useEffect(() => {
  const client = new Client({
    brokerURL: "ws://localhost:8087/ws",
    reconnectDelay: 5000,
    debug: (str) => console.log(str),

    onConnect: () => {
      // console.log("✅ NewTours WebSocket connected");

      client.subscribe("/topic/new-tour-add", (message) => {
        // console.log("📢 New tour added:", message.body);
        loadTours(); // 🔥 refresh list
      });
    },

    onStompError: (frame) => {
      // console.error("❌ Broker error:", frame.headers["message"]);
    },

    onWebSocketClose: () => {
      // console.warn("⚠️ WebSocket connection closed");
    },
  });

  client.activate();

  return () => {
    client.deactivate();
    // console.log("🔌 NewTours WebSocket disconnected");
  };
}, []);


  const loadTours = () => {
    setLoading(true);
    bookingApi
      .getNewTours()
      .then((res) => {
        setTours(res.data);
        setFilteredTours(res.data);
      })
      .catch((err) => {
        console.error("Failed to load tours", err);
      })
      .finally(() => setLoading(false));
  };

  // SEARCH HANDLER
  const handleSearch = () => {
    const results = tours.filter((tour) => {
      const matchesRef = searchRef
        ? tour.referenceId?.toLowerCase().includes(searchRef.toLowerCase())
        : true;

      const tourDate = tour.startDate ? new Date(tour.startDate) : null;

      const matchesStartDate = startDate
        ? tourDate >= new Date(startDate)
        : true;

      const matchesEndDate = endDate ? tourDate <= new Date(endDate) : true;

      return matchesRef && matchesStartDate && matchesEndDate;
    });

    setFilteredTours(results);
  };

  // 🔹 CLEAR FILTERS
  const clearFilters = () => {
    setSearchRef("");
    setStartDate("");
    setEndDate("");
    setFilteredTours(tours);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">New Tours</h2>

        <button
          onClick={() => navigate("add-new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow"
        >
          <Plus size={18} />
          Add New Tour
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Reference ID"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>

        <div className="relative">
          <Calendar
            className="absolute left-3 top-3.5 text-gray-400"
            size={18}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>

        <div className="relative">
          <Calendar
            className="absolute left-3 top-3.5 text-gray-400"
            size={18}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Search
        </button>

        <button
          onClick={clearFilters}
          className="border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
         <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">Reference ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              {/* <th className="px-4 py-3 text-center">Is send Mail</th> */}
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
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {tour.referenceId}
                  </td>
                  <td className="px-4 py-3">{tour.bookerName}</td>
                  <td className="px-4 py-3">{tour.route?.join(" → ")}</td>
                  <td className="px-4 py-3">
                    {tour.startDate?.substring(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {tour.status}
                    </span>
                  </td>
                  {/* <td className="px-4 py-3 text-center ">
                    {tour.sendConfirmEmail ? (
                      <button className="p-2 rounded-lg  bg-green-100 hover:bg-green-200 text-green-700">
                        <MailCheck size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/trips/send-email-view/${tour.bookingId}`)
                        }
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </td> */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`view/${tour.bookingId}`)
                        }
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`edit/${tour.bookingId}`)
                        }
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
    </div>
  );
}
