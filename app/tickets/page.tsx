"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useScroll } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Users,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Ticket } from "../types";
import { toast } from "sonner"; 

const fetchTickets = async ({
  pageParam = 1,
  search = "",
  status = "",
  sort = "desc",
}: {
  pageParam?: number;
  search?: string;
  status?: string;
  sort?: string;
}) => {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: "9",
    sort,
    ...(search && { search }),
    ...(status && { status }),
  });

  const res = await fetch(`/api/tickets?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");

  const json = await res.json();

  return {
    tickets: json.data || [],
    hasMore: json.hasMore ?? false,
  };
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["tickets", debouncedSearch, statusFilter, sortOrder],
    queryFn: ({ pageParam = 1 }) =>
      fetchTickets({
        pageParam,
        search: debouncedSearch,
        status: statusFilter,
        sort: sortOrder,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  const rawTickets: Ticket[] = data?.pages.flatMap((p) => p.tickets) ?? [];

  const filteredTickets = useMemo(() => {
    let temp = [...rawTickets];

    if (debouncedSearch) {
      temp = temp.filter((t) =>
        t.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (statusFilter) {
      temp = temp.filter((t) => t.status === statusFilter);
    }

    temp.sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return temp;
  }, [rawTickets, debouncedSearch, statusFilter, sortOrder]);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.9 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage().catch(() => toast.error("Failed to load more tickets"));
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-500";
    if (priority >= 2) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const statusStylesBadge: Record<string, string> = {
    open: "bg-blue-500 text-white",
    in_progress: "bg-yellow-500 text-white",
    close: "bg-green-500 text-white",
    resolved: "bg-teal-500 text-white",
  };

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setSortOrder("desc");
  }, []);

  const hasActiveFilters =
    debouncedSearch !== "" || statusFilter !== "" || sortOrder !== "desc";

  return (
    <div className="w-[85%] mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="mt-2.5 text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${filteredTickets.length} Ticket${filteredTickets.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/tickets/new">
          <Button size="lg" className="bg-black text-white rounded-lg px-6 py-3">
            + &nbsp; New Ticket
          </Button>
        </Link>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title..."
            className="pl-9"
          />
        </div>

        <div className="w-[180px]">
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="close">Close</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
            <SelectTrigger className="w-full flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="h-10 px-4 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">
            {error instanceof Error ? error.message : "Failed to load tickets"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && filteredTickets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">
            {hasActiveFilters
              ? "No tickets match your filters"
              : "No tickets yet. Create your first one!"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {filteredTickets.map((ticket) => (
          <Link
            href={`/tickets/${ticket._id}`}
            key={ticket._id}
            className="w-full block"
          >
            <div className="w-full border border-gray-200 rounded-[5px] bg-white hover:shadow-md transition-shadow cursor-pointer p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {ticket.description}
                  </p>
                </div>

                <Badge
                  className={`px-3 py-1 text-xs font-medium capitalize rounded-md ${
                    statusStylesBadge[ticket.status] || "bg-gray-300 text-white"
                  }`}
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    size={16}
                    className={getPriorityColor(ticket.priority)}
                  />
                  <span>Priority {ticket.priority}</span>
                </div>

                {ticket.assignee && (
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span>{ticket.assignee}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <CalendarDays size={16} />
                  <span>{format(new Date(ticket.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="py-10 text-center">
        {isFetchingNextPage && (
          <p className="text-muted-foreground mb-2">Loading more tickets...</p>
        )}
      </div>
    </div>
  );
}
