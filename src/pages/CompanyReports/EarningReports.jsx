import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function EarningReports() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [earnings, setEarnings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8095/api/v1/reportgenerate/earnings";

  /* ======================
     LOAD ALL DATA ON PAGE LOAD
  ====================== */

  useEffect(() => {
    fetchAllEarnings();
  }, []);

  const fetchAllEarnings = async () => {
    try {

      setLoading(true);

      const res = await axios.get(API);

      console.log("All earnings:", res.data);

      const data = res.data.data || [];

      setEarnings(data);
      setTotal(res.data.totalEarnings || 0);

    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     FILTER BY DATE
  ====================== */

  const fetchReport = async () => {

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

      console.log("Filtered report:", res.data);

      const data = res.data.data || [];

      setEarnings(data);
      setTotal(res.data.totalEarnings || 0);

    } catch (err) {
      console.error("Report load error:", err);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }

  };

  /* ======================
     EXPORT PDF
  ====================== */

  const exportPDF = () => {

  if (earnings.length === 0) return;

  const doc = new jsPDF();

  /* ===== HEADER ===== */

  doc.setFontSize(20);
  doc.text("TripGenix", 14, 15);

  doc.setFontSize(12);
  doc.text("Earnings Report", 14, 22);

  doc.setFontSize(10);

  const today = new Date().toLocaleDateString();

  doc.text(`Generated: ${today}`, 150, 15);

  if (fromDate && toDate) {
    doc.text(`Date Range: ${fromDate} - ${toDate}`, 14, 28);
  }

  /* ===== TABLE ===== */

  const tableData = earnings.map((item) => [
    item.paymentDateTime
      ? new Date(item.paymentDateTime).toLocaleDateString()
      : "-",
    `LKR ${Number(item.amount).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 35,

    head: [["Payment Date", "Amount"]],

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
      fontSize: 10
    }
  });

  /* ===== TOTAL ===== */

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setTextColor(40);

  doc.text(
    `Total Earnings: LKR ${Number(total).toLocaleString()}`,
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

  doc.save("tripgenix-earnings-report.pdf");
};

  /* ======================
     EXPORT EXCEL
  ====================== */

  const exportExcel = () => {

    if (earnings.length === 0) return;

    const worksheetData = earnings.map((item) => ({
      Date: item.paymentDateTime
        ? new Date(item.paymentDateTime).toLocaleDateString()
        : "-",
      Amount: item.amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Earnings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const data = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(data, "earnings-report.xlsx");
  };

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Earning Report</h1>

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
          onClick={fetchReport}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Generate"}
        </button>

        <button
          disabled={earnings.length === 0}
          onClick={exportPDF}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-40"
        >
          Export PDF
        </button>

        <button
          disabled={earnings.length === 0}
          onClick={exportExcel}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-40"
        >
          Export Excel
        </button>

      </div>


      {/* TOTAL */}

      <div className="bg-green-100 border border-green-300 p-4 rounded">

        <h2 className="text-lg font-semibold">
          Total Earnings: LKR {Number(total).toLocaleString()}
        </h2>

      </div>


      {/* TABLE */}

      <div className="bg-white shadow rounded-lg overflow-x-auto">

        <table className="w-full text-sm min-w-[400px]">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Payment Date</th>
              <th className="p-3 text-left">Amount</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="2" className="text-center p-6">
                  Loading report...
                </td>
              </tr>
            )}

            {!loading && earnings.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center p-6 text-gray-500">
                  No data found
                </td>
              </tr>
            )}

            {earnings.map((item, index) => (
              <tr key={index} className="border-t">

                <td className="p-3">
                  {item.paymentDateTime
                    ? new Date(item.paymentDateTime).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3 font-semibold text-green-600">
                  LKR {Number(item.amount).toLocaleString()}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default EarningReports;