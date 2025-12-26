"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import Link from "next/link";
import { ChevronLeft } from "lucide-react";


export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(80, "Title must be at most 80 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z.enum(["open", "in_progress", "resolved"]),
  priority: z.number().min(1).max(5),
  assignee: z.string().min(2).optional(),
});

export type CreateTicketForm = z.infer<typeof createTicketSchema>;


export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "open",
      priority: 3,
      assignee: "",
    },
  });


  const onSubmit = async (data: CreateTicketForm) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          assignee: data.assignee || undefined,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to create ticket");
      }

      router.push("/tickets");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-[85%] mx-auto py-10 px-4">
<div className="mb-6 flex items-center gap-2">
  <Link
    href="/tickets"
    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
  >
    <ChevronLeft size={20} className="text-gray-500" />
  </Link>
    <span className="text-xl font-semibold">Create New Ticket</span>
</div>



      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1 mt-5">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                placeholder="Enter ticket title"
                {...register("title")}
                className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-600"
              />
              {errors.title && (
                <p className="text-xs text-red-500 py-1">{errors.title.message}</p>
              )}
              <p className="text-xs text-gray-500 py-2">
                Provide a clear and concise title (5–80 characters)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                rows={4}
                placeholder="Describe the issue in detail"
                {...register("description")}
                className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-600"
              />
              {errors.description && (
                <p className="text-xs text-red-500 py-1">{errors.description.message}</p>
              )}
              <p className="text-xs text-gray-500 py-2">
                Provide detailed information about the issue (min 20 characters)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  defaultValue="open"
                  onValueChange={(v) => setValue("status", v as CreateTicketForm["status"])}
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500 py-1">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Priority</Label>
                <Select
                  defaultValue="3"
                  onValueChange={(v) => setValue("priority", Number(v))}
                >
                  <SelectTrigger className="bg-gray-50">
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
                {errors.priority && (
                  <p className="text-xs text-red-500 py-1">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Assignee (Optional)</Label>
              <Input
                placeholder="Assign to team member"
                {...register("assignee")}
                className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-600"
              />
              {errors.assignee && (
                <p className="text-xs text-red-500 py-1">{errors.assignee.message}</p>
              )}
              <p className="text-xs text-gray-500 py-2">
                Leave empty if not assigned yet
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="px-6 bg-black text-white hover:bg-black disabled:bg-black disabled:text-white"
              >
                {loading ? "Creating..." : "Create Ticket"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-none focus:ring-0 focus:outline-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
