import { useEffect, useState } from "react";
import { DataTable } from "../../components/data-table";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";

import { Button } from "@/components/ui/button";
import { Plus, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DragHandle } from "@/components/data-table";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";
import tourGuideApi from "@/api/TourGuideApi";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import useNavigator from "../../hooks/use-navigator";

function TourGuideManagement() {
  const [guides, setGuides] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const goTo = useNavigator();

  // ✅ LOAD DATA
  useEffect(() => {
    loadGuides();
  }, []);

  async function loadGuides() {
    try {
      const res = await tourGuideApi.getAllGuides();

      const list = Array.isArray(res.data) ? res.data : [];

      const normalized = list.map((g) => ({
        ...g,
        guideId: g.tourGuideId, // backend primary key
      }));

      setGuides(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tour guides");
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedGuide) return;

    try {
      setIsDeleting(true);
      await tourGuideApi.deleteGuide(selectedGuide.guideId);
      toast.success("Guide deleted");

      setDeleteModalOpen(false);
      loadGuides();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  }

  // ✅ UPDATED COLUMNS (MATCH BACKEND)
  const guideColumns = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={String(row.original.guideId)} />,
    },

    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
    },

    // ✅ IMAGE
    {
      header: "Guide",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt="guide"
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },

    // ✅ NAME
    {
      accessorKey: "name",
      header: "Full Name",
    },

    // ✅ NIC
    {
      accessorKey: "nic",
      header: "NIC",
    },

    // ✅ LANGUAGES
    {
      accessorKey: "languages",
      header: "Languages",
    },

    // ✅ EXPERIENCE
    {
      accessorKey: "experienceYears",
      header: "Experience (Years)",
    },

    // ✅ PRICE PER DAY
    {
      accessorKey: "pricePerDay",
      header: "Price Per Day (LKR)",
      cell: ({ row }) =>
        row.original.pricePerDay
          ? `Rs. ${row.original.pricePerDay}`
          : "N/A",
    },

    // ✅ CONTACT
    {
      accessorKey: "contactNumber",
      header: "Contact",
    },

    // ✅ ACTIONS
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => goTo(`view/${row.original.guideId}`)}
            >
              View
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => goTo(`edit/${row.original.guideId}`)}
            >
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setSelectedGuide(row.original);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageBreadcrumb title="Tour Guide Management" />

      <div className="bg-white border rounded-md shadow-2xl">
        {/* HEADER */}
        <div className="flex px-6 py-3 border-b items-center">
          <h1 className="text-xl font-medium">Tour Guide List</h1>

          <Button
            className="ml-auto bg-blue-700 text-white hover:bg-blue-950"
            onClick={() => goTo("/tour-guide/add")}
          >
            <Plus /> Add New Guide
          </Button>
        </div>

        {/* TABLE */}
        <DataTable
          columns={guideColumns}
          data={guides}
          rowIdAccessor="guideId"
        />
      </div>

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Guide"
        message="Are you sure you want to delete"
        itemName={selectedGuide?.name || ""}
      />
    </div>
  );
}

export default TourGuideManagement;