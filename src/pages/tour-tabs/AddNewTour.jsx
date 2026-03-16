import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadcrumb";

import GooglePlaceInput from "@/components/GooglePlaceInput";
import DynamicList from "@/components/DynamicList";
import RouteMap from "./RouteMap";

import vehicleApi from "@/api/vehicleApi";
import driverApi from "@/api/DriverApi";
// import guideApi from "@/api/guideApi";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AddNewTour() {

  const form = useForm({
    defaultValues: {
      nameOfBooker: "",
      emailAddress: "",
      whatsappPhone: "",
      passportNumber: "",
      arrivalDateTime: "",
      departureDateTime: "",
      flightNumber: "",
      departureAirport: "",
      adults: 0,
      children: 0,
      babies: 0,
      specialNote: "",
      startLocation: "",
      endLocation: "",
      destinations: [],
      startDate: "",
      endDate: "",
      vehicleId: null,
      driverId: null,
      guideId: null
    }
  });

  const [routeDetails, setRouteDetails] = useState({
    routeData: null,
    distance: 0,
    duration: 0
  });

  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [guideOptions, setGuideOptions] = useState([]);

  /* ======================
     LOAD API DATA
  ====================== */

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {

      const [vehicles, drivers, guides] = await Promise.all([
        vehicleApi.getVehicleNumbers(),
        driverApi.getAllDrivers(),
        guideApi.getAllGuides()
      ]);

      setVehicleOptions(
        vehicles.data.map(v => ({
          value: v.vehicleId,
          label: v.numberPlate || v.vehicleNumber
        }))
      );

      setDriverOptions(
        drivers.data.map(d => ({
          value: d.driverId,
          label: `${d.firstName} ${d.lastName}`
        }))
      );

      setGuideOptions(
        guides.data.map(g => ({
          value: g.id,
          label: g.name
        }))
      );

    } catch (err) {
      console.error("Failed to load resources", err);
    }
  }

  /* ======================
     ROUTE CALCULATION
  ====================== */

  const tripDetails = {
    startLocation: form.watch("startLocation"),
    endLocation: form.watch("endLocation"),
    destinations: (form.watch("destinations") || []).map(d => d.location)
  };

  useEffect(() => {
    calculateRoute();
  }, [
    tripDetails.startLocation,
    tripDetails.endLocation,
    tripDetails.destinations.length
  ]);

  async function calculateRoute() {

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
            waypoints: tripDetails.destinations
          })
        }
      );

      const data = await res.json();

      setRouteDetails({
        routeData: data,
        distance: data.distance,
        duration: data.duration
      });

      form.setValue("distance", data.distance);
      form.setValue("duration", data.duration);

    } catch (err) {
      console.error("Route calculation failed", err);
    }
  }

  /* ======================
     SUBMIT
  ====================== */

  async function onSubmit(data) {

    const payload = {

      bookingDetails: {
        nameOfBooker: data.nameOfBooker,
        emailAddress: data.emailAddress,
        whatsappPhone: data.whatsappPhone,
        passportNumber: data.passportNumber,
        arrivalDateTime: data.arrivalDateTime,
        departureDateTime: data.departureDateTime,
        flightNumber: data.flightNumber,
        departureAirport: data.departureAirport,

        passengers: {
          adults: data.adults,
          children: data.children,
          babies: data.babies
        },

        specialNote: data.specialNote
      },

      tripDetails: {
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        startDate: data.startDate,
        endDate: data.endDate,
        destinations: data.destinations.map(d => d.location)
      },

      routeDetails: {
        distance: routeDetails.distance,
        duration: routeDetails.duration
      },

      resources: {
        vehicle: data.vehicleId ? { vehicleId: data.vehicleId } : null,
        driver: data.driverId ? { driverId: data.driverId } : null,
        guide: data.guideId ? { guideId: data.guideId } : null
      }

    };

    console.log("SUBMIT PAYLOAD", payload);

    // await bookingApi.createBooking(payload)
  }

  /* ======================
     UI
  ====================== */

  return (

    <div className="p-6 space-y-10">
      <PageBreadcrumb
              title="Add New Booking"
              paths={["Tours",  ""]}
            />

      <Form {...form}>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          <Section title="Booking Details">

            <Grid>

              <EditableField
                form={form}
                name="nameOfBooker"
                label="Name of Booker"
                required
              />

              <EditableField
                form={form}
                name="emailAddress"
                label="Email Address"
                required
                type="email"
              />

              <EditableField
                form={form}
                name="whatsappPhone"
                label="Whatsapp Phone Number"
                required
              />

              <EditableField
                form={form}
                name="passportNumber"
                label="Passport Number"
                required
              />

              <EditableField
                form={form}
                name="arrivalDateTime"
                label="Arrival Date and Time"
                type="datetime-local"
                required
              />

              <EditableField
                form={form}
                name="departureDateTime"
                label="Departure Date and Time"
                type="datetime-local"
                required
              />

              <EditableField
                form={form}
                name="flightNumber"
                label="Flight Number"
              />

              <EditableField
                form={form}
                name="departureAirport"
                label="Departure Airport"
              />

            </Grid>

          </Section>


          <Section title="Passenger Count">

            <Grid>

              <EditableField form={form} name="adults" label="Adults" type="number" />
              <EditableField form={form} name="children" label="Children" type="number" />
              <EditableField form={form} name="babies" label="Babies" type="number" />

            </Grid>

            <FormField
              control={form.control}
              name="specialNote"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Special note" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

          </Section>


          {/* TRIP DETAILS */}

          <Section title="Trip Details">

            <Grid>

              <EditableField
                form={form}
                name="startDate"
                label="Start Date"
                type="date"
                required
              />

              <EditableField
                form={form}
                name="endDate"
                label="End Date"
                type="date"
                required
              />

            </Grid>

            {/* START LOCATION */}

            <LocationField
              form={form}
              name="startLocation"
              label="Start Location"
            />

            <LocationField
              form={form}
              name="endLocation"
              label="End Location"
            />

            {/* DESTINATIONS */}

            <DynamicList
              title="Add Destination"
              destinations={form.watch("destinations") || []}
              setDestinations={(list) => form.setValue("destinations", list)}
            />

            {/* MAP */}

            {routeDetails.routeData && (
              <RouteMap
                routeDetails={routeDetails}
                setRouteDetails={setRouteDetails}
                tripDetails={tripDetails}
              />
            )}

            {/* VEHICLE */}

            <SelectField
              form={form}
              name="vehicleId"
              label="Select Vehicle"
              options={vehicleOptions}
            />

            <SelectField
              form={form}
              name="driverId"
              label="Select Driver"
              options={driverOptions}
            />

            <SelectField
              form={form}
              name="guideId"
              label="Select Tour Guide"
              options={guideOptions}
            />

          </Section>


          <div className="flex justify-end">

            <Button
              type="submit"
              className="bg-teal-800 hover:bg-teal-900 px-8"
            >
              Proceed
            </Button>

          </div>

        </form>

      </Form>

    </div>

  );

}


/* =============================
   REUSABLE COMPONENTS
============================= */

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-md shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function EditableField({ form, name, label, type="text", required }) {

  return (

    <FormField
      control={form.control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field }) => (

        <FormItem>

          <FormLabel>{label}</FormLabel>

          <FormControl>
            <Input {...field} type={type} />
          </FormControl>

          <FormMessage/>

        </FormItem>

      )}
    />

  );

}

function LocationField({ form, name, label }) {

  return (

    <FormField
      control={form.control}
      name={name}
      rules={{ required: `${label} is required` }}
      render={({ field }) => (

        <FormItem className="md:col-span-3">

          <FormLabel>{label}</FormLabel>

          <FormControl>

            <GooglePlaceInput
              value={field.value || ""}
              placeholder="Enter location"
              onChange={(val)=> field.onChange(val.location)}
            />

          </FormControl>

          <FormMessage/>

        </FormItem>

      )}
    />

  );

}

function SelectField({ form, name, label, options }) {

  return (

    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (

        <FormItem>

          <FormLabel>{label}</FormLabel>

          <FormControl>

            <Select
              options={options}
              value={options.find(o => o.value === field.value)}
              onChange={(opt)=> field.onChange(opt ? opt.value : null)}
            />

          </FormControl>

        </FormItem>

      )}
    />

  );

}