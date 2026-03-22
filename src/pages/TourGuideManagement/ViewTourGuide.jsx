import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import tourGuideApi from "@/api/TourGuideApi";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import useNavigator from "@/hooks/use-navigator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ViewTourGuide() {
  const { id } = useParams();
  const goTo = useNavigator();

  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    async function loadGuide() {
      try {
        const res = await tourGuideApi.getGuideById(id);
        const guideData = res.data;

        if (!guideData) {
          toast.error("Guide not found");
          return;
        }

        setGuide(guideData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tour guide");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadGuide();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!guide) return <div className="p-6">No guide found</div>;

  return (
    <div className="p-6">
      <PageBreadcrumb title="View Tour Guide" />

      <div className="bg-white border rounded-md shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Tour Guide Details</h2>

        {/* IMAGE */}
        <div className="flex items-center gap-6 mb-6">
          {guide.image ? (
            <img
              src={guide.image}
              alt="Guide"
              className="w-32 h-32 rounded-full object-cover border"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold">{guide.name}</h3>
            <p className="text-gray-500">{guide.languages}</p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Field label="NIC">
            <Input value={guide.nic || ""} disabled />
          </Field>

          <Field label="Contact Number">
            <Input value={guide.contactNumber || ""} disabled />
          </Field>

          <Field label="Experience">
            <Input value={`${guide.experienceYears || 0} years`} disabled />
          </Field>

          <Field label="Price Per Day">
            <Input value={`Rs. ${guide.pricePerDay || 0}`} disabled />
          </Field>

          <Field label="Languages">
            <Input value={guide.languages || ""} disabled />
          </Field>

        </div>

        {/* DESCRIPTION */}
        <div className="mt-6">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded p-3 mt-2 bg-gray-50"
            value={guide.description || ""}
            disabled
            rows={4}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end mt-8 gap-3">
          <Button variant="outline" onClick={() => goTo("/tour-guide")}>
            Back
          </Button>

          <Button
            className="bg-blue-700 text-white hover:bg-blue-900"
            onClick={() => goTo(`/tour-guide/edit/${id}`)}
          >
            Edit Guide
          </Button>
        </div>
      </div>
    </div>
  );
}

// reusable field
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}