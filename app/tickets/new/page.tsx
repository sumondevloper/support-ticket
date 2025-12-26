"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

/* ---------------- TYPES ---------------- */

type CreateTicketPayload = {
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  priority: number;
  assignee?: string;
};

/* ---------------- PAGE ---------------- */

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateTicketPayload>({
    title: "",
    description: "",
    status: "open",
    priority: 3,
    assignee: "",
  });

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assignee: form.assignee || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      router.push("/tickets");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6">
  <Link href="/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
    <ChevronLeft size={18} className="text-gray-500" />
    Back to Tickets
  </Link>
</div>
      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            Create New Ticket
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                placeholder="Enter ticket title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-300"
                required
              />
              <p className="text-xs text-gray-400">
                Provide a clear and concise title (5–80 characters)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                rows={4}
                placeholder="Describe the issue in detail"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-300"
                required
              />
              <p className="text-xs text-gray-400">
                Provide detailed information about the issue (min 20 characters)
              </p>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      status: value as CreateTicketPayload["status"],
                    })
                  }
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
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Priority</Label>
                <Select
                  value={form.priority.toString()}
                  onValueChange={(value) =>
                    setForm({ ...form, priority: Number(value) })
                  }
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
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Assignee (Optional)
              </Label>
              <Input
                placeholder="Assign to team member"
                value={form.assignee}
                onChange={(e) =>
                  setForm({ ...form, assignee: e.target.value })
                }
                      className="bg-[#f5f5f5] h-9 text-[14px] text-gray-800 placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-400">
                Leave empty if not assigned yet
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Actions */}
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
                className="border-none focus:ring-0 focus:outline-none">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
