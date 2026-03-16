import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import bookingApi from "@/api/ToursApi";
import vehicleApi from "@/api/vehicleApi";
import driverApi from "@/api/DriverApi";
import RouteMap from "./RouteMap";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ViewTour() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [routeDetails, setRouteDetails] = useState({
    routeData: null,
    distance: 0,
    duration: 0,
  });

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (data?.tripDetails?.startLocation && data?.tripDetails?.endLocation) {
      calculateShortestPath();
    }
  }, [data]);

  async function loadAll() {
    const [bookingRes, vehicleRes, driverRes] = await Promise.all([
      bookingApi.getBookingById(id),
      vehicleApi.getVehicleNumbers(),
      driverApi.getAllDrivers(),
    ]);

    const booking = bookingRes.data;

    console.log("Booking:", booking);

    setData(booking);
    setVehicles(vehicleRes.data);
    setDrivers(driverRes.data);

    setRouteDetails({
      routeData: booking.routeDetails?.routeData || null,
      distance: booking.routeDetails?.distance || 0,
      duration: booking.routeDetails?.duration || 0,
    });
  }

  if (!data) return null;

  const selectedVehicle = vehicles.find(
    (v) => v.vehicleId === data.resources?.vehicle?.vehicleId
  );

  const selectedDriver = drivers.find(
    (d) => d.driverId === data.resources?.driver?.driverId
  );

  const tripDetails = {
    startLocation: data.tripDetails.startLocation,
    endLocation: data.tripDetails.endLocation,
    destinations: data.tripDetails.destinations || [],
  };

  async function calculateShortestPath() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_GOOGLE_MAPS_API_URL}/api/maps/shortest-route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: data.tripDetails.startLocation,
            end: data.tripDetails.endLocation,
            waypoints: data.tripDetails.destinations || [],
            mode: "DRIVING",
          }),
        }
      );

      const routeData = await res.json();

      setRouteDetails({
        routeData,
        distance: routeData.distance,
        duration: routeData.duration,
      });
    } catch (err) {
      console.error("Failed to load route map", err);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumb
        title="View Trip"
        paths={["Trips", data.referenceId, "View"]}
      />

      <div className="space-y-10">
        <div className="text-xl font-semibold">
          Reference ID : {data.referenceId}
        </div>

        {/* BOOKER DETAILS */}
        <Section title="Booker Details">
          <Grid>
            <ReadOnly label="Booker Name" value={data.bookingDetails.nameOfBooker} />
            <ReadOnly label="Email" value={data.bookingDetails.bookerEmail} />
            <ReadOnly label="Phone" value={data.bookingDetails.bookerPhone} />
            <ReadOnly label="Flight Number" value={data.bookingDetails.flightNumber} />
            <ReadOnly label="Passport" value={data.bookingDetails.passportNumber} />
            <ReadOnly label="Arrival Airport" value={data.bookingDetails.departureAirport} />
            <ReadOnly label="Adults" value={data.bookingDetails.passengers.adults} />
            <ReadOnly label="Children" value={data.bookingDetails.passengers.children} />
            <ReadOnly label="Babies" value={data.bookingDetails.passengers.babies} />
          </Grid>
        </Section>

        {/* TRIP DETAILS */}
        <Section title="Trip Details">
          <Grid>
            <ReadOnly label="Start Date" value={data.tripDetails.startDate} />
            <ReadOnly label="End Date" value={data.tripDetails.endDate} />
          </Grid>

          <ReadOnly full label="Start Location" value={data.tripDetails.startLocation} />
          <ReadOnly full label="End Location" value={data.tripDetails.endLocation} />

          {/* DESTINATIONS */}
          <Section title="Destinations">
            <div className="space-y-3">
              {tripDetails.destinations.length > 0 ? (
                tripDetails.destinations.map((dest, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-4 py-3 rounded-sm text-gray-800 flex items-center gap-3"
                  >
                    <span className="font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="truncate">{dest}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  No destinations added
                </p>
              )}
            </div>
          </Section>

          {routeDetails.routeData && (
            <RouteMap
              routeDetails={routeDetails}
              setRouteDetails={() => {}}
              tripDetails={tripDetails}
            />
          )}
        </Section>

        {/* VEHICLE */}
        <Section title="Vehicle">
          {selectedVehicle ? (
            <div className="border p-4 rounded-sm space-y-1">
              <p>
                <span className="font-medium">Vehicle Number:</span>{" "}
                {selectedVehicle.numberPlate ||
                  selectedVehicle.vehicleNumber ||
                  "—"}
              </p>

              <p>
                <span className="font-medium">Passenger Count:</span>{" "}
                {selectedVehicle.passengerCount || "—"}
              </p>

              <p>
                <span className="font-medium">Cost Per Km:</span>{" "}
                LKR {selectedVehicle.costPerKm?.toFixed(2) || "—"}
              </p>

              <p>
                <span className="font-medium">Booking Price:</span>{" "}
                LKR {selectedVehicle.bookingPrice?.toFixed(2) || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              No vehicle allocated
            </p>
          )}
        </Section>

        {/* DRIVER */}
        <Section title="Driver">
          {selectedDriver ? (
            <div className="bg-gray-100 p-4 rounded-xl space-y-1">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {selectedDriver.firstName} {selectedDriver.lastName}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {selectedDriver.phone1 || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              No driver allocated
            </p>
          )}
        </Section>

        {/* COST */}
        <div className="bg-muted p-4 rounded flex justify-between text-lg font-semibold">
          <span>Total Cost</span>
          <span>LKR {data.routeDetails.bookingPrice.toFixed(2)}</span>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>

          <Button
            onClick={() => navigate(`/trips/edit/${id}`)}
            className="bg-blue-700 hover:bg-blue-900 text-white"
          >
            Edit Trip
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =============================
REUSABLE COMPONENTS
============================= */

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-md shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
  );
}

function ReadOnly({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <label className="text-sm font-medium">{label}</label>
      <Input value={value ?? "-"} disabled />
    </div>
  );
}