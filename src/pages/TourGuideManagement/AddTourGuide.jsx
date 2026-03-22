import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import uploadToSupabase from "@/utils/uploadImage";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { toast } from "sonner";
import Select from "react-select";
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
import useNavigator from "@/hooks/use-navigator";

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Sinhala", label: "Sinhala" },
  { value: "Tamil", label: "Tamil" },
  { value: "Hindi", label: "Hindi" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Spanish", label: "Spanish" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Arabic", label: "Arabic" },
  { value: "Russian", label: "Russian" },
  { value: "Italian", label: "Italian" },
  { value: "Dutch", label: "Dutch" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Malay", label: "Malay" },
  { value: "Thai", label: "Thai" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Turkish", label: "Turkish" },
  { value: "Bengali", label: "Bengali" },
];
// ---------- schema ----------
const schema = z.object({
  name: z.string().min(1, "Name required"),
  nic: z.string().min(1, "NIC required"),
  description: z.string().min(1, "Description required"),
  pricePerDay: z.coerce.number().min(0, "Price must be positive"),
  contactNumber: z.string().min(1, "Contact number required"),
  experienceYears: z.coerce.number().min(0, "Invalid experience"),
  languages: z.string().min(1, "Languages required"),
  image: z.instanceof(File, { message: "Image required" }),
});

export default function AddTourGuide() {
  const goTo = useNavigator();

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

  // ---------- submit ----------
  async function onSubmit(values) {
    try {
      await toast.promise(
        (async () => {
          const imageUrl = await uploadToSupabase(
            values.image,
            `guide-images/${values.nic || values.name}`,
          );

          const payload = {
            name: values.name,
            nic: values.nic,
            description: values.description,
            pricePerDay: values.pricePerDay,
            contactNumber: values.contactNumber,
            image: imageUrl,
            experienceYears: values.experienceYears,
            languages: values.languages,
          };

          console.log("Submitting payload:", payload);

          await tourGuideApi.createGuide(payload);
          return true;
        })(),
        {
          loading: "Saving guide...",
          success: () => {
            goTo("/tour-guide");
            form.reset();
            return "Tour guide created";
          },
          error: (err) => {
            console.error("SERVER ERROR:", err?.response?.data);

            // show backend message if exists
            return (
              err?.response?.data?.message ||
              err?.response?.data ||
              err.message ||
              "Failed to create tour guide"
            );
          },
        },
      );
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- UI ----------
  return (
    <div className="p-6">
      <PageBreadcrumb title="Add Tour Guide" />

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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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
                      <Select
                        options={LANGUAGE_OPTIONS}
                        isMulti
                        placeholder="Select languages..."
                        value={
                          field.value
                            ? field.value.split(", ").map((lang) => ({
                                value: lang,
                                label: lang,
                              }))
                            : []
                        }
                        onChange={(selected) =>
                          field.onChange(
                            selected.map((item) => item.value).join(", "),
                          )
                        }
                      />
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
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          field.onChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DESCRIPTION FULL WIDTH */}
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
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear
              </Button>

              <Button
                type="submit"
                className="bg-blue-700 text-white hover:bg-blue-900"
              >
                Save Guide
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
