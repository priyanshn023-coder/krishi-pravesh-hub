import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, IndianRupee, LayoutDashboard, Timer, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card, Notice, SectionTitle, Stat } from "@/components/ui-kit";
import { useAuthorityCentre, useSmartMandi } from "@/store/SmartMandiProvider";
import { predictFor, queueForCentre } from "@/lib/queue";
import { BOOKING_STATUS_LABEL, minutesLabel, rupees, timeOf } from "@/lib/format";

export const Route = createFileRoute("/authority/")({
  component: AuthorityDashboard,
});

function AuthorityDashboard() {
  const { state, farmerNameFor } = useSmartMandi();
  const centre = useAuthorityCentre();

  const centreBookings = state.bookings.filter((b) => b.centre_id === centre.id);
  const queue = queueForCentre(state.bookings, centre.id);
  const prediction = predictFor(centre, state.bookings, null);
  const completed = centreBookings.filter((b) => b.status === "payment_completed").length;
  const paidAmount = state.payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const byHour = [8, 9, 10, 11, 12, 13, 14, 15, 16].map((h) => ({
    hour: `${h}:00`,
    farmers: queue.filter((b) => new Date(b.created_at).getHours() === h).length,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<LayoutDashboard className="size-5" />}
        title={centre.name}
        subtitle={`${centre.city}, ${centre.district} · ${centre.active_counters} counters open`}
        action={<Badge tone={centre.is_operating ? "success" : "danger"}>
          {centre.is_operating ? "Operating" : "Closed"}
        </Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Farmers waiting"
          value={queue.length}
          tone="primary"
          icon={<Users className="size-4" />}
        />
        <Stat
          label="Estimated wait"
          value={minutesLabel(prediction.prediction_minutes)}
          hint={`Next turn near ${timeOf(prediction.predicted_turn_time)}`}
          tone="wheat"
          icon={<Timer className="size-4" />}
        />
        <Stat
          label="Completed today"
          value={completed}
          tone="success"
          icon={<Activity className="size-4" />}
        />
        <Stat
          label="Demo payments made"
          value={rupees(paidAmount)}
          icon={<IndianRupee className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h3 className="text-lg font-bold">Arrivals through the day</h3>
          <p className="text-sm text-muted-foreground">
            Based on the bookings currently in the queue.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="farmers" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Next farmers</h3>
            <Link to="/authority/queue">
              <Button variant="quiet" size="sm">
                Open queue
              </Button>
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {queue.slice(0, 6).map((b, i) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-strong px-3 py-2.5"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-card text-sm font-bold">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{farmerNameFor(b)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {b.token_number}
                    </span>
                  </span>
                </span>
                <Badge tone="wheat">{BOOKING_STATUS_LABEL[b.status]}</Badge>
              </li>
            ))}
            {queue.length === 0 ? (
              <li className="rounded-xl bg-surface-strong px-3 py-6 text-center text-sm text-muted-foreground">
                No farmers in the queue right now.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>

      <Notice tone="demo" title="Demo data">
        All figures come from sample data stored in this browser. Connecting a database and
        automation service later will replace this data without changing these screens.
      </Notice>
    </div>
  );
}
