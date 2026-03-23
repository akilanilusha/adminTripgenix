import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function TourReports() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8095/api/v1/reportgenerate/tours";

  /* ============================
     LOAD ALL TOURS
  ============================ */

  useEffect(() => {
    fetchAllTours();
  }, []);

  const fetchAllTours = async () => {

    try {

      setLoading(true);

      const res = await axios.get(API);

      setTours(res.data || []);

    } catch (err) {
      console.error("Tour load error:", err);
    } finally {
      setLoading(false);
    }

  };

  /* ============================
     FILTER BY DATE
  ============================ */

  const generateReport = async () => {

    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.get(API, {
        params: {
          from: fromDate,
          to: toDate
        }
      });

      setTours(res.data || []);

    } catch (err) {
      console.error("Report load error:", err);
    } finally {
      setLoading(false);
    }

  };

  /* ============================
     EXPORT PDF
  ============================ */

  const exportPDF = () => {

  if (tours.length === 0) return;

  const doc = new jsPDF();

  /* ===== HEADER ===== */

  doc.setFontSize(20);
  doc.text("TripGenix", 14, 15);

  doc.setFontSize(12);
  doc.text("Tour Report", 14, 22);

  doc.setFontSize(10);

  const today = new Date().toLocaleDateString();

  doc.text(`Generated: ${today}`, 150, 15);

  if (fromDate && toDate) {
    doc.text(`Date Range: ${fromDate} - ${toDate}`, 14, 28);
  }

  /* ===== TABLE DATA ===== */

  const tableData = tours.map((t) => [
    t.referenceid || t.referenceId,
    t.touristname || t.touristName,
    new Date(t.startdate || t.startDate).toLocaleDateString(),
    new Date(t.enddate || t.endDate).toLocaleDateString(),
    t.drivername || t.driverName || "-",
    t.vehiclename || t.vehicleName || "-",
    t.packagename || t.packageName || "-",
    `LKR ${Number(t.cost).toLocaleString()}`
  ]);

  /* ===== TABLE ===== */

  autoTable(doc, {
    startY: 35,

    head: [[
      "Reference",
      "Tourist",
      "Start Date",
      "End Date",
      "Driver",
      "Vehicle",
      "Package",
      "Cost"
    ]],

    body: tableData,

    theme: "grid",

    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      halign: "center"
    },

    bodyStyles: {
      halign: "center"
    },

    styles: {
      fontSize: 9
    }
  });

  /* ===== SUMMARY ===== */

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);

  doc.text(
    `Total Tours: ${tours.length}`,
    14,
    finalY
  );

  /* ===== FOOTER ===== */

  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(9);
  doc.text(
    "TripGenix Tourism Management System",
    14,
    pageHeight - 10
  );

  doc.save("tripgenix-tour-report.pdf");
};

  /* ============================
     EXPORT EXCEL
  ============================ */

  const exportExcel = () => {

    if (tours.length === 0) return;

    const worksheetData = tours.map((t) => ({
      Reference: t.referenceid || t.referenceId,
      Tourist: t.touristname || t.touristName,
      StartDate: t.startdate || t.startDate,
      EndDate: t.enddate || t.endDate,
      Driver: t.drivername || t.driverName,
      Vehicle: t.vehiclename || t.vehicleName,
      Package: t.packagename || t.packageName,
      Cost: t.cost
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tours");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const data = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(data, "tour-report.xlsx");
  };

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Tour Reports</h1>

      {/* FILTER */}

      <div className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row gap-4 md:items-end">

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">From Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">To Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          onClick={generateReport}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Generate
        </button>

        <button
          disabled={tours.length === 0}
          onClick={exportPDF}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-40"
        >
          Export PDF
        </button>

        <button
          disabled={tours.length === 0}
          onClick={exportExcel}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-40"
        >
          Export Excel
        </button>

      </div>

      {/* TABLE */}

      <div className="bg-white shadow rounded-lg overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Tourist</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Package</th>
              <th className="p-3 text-left">Cost</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  Loading report...
                </td>
              </tr>
            )}

            {!loading && tours.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  No tours found
                </td>
              </tr>
            )}

            {tours.map((tour, index) => (

              <tr key={index} className="border-t">

                <td className="p-3">{tour.referenceid || tour.referenceId}</td>
                <td className="p-3">{tour.touristname || tour.touristName}</td>

                <td className="p-3">
                  {new Date(tour.startdate || tour.startDate).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {new Date(tour.enddate || tour.endDate).toLocaleDateString()}
                </td>

                <td className="p-3">{tour.drivername || tour.driverName || "-"}</td>
                <td className="p-3">{tour.vehiclename || tour.vehicleName || "-"}</td>
                <td className="p-3">{tour.packagename || tour.packageName || "-"}</td>

                <td className="p-3 font-semibold text-green-600">
                  LKR {tour.cost}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default TourReports;