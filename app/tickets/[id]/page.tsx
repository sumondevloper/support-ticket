"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

/* ---------------- API FUNCTIONS ---------------- */

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

const updateTicket = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateTicketInput;
}) => {
  const res = await fetch(`/api/tickets/${id}`, {  // ← এখানে id দিয়ে
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data), // ← id আর body-তে পাঠানোর দরকার নেই
  });

  let responseData;
  try {
    responseData = await res.json();
  } catch (e) {
    responseData = null;
  }

  if (!res.ok) {
    throw new Error(responseData?.error || `Update failed (${res.status})`);
  }

  return responseData;
};

const deleteTicket = async (id: string) => {
  const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};

/* ---------------- PAGE ---------------- */

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ✅ SAFELY extract id
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  /* ---------------- FETCH ---------------- */

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id),
    enabled: !!id,
  });

  const ticket = data?.ticket;

  /* ---------------- UPDATE ---------------- */

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTicketInput) =>
      updateTicket({ id, data }),
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
    onError: () => toast.error("Update failed"),
  });

  /* ---------------- DELETE ---------------- */

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => {
      toast.success("Ticket deleted");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      router.push("/tickets");
    },
    onError: () => toast.error("Delete failed"),
  });

  /* ---------------- FORM ---------------- */

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
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assignee: ticket.assignee || "",
        }
      : undefined,
  });

  const onSubmit = (data: UpdateTicketInput) => {
    updateMutation.mutate(data);
  };

  /* ---------------- STATES ---------------- */

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (isError || !ticket) {
    return <div className="container py-10">Ticket not found</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Link href="/tickets">
          <Button variant="outline">← Back to tickets</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{ticket.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Created: {format(new Date(ticket.createdAt), "PPP p")}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Badge>
                {ticket.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline">
                Priority {ticket.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {ticket.description}
            </p>
          </div>

          {ticket.assignee && (
            <div>
              <h3 className="font-semibold mb-2">Assignee</h3>
              <p>{ticket.assignee}</p>
            </div>
          )}

          <div className="flex gap-4">
            {/* EDIT */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>Edit</Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Ticket</DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <Label>Title</Label>
                    <Input {...register("title")} />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea rows={5} {...register("description")} />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        defaultValue={ticket.status}
                        onValueChange={(v) =>
                          setValue("status", v as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">
                            Resolved
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select
                        defaultValue={ticket.priority.toString()}
                        onValueChange={(v) =>
                          setValue("priority", Number(v))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((p) => (
                            <SelectItem
                              key={p}
                              value={p.toString()}
                            >
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Assignee (optional)</Label>
                    <Input {...register("assignee")} />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* DELETE */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
