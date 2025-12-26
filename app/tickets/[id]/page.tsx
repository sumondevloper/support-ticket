"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
  updateTicketSchema,
  UpdateTicketInput,
} from "../../schemas/ticket-schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { AlertTriangle, CalendarDays, ChevronLeft, SquarePen, Trash, Users } from "lucide-react";
import Loading from "./loading";

const fetchTicket = async (id: string) => {
  const res = await fetch("/api/tickets/get-by-id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch ticket");
  }

  return res.json();
};

export const updateTicket = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<UpdateTicketInput>;
}) => {
  if (!id) throw new Error("Ticket ID is required");

  const res = await fetch(`/api/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  let responseData;
  try {
    responseData = await res.json();
  } catch {
    responseData = { error: "Invalid response from server" };
  }

  if (!res.ok) {
    throw new Error(
      responseData?.error || responseData?.details || `Update failed (${res.status})`
    );
  }

  return responseData.ticket;
};

export const deleteTicket = async (id: string) => {
  if (!id) throw new Error("Ticket ID is required");

  const res = await fetch(`/api/tickets/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  let responseData;
  try {
    responseData = await res.json();
  } catch {
    responseData = { error: "Invalid response from server" };
  }

  if (!res.ok) {
    throw new Error(
      responseData?.error || responseData?.details || "Delete failed"
    );
  }

  return responseData;
};

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [isEditOpen, setIsEditOpen] = useState(false); // ← Control Edit dialog

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id),
    enabled: !!id,
  });

  const ticket = data?.ticket;

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTicketInput) =>
      updateTicket({ id, data }),
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      setIsEditOpen(false); // ← Automatically close the dialog
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => {
      toast.success("Ticket deleted");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      router.push("/tickets");
    },
    onError: () => toast.error("Delete failed"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTicketInput>({
    resolver: zodResolver(updateTicketSchema),
    values: ticket
      ? {
          title: ticket.title,
          description: ticket.description || "",
          status: ticket.status,
          priority: ticket.priority,
          assignee: ticket.assignee || "",
        }
      : undefined,
  });

  const onSubmit = (data: UpdateTicketInput) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !ticket) {
    return <div className="container py-10">Ticket not found</div>;
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-500";
    if (priority >= 2) return "text-yellow-500";
    return "text-muted-foreground";
  };


const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-500 text-white" },
  in_progress: { label: "In Progress", color: "bg-yellow-500 text-white" },
  resolved: { label: "Resolved", color: "bg-teal-500 text-white" },
  close: { label: "Close", color: "bg-green-500 text-white" },
};

const currentStatus = statusConfig[ticket.status] || { label: "Unknown", color: "bg-gray-400" };
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      {/* Back */}
      <div className="mb-6">
        <Link href="/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={18} className="text-gray-500" />
          Back to Tickets
        </Link>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{ticket.title}</h1>
<Badge className={`${currentStatus.color} text-white`}>
  {currentStatus.label}
</Badge>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-gray-400">
                <AlertTriangle size={14} className={getPriorityColor(ticket.priority)} />
                <span>Priority {ticket.priority}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <Users size={14} />
                <span>{ticket.assignee ?? "Unassigned"}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <CalendarDays size={14} />
                <span>Created {format(new Date(ticket.createdAt), "MMMM do, yyyy")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Edit Dialog - Controlled */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                >
                  <SquarePen size={14} />
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl rounded-lg p-4">
                <DialogHeader className="space-y-0.5">
                  <DialogTitle className="text-base font-semibold">
                    Edit Ticket
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-3">
                  <div className="space-y-0.5">
                    <Label className="text-[13px]">Title</Label>
                    <Input
                      {...register("title")}
                      className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-600"
                      placeholder="Enter ticket title"

                    />
                    <p className="text-[11px] text-muted-foreground">
                      Provide a clear and concise title (5–80 characters)
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[13px]">Description</Label>
                    <Textarea
                      rows={3}
                      {...register("description")}
                      className="bg-[#f5f5f5] min-h-[72px] text-[14px] text-gray-800 placeholder:text-gray-600"
                      placeholder="Describe the issue in detail"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Provide detailed information about the issue
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <Label className="text-[13px]">Status</Label>
                      <Select
                        defaultValue={ticket.status}
                        onValueChange={(v) => setValue("status", v as any)}
                      >
                        <SelectTrigger className="bg-[#f5f5f5] border-none h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="close">Close</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-0.5">
                      <Label className="text-[13px]">Priority</Label>
                      <Select
                        defaultValue={ticket.priority.toString()}
                        onValueChange={(v) => setValue("priority", Number(v))}
                      >
                        <SelectTrigger className="bg-[#f5f5f5] border-none h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Very Low</SelectItem>
                          <SelectItem value="2">2 - Low</SelectItem>
                          <SelectItem value="3">3 - Medium</SelectItem>
                          <SelectItem value="4">4 - High</SelectItem>
                          <SelectItem value="5">5 - Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[13px]">Assignee (Optional)</Label>
                    <Input
                      {...register("assignee")}
                      placeholder="Assignee a team member"
                      className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-600"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave empty if not assigned yet
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="bg-black text-white hover:bg-black h-9 px-4"
                    >
                      {updateMutation.isPending ? "Updating..." : "Update Ticket"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditOpen(false)}
                      className="border-none h-9 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="border-gray-300 hover:border-gray-300">
                  <Trash size={14} className="text-red-500" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete ticket?</DialogTitle>
                </DialogHeader>
                <p>This action cannot be undone.</p>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate()}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-medium">Description</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {ticket.description || "No description provided."}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div>
            <p className="text-[13px] text-gray-600">Status</p>
            <p className="font-medium capitalize">{ticket.status.replace("_", " ")}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-600">Priority</p>
            <p className="font-medium">Level {ticket.priority}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-600">Assignee</p>
            <p className="font-medium">{ticket.assignee ?? "Unassigned"}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-600">Last Updated</p>
            <p className="font-medium">
              {format(new Date(ticket.updatedAt), "MMMM do, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}