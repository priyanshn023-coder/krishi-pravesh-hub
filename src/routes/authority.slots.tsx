import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Badge, Button, Card, Field, Notice, SectionTitle, TextInput } from "@/components/ui-kit";
import { useAuthorityCentre, useSmartMandi } from "@/store/SmartMandiProvider";
import { friendlyDate } from "@/lib/format";
import { WHEAT } from "@/lib/demoData";

export const Route = createFileRoute("/authority/slots")({
  component: AuthoritySlots,
});

function AuthoritySlots() {
  const { state, createSlot, updateSlot } = useSmartMandi();
  const centre = useAuthorityCentre();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    slot_date: today,
    start_time: "09:00",
    end_time: "11:00",
    capacity: "12",
  });
  const [error, setError] = useState<string | null>(null);

  const slots = state.slots
    .filter((s) => s.centre_id === centre.id)
    .sort((a, b) =>
      `${a.slot_date}${a.start_time}`.localeCompare(`${b.slot_date}${b.start_time}`),
    );

  function add() {
    const capacity = Number(form.capacity);
    if (!form.slot_date || !form.start_time || !form.end_time) {
      setError("Please fill the date and both times.");
      return;
    }
    if (form.end_time <= form.start_time) {
      setError("End time must be after start time.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    setError(null);
    createSlot({
      centre_id: centre.id,
      crop_id: WHEAT.id,
      slot_date: form.slot_date,
      start_time: form.start_time,
      end_time: form.end_time,
      capacity,
      status: "open",
    });
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<CalendarRange className="size-5" />}
        title="Slots and capacity"
        subtitle="Open, close and add wheat procurement slots for this centre."
      />

      <Card>
        <h3 className="text-lg font-bold">Add a slot</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Date">
            <TextInput
              type="date"
              value={form.slot_date}
              min={today}
              onChange={(e) => setForm({ ...form, slot_date: e.target.value })}
            />
          </Field>
          <Field label="Start">
            <TextInput
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </Field>
          <Field label="End">
            <TextInput
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </Field>
          <Field label="Capacity">
            <TextInput
              inputMode="numeric"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })
              }
            />
          </Field>
        </div>
        {error ? <p className="mt-2 font-semibold text-destructive">{error}</p> : null}
        <Button className="mt-4" onClick={add}>
          <Plus className="size-4" /> Add slot
        </Button>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-surface-strong text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => {
              const remaining = Math.max(0, s.capacity - s.booked_count);
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{friendlyDate(s.slot_date)}</td>
                  <td className="px-4 py-3">
                    {s.start_time} – {s.end_time}
                  </td>
                  <td className="px-4 py-3">{s.capacity}</td>
                  <td className="px-4 py-3">{s.booked_count}</td>
                  <td className="px-4 py-3 font-semibold">{remaining}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.status === "open" ? "success" : "danger"}>
                      {s.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={s.status === "open" ? "quiet" : "primary"}
                      onClick={() => updateSlot(s.id, { status: s.status === "open" ? "closed" : "open" })}
                    >
                      {s.status === "open" ? "Close" : "Open"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Notice tone="demo">
        Slot changes are saved in this browser only. Farmers using this demo see the updated
        capacity immediately.
      </Notice>
    </div>
  );
}
