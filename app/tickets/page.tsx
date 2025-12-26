"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Users,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  createdAt: string;
}

/* ---------------- FETCH FUNCTION ---------------- */

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

/* ---------------- PAGE ---------------- */

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tickets", search, statusFilter, sortOrder],
    queryFn: ({ pageParam }) =>
      fetchTickets({
        pageParam,
        search,
        status: statusFilter,
        sort: sortOrder,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const tickets: Ticket[] =
    data?.pages.flatMap((page) => page.tickets) ?? [];

  /* ---------------- INFINITE SCROLL ---------------- */

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSortOrder("desc");
  };


  const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const getPriorityColor = (priority: number) => {
  if (priority >= 4) return "text-red-500";
  if (priority >= 2) return "text-yellow-500";
  return "text-muted-foreground";
};
  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
        <h1 className="text-4xl font-bold">Support Tickets</h1>
       <p  className="mt-2.5">{tickets.length} Tickets</p> 
        </div>
        <Link href="/tickets/new">
          <Button size="lg" className="bg-black text-white rounded-lg px-6 py-3">
+ &nbsp; New Ticket</Button>
        </Link>
      </div>

<div className="flex items-end gap-4 mb-6">
  {/* Search Bar */}
  <div className="flex-1">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search title..."
        className="pl-9"
      />
    </div>
  </div>

  {/* Status Filter - Icon in trigger */}
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
        {/* Items without icons */}
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Sort - Icon in trigger */}
  <div className="w-[150px]">
    <Select value={sortOrder} onValueChange={setSortOrder}>
      <SelectTrigger className="w-full flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4" />
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {/* Items without icons */}
        <SelectItem value="desc">Newest</SelectItem>
        <SelectItem value="asc">Oldest</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Clear Filter Button */}
  <Button
    variant="outline"
    onClick={clearFilters}
    disabled={!search && !statusFilter && sortOrder === "desc"}
    className="h-10 px-4 flex items-center gap-2"
  >
    <X className="h-4 w-4" />
    Clear
  </Button>
</div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">Failed to load tickets</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && tickets.length === 0 && (
        <p className="text-center text-muted-foreground py-20">
          No tickets found
        </p>
      )}

<div className="flex flex-col gap-4 w-full">
  {tickets.map((ticket) => (
    <Link
      href={`/tickets/${ticket._id}`}
      key={ticket._id}
      className="w-full"
    >
      <div className="w-full border border-gray-200 rounded-[5px] bg-white hover:shadow-sm transition cursor-pointer">
        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">
                {ticket.title}
              </h3>

              <p className="text-sm text-gray-400 line-clamp-2 max-w-3xl">
                {ticket.description}
              </p>
            </div>

            <span
              className={`px-3 py-1 text-xs rounded-full capitalize ${statusStyles[ticket.status]}`}
            >
              {ticket.status.replace("_", " ")}
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            {/* Priority */}
            <div className="flex items-center gap-1">
              <AlertTriangle
                size={14}
                className={getPriorityColor(ticket.priority)}
              />
              <span>Priority {ticket.priority}</span>
            </div>

            {/* Date */}
        <div className="flex items-center gap-1 text-gray-400">
  <CalendarDays size={14} />
  <span>
    {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
  </span>
</div>


            {/* Users */}
            <div className="flex items-center gap-1  text-gray-400">
              <Users size={14} />
              <span>3</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  ))}
</div>




      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} className="py-10 text-center">
        {isFetchingNextPage && <p>Loading more...</p>}
        {!hasNextPage && tickets.length > 0 && (
          <p className="text-muted-foreground">End of results</p>
        )}
      </div>
    </div>
  );
}
