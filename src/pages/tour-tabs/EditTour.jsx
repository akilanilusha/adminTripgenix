import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import bookingApi from "@/api/ToursApi";
import vehicleApi from "@/api/vehicleApi";
import driverApi from "@/api/DriverApi";
import DynamicList from "@/components/DynamicList";
import GooglePlaceInput from "@/components/GooglePlaceInput";
import RouteMap from "./RouteMap";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditTour() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);

  /* ======================
     FORM
  ====================== */
  const form = useForm({
    defaultValues: {
      destinations: [],
      vehicleId: null,
      driverId: null,
      adults: 0,
      children: 0,
      babies: 0,
    },
  });

  /* ======================
     ROUTE STATE
  ====================== */
  const [routeDetails, setRouteDetails] = useState({
    routeData: null,
    distance: 0,
    duration: 0,
  });

  /* ======================
     DERIVED TRIP DATA
  ====================== */
  const tripDetails = {
    startLocation: form.watch("startLocation"),
    endLocation: form.watch("endLocation"),
    destinations: (form.watch("destinations") || []).map((d) => d.location),
  };

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    loadSupportingData();
    loadBooking();
  }, []);

  async function loadSupportingData() {
    try {
      const [resVehicles, resDrivers] = await Promise.all([
        vehicleApi.getVehicleNumbers(),
        driverApi.getAllDrivers(),
      ]);

      setVehicleOptions(
        resVehicles.data.map((v) => ({
          value: v.vehicleId,
          label: v.numberPlate || v.vehicleNumber,
        })),
      );

      setDriverOptions(
        resDrivers.data.map((d) => ({
          value: d.driverId,
          label: `${d.firstName} ${d.lastName}`,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBooking() {
    const res = await bookingApi.getBookingById(id);
    const b = res.data;
    console.log("Booking data:", b);
    form.reset({
      referenceId: b.referenceId,

      nameOfBooker: b.bookingDetails.nameOfBooker,
      bookerEmail: b.bookingDetails.bookerEmail,
      bookerPhone: b.bookingDetails.bookerPhone,
      passportNumber: b.bookingDetails.passportNumber,
      flightNumber: b.bookingDetails.flightNumber,

      arrivalDate: b.bookingDetails.arrivalDateTime?.substring(0, 10),
      departureDate: b.bookingDetails.departureDateTime?.substring(0, 10),
      arrivalAirport: b.bookingDetails.departureAirport,

      startDate: b.tripDetails.startDate,
      endDate: b.tripDetails.endDate,
      startLocation: b.tripDetails.startLocation,
      endLocation: b.tripDetails.endLocation,

      destinations: (b.tripDetails.destinations || []).map((d) => ({
        location: d,
        latitude: null,
        longitude: null,
      })),

      estimatedCost: b.routeDetails.bookingPrice,
      distance: b.routeDetails.distance || 0,
      duration: b.routeDetails.duration || 0,

      vehicleId: b.resources?.vehicle?.vehicleId || null,
      driverId: b.resources?.driver?.driverId || null,

      adults: b.bookingDetails.passengers.adults,
      children: b.bookingDetails.passengers.children,
      babies: b.bookingDetails.passengers.babies,
    });
  }

  /* ======================
     ROUTE CALCULATION
  ====================== */
  async function calculateShortestPath() {
    if (!tripDetails.startLocation || !tripDetails.endLocation) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_GOOGLE_MAPS_API_URL}/api/maps/shortest-route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: tripDetails.startLocation,
            end: tripDetails.endLocation,
            waypoints: tripDetails.destinations,
            mode: "DRIVING",
          }),
        },
      );

      const data = await res.json();

      setRouteDetails({
        routeData: data,
        distance: data.distance,
        duration: data.duration,
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    calculateShortestPath();
  }, [
    tripDetails.startLocation,
    tripDetails.endLocation,
    tripDetails.destinations.length,
  ]);

  /* ======================
     SUBMIT
  ====================== */
  async function onSubmit(data) {
    const payload = {
      bookingId: Number(id),

      bookingDetails: {
        nameOfBooker: data.nameOfBooker,
        bookerEmail: data.bookerEmail,
        bookerPhone: data.bookerPhone,
        passportNumber: data.passportNumber,
        arrivalDateTime: data.arrivalDate
          ? `${data.arrivalDate}T00:00:00`
          : null,
        departureDateTime: data.departureDate
          ? `${data.departureDate}T00:00:00`
          : null,
        flightNumber: data.flightNumber,
        departureAirport: data.arrivalAirport,
        passengers: {
          adults: data.adults,
          children: data.children,
          babies: data.babies,
        },
      },

      tripDetails: {
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        startDate: data.startDate,
        endDate: data.endDate,
        destinations: data.destinations.map((d) => d.location),
        isVehicle: !!data.vehicleId,
      },

      routeDetails: {
        bookingPrice: data.estimatedCost,
        distance: data.distance,
        duration: data.duration,
      },

      resources: {
        vehicle: data.vehicleId ? { vehicleId: Number(data.vehicleId) } : null,
        driver: data.driverId ? { driverId: Number(data.driverId) } : null,
      },

      metadata: {
        source: "CUSTOM_PACKAGE",
        packageId: 1,
      },
    };

    await bookingApi.updateBookingById(id, payload);
    navigate("/trips");
  }

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumb
        title="Edit Booking"
        paths={["Tours", form.watch("referenceId"), ""]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="text-xl font-semibold">
            Reference ID : {form.watch("referenceId")}
          </div>

          {/* BOOKER DETAILS */}
          <Section title="Booker Details">
            <Grid>
              <EditableField
                form={form}
                name="nameOfBooker"
                label="Booker Name"
              />
              <EditableField form={form} name="bookerEmail" label="Email" />
              <EditableField form={form} name="bookerPhone" label="Phone" />
              <EditableField
                form={form}
                name="flightNumber"
                label="Flight Number"
              />
              <EditableField
                form={form}
                name="passportNumber"
                label="Passport Number"
              />
              <EditableField
                form={form}
                name="arrivalDate"
                label="Arrival Date"
                type="date"
              />
              <EditableField
                form={form}
                name="departureDate"
                label="Departure Date"
                type="date"
              />
              <EditableField
                form={form}
                name="arrivalAirport"
                label="Arrival Airport"
              />
              <br />
              <EditableField
                form={form}
                name="adults"
                label="Adults"
                type="number"
              />
              <EditableField
                form={form}
                name="children"
                label="Children"
                type="number"
              />
              <EditableField
                form={form}
                name="babies"
                label="Babies"
                type="number"
              />
              {/* <textarea name="" id=""></textarea> */}
            </Grid>
          </Section>

          {/* TRIP DETAILS */}
          <Section title="Trip Details">
            <Grid>
              <EditableField
                form={form}
                name="startDate"
                label="Start Date"
                type="date"
              />
              <EditableField
                form={form}
                name="endDate"
                label="End Date"
                type="date"
              />
            </Grid>

            <FormField
              control={form.control}
              name="startLocation"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Starting Location</FormLabel>
                  <FormControl>
                    <GooglePlaceInput
                      value={field.value || ""}
                      placeholder="Enter starting location"
                      onChange={(val) => {
                        // val = { location, latitude, longitude }
                        field.onChange(val.location);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endLocation"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>End Location</FormLabel>
                  <FormControl>
                    <GooglePlaceInput
                      value={field.value || ""}
                      placeholder="Enter end location"
                      onChange={(val) => field.onChange(val.location)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESTINATIONS */}
            <Section title="Destinations">
              <FormField
                control={form.control}
                name="destinations"
                render={({ field }) => (
                  <FormItem>
                    <DynamicList
                      title="Add Destination"
                      destinations={field.value || []}
                      setDestinations={(list) => field.onChange(list)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>
            {routeDetails.routeData && (
              <RouteMap
                routeDetails={routeDetails}
                setRouteDetails={(rd) => {
                  setRouteDetails(rd);

                  // 🔥 sync back to form
                  form.setValue("distance", rd.distance || 0);
                  form.setValue("duration", rd.duration || 0);
                }}
                tripDetails={tripDetails}
              />
            )}

            {/* VEHICLE SELECT */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocate Vehicle</FormLabel>
                  <FormControl>
                    <Select
                      options={vehicleOptions}
                      value={vehicleOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(opt) => field.onChange(opt ? opt.value : null)}
                      placeholder="Select vehicle..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocate Driver</FormLabel>
                  <FormControl>
                    <Select
                      options={driverOptions}
                      value={driverOptions.find(
                        (opt) => opt.value === field.value,
                      )}
                      onChange={(opt) => field.onChange(opt ? opt.value : null)}
                      placeholder="Select driver..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* COST */}
          <div className="bg-muted p-4 rounded flex justify-between text-lg font-semibold">
            <span>Total Cost</span>
            <span>LKR {form.watch("estimatedCost")?.toFixed(2)}</span>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-700 hover:bg-blue-900 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* =============================
   REUSABLE
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

function EditableField({ form, name, label, type = "text", full }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={full ? "md:col-span-3" : ""}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
