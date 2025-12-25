"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Support Tickets</h1>
        <Link href="/tickets/new">
          <Button size="lg">Create Ticket</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <Label>Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title..."
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sort</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(search || statusFilter || sortOrder !== "desc") && (
        <Button variant="outline" onClick={clearFilters} className="mb-6">
          Clear filters
        </Button>
      )}

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

      {/* Tickets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Link href={`/tickets/${ticket._id}`} key={ticket._id}>
            <Card className="hover:shadow-xl transition h-full cursor-pointer">
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  {ticket.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {ticket.description}
                </p>
                <div className="flex justify-between">
                  <Badge>{ticket.status.replace("_", " ")}</Badge>
                  <Badge variant="outline">Priority {ticket.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {format(new Date(ticket.createdAt), "PPP")}
                </p>
              </CardContent>
            </Card>
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
