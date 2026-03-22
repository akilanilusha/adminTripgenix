import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Users, Calendar, DollarSign, Car } from "lucide-react";
import CalendarComponent from "react-calendar";
import "react-calendar/dist/Calendar.css";
import driverApi from "@/api/DriverApi";
import bookingApi from "@/api/ToursApi";
import axios from "axios"; // ✅ added

export default function Dashboard() {
  // ================= STATES =================

  const [summary, setSummary] = useState({
    availableDrivers: 0,
    newBookingsToday: 0,
    newDriversThisMonth: 0,
    todayEarnings: 0,
  });

  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ================= LOAD DATA =================

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      // 1️⃣ Available Drivers
      const approvedDriversRes = await driverApi.getApprovedDrivers();
      const availableDrivers = approvedDriversRes.data.length;

      // 2️⃣ All Drivers (for new drivers this month)
      const allDriversRes = await driverApi.getAllDrivers();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const newDriversThisMonth = allDriversRes.data.filter((driver) => {
        if (!driver.createdAt || driver.approved !== false) return false;

        const created = new Date(driver.createdAt);

        return (
          created.getMonth() === currentMonth &&
          created.getFullYear() === currentYear
        );
      }).length;

      // 3️⃣ All Tours
      const allToursRes = await bookingApi.getAllTours();
      const tours = allToursRes.data;

      // Calendar Data
      const calendarData = tours.map((tour) => ({
        date: tour.startDate?.split("T")[0],
        refId: tour.referenceId,
      }));

      console.log("Tour Start Date:", calendarData);
      setCalendarBookings(calendarData);

      // 4️⃣ Started Tours (ONGOING)
      const startedRes = await bookingApi.getStartedTours();
      setTodayBookings(startedRes.data);

      // 5️⃣ New Tours Today
      const newToursRes = await bookingApi.getNewTours();
      const newBookingsToday = newToursRes.data.length;

      // ================= WEEKLY REVENUE FROM EARNINGS API =================

      const earningsRes = await axios.get(
        "http://13.218.211.254:8095/api/v1/reportgenerate/earnings"
      );

      const earnings = earningsRes.data.data || [];

      const weekTemplate = [
        { day: "Mon", revenue: 0 },
        { day: "Tue", revenue: 0 },
        { day: "Wed", revenue: 0 },
        { day: "Thu", revenue: 0 },
        { day: "Fri", revenue: 0 },
        { day: "Sat", revenue: 0 },
        { day: "Sun", revenue: 0 },
      ];

      earnings.forEach((item) => {
        if (!item.paymentDateTime) return;

        const date = new Date(item.paymentDateTime);
        const dayIndex = date.getDay(); // 0 = Sunday

        const mapIndex = dayIndex === 0 ? 6 : dayIndex - 1;

        weekTemplate[mapIndex].revenue += Number(item.amount) || 0;
      });

      setWeeklyRevenue(weekTemplate);

      // 7️⃣ Today Earnings
      const today = new Date().toISOString().split("T")[0];
      const todayEarnings = tours
        .filter((tour) => tour.startDate?.startsWith(today))
        .reduce((sum, tour) => sum + (tour.totalCost || 0), 0);

      // 8️⃣ Set Summary
      setSummary({
        availableDrivers,
        newBookingsToday,
        newDriversThisMonth,
        todayEarnings,
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  }

  // ================= CALENDAR HELPERS =================

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getBookingForDate = (date) => {
    return calendarBookings.find((b) => b.date === formatDate(date));
  };

  // ================= STAT CARDS =================

  const stats = [
    {
      title: "Available Drivers",
      value: summary.availableDrivers,
      icon: <Users size={22} />,
      gradient: "from-green-500 to-green-700",
    },
    {
      title: "New Bookings (Today)",
      value: summary.newBookingsToday,
      icon: <Calendar size={22} />,
      gradient: "from-blue-500 to-blue-700",
    },
    {
      title: "New Drivers (This Month)",
      value: summary.newDriversThisMonth,
      icon: <Car size={22} />,
      gradient: "from-purple-500 to-purple-700",
    },
    {
      title: "Today Earnings",
      value: `Rs. ${summary.todayEarnings.toLocaleString()}`,
      icon: <DollarSign size={22} />,
      gradient: "from-orange-500 to-orange-700",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          TripGenix Admin Dashboard
        </h1>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl text-white bg-gradient-to-r ${item.gradient} shadow-lg hover:scale-105 transition`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm opacity-90">{item.title}</p>
              {item.icon}
            </div>
            <h2 className="text-3xl font-bold mt-3">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* ================= CHART + CALENDAR ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Weekly Revenue (LKR)
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Calendar */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Tour Booking Calendar
          </h2>

          <CalendarComponent
            onChange={setSelectedDate}
            value={selectedDate}
            className="custom-calendar w-full"
            tileContent={({ date, view }) => {
              if (view === "month") {
                const booking = getBookingForDate(date);
                if (booking) {
                  return (
                    <div
                      className="mt-1 text-xs text-white bg-blue-500 rounded px-1 text-center"
                      title={`Reference ID: ${booking.refId}`}
                    >
                      Booked
                    </div>
                  );
                }
              }
            }}
          />
        </div>
      </div>

      {/* ================= TODAY BOOKINGS ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Today Ongoing Bookings
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="py-3 px-2">Booking ID</th>
                <th className="px-2">Customer</th>
                <th className="px-2">Tour</th>
                <th className="px-2">Driver</th>
                <th className="px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((booking) => (
                <tr
                  key={booking.bookingId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-2">{booking.bookingId}</td>
                  <td className="px-2">{booking.customerName}</td>
                  <td className="px-2">{booking.tourName}</td>
                  <td className="px-2">{booking.driverName}</td>
                  <td className="px-2 text-green-600 font-semibold">
                    {booking.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400">
        TripGenix © {new Date().getFullYear()} – Admin Panel
      </p>
    </div>
  );
}