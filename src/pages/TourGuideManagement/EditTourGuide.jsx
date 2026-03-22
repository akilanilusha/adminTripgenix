import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import uploadToSupabase from "@/utils/uploadImage";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import useNavigator from "@/hooks/use-navigator";
import tourGuideApi from "@/api/TourGuideApi";

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

// ✅ UPDATED SCHEMA
const schema = z.object({
  name: z.string().min(1, "Name required"),
  nic: z.string().min(1, "NIC required"),
  description: z.string().min(1, "Description required"),
  pricePerDay: z.coerce.number().min(0, "Price must be positive"),
  contactNumber: z.string().min(1, "Contact number required"),
  experienceYears: z.coerce.number().min(0, "Invalid experience"),
  languages: z.string().min(1, "Languages required"),
  image: z.instanceof(File).nullable().optional(),
});

export default function EditTourGuide() {
  const { id } = useParams();
  const goTo = useNavigator();

  const [loading, setLoading] = useState(true);
  const [existingGuide, setExistingGuide] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nic: "",
      description: "",
      pricePerDay: "",
      contactNumber: "",
      experienceYears: "",
      languages: "",
      image: null,
    },
  });

  // ✅ LOAD GUIDE
  useEffect(() => {
    async function loadGuide() {
      try {
        const res = await tourGuideApi.getGuideById(id);
        const guide = res.data;

        setExistingGuide(guide);

        form.reset({
          name: guide.name || "",
          nic: guide.nic || "",
          description: guide.description || "",
          pricePerDay: guide.pricePerDay || "",
          contactNumber: guide.contactNumber || "",
          experienceYears: guide.experienceYears || "",
          languages: guide.languages || "",
          image: null,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load guide");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadGuide();
  }, [id, form]);

  // ✅ SUBMIT
  async function onSubmit(values) {
    try {
      await toast.promise(
        (async () => {
          const imageUrl = values.image
            ? await uploadToSupabase(
                values.image,
                `guide-images/${values.nic || values.name}`
              )
            : existingGuide?.image;

          const payload = {
            tourGuideId: id,
            name: values.name,
            nic: values.nic,
            description: values.description,
            pricePerDay: values.pricePerDay,
            contactNumber: values.contactNumber,
            image: imageUrl,
            experienceYears: values.experienceYears,
            languages: values.languages,
          };

          console.log("Updating:", payload);

          await tourGuideApi.updateGuide(payload);
          return true;
        })(),
        {
          loading: "Updating guide...",
          success: () => {
            goTo("/tour-guide");
            return "Guide updated successfully";
          },
          error: () => "Update failed",
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <PageBreadcrumb title="Edit Tour Guide" />

      <div className="bg-white border rounded-md shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Guide Details</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIC */}
              <FormField
                name="nic"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONTACT */}
              <FormField
                name="contactNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EXPERIENCE */}
              <FormField
                name="experienceYears"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PRICE */}
              <FormField
                name="pricePerDay"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Day (LKR)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LANGUAGES */}
              <FormField
                name="languages"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <FormControl>
                      <Input placeholder="English, Sinhala, Tamil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IMAGE */}
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          field.onChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </FormControl>

                    {existingGuide?.image && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">
                          Current Image:
                        </p>
                        <img
                          src={existingGuide.image}
                          alt="Guide"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* DESCRIPTION */}
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => goTo("/tour-guide")}
              >
                Cancel
              </Button>

              <Button
                className="bg-blue-700 text-white hover:bg-blue-900"
                type="submit"
              >
                Update Guide
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}