import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListOrdered, Search } from "lucide-react";
import { Badge, Button, Card, EmptyState, SectionTitle, TextInput } from "@/components/ui-kit";
import { useAuthorityCentre, useSmartMandi } from "@/store/SmartMandiProvider";
import { queueForCentre } from "@/lib/queue";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE, dateTimeOf } from "@/lib/format";
import type { BookingStatus } from "@/types/domain";

export const Route = createFileRoute("/authority/queue")({
  component: AuthorityQueue,
});

const FILTERS: { key: "queue" | "all" | BookingStatus; label: string }[] = [
  { key: "queue", label: "In queue" },
  { key: "booked", label: "Booked" },
  { key: "assessed", label: "Assessed" },
  { key: "payment_completed", label: "Completed" },
  { key: "all", label: "All" },
];

function AuthorityQueue() {
  const { state, farmerNameFor, villageFor, setBookingStatus } = useSmartMandi();
  const centre = useAuthorityCentre();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("queue");
  const [search, setSearch] = useState("");

  const centreBookings = state.bookings.filter((b) => b.centre_id === centre.id);
  const queueIds = new Set(queueForCentre(state.bookings, centre.id).map((b) => b.id));

  const rows = centreBookings
    .filter((b) =>
      filter === "all" ? true : filter === "queue" ? queueIds.has(b.id) : b.status === filter,
    )
    .filter((b) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        b.token_number.toLowerCase().includes(q) ||
        farmerNameFor(b).toLowerCase().includes(q) ||
        villageFor(b).toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<ListOrdered className="size-5" />}
        title="Live queue"
        subtitle="Call the next farmer, start processing and open the quality check."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token, farmer or village"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    : "rounded-full border-2 border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={<ListOrdered className="size-8" />}
          title="Nothing to show"
          description="No bookings match this filter right now."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-strong text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Farmer</th>
                <th className="px-4 py-3">Village</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b, i) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3 font-bold">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{b.token_number}</td>
                  <td className="px-4 py-3">{farmerNameFor(b)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{villageFor(b)}</td>
                  <td className="px-4 py-3">{b.expected_quantity_quintal} qtl</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dateTimeOf(b.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={BOOKING_STATUS_TONE[b.status]}>
                      {BOOKING_STATUS_LABEL[b.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "waiting" ? (
                        <Button size="sm" onClick={() => setBookingStatus(b.id, "processing")}>
                          Call in
                        </Button>
                      ) : null}
                      {b.status === "booked" ? (
                        <Button size="sm" variant="outline" onClick={() => setBookingStatus(b.id, "waiting")}>
                          Add to queue
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
