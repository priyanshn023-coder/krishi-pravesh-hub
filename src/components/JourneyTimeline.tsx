import { Check } from "lucide-react";
import { JOURNEY_STAGES, type JourneyStage } from "@/types/domain";
import { cn } from "@/lib/utils";

const PLAIN: Record<JourneyStage, string> = {
  Registration: "You joined SmartMandi",
  "Centre Selected": "You chose a centre",
  "Slot Booked": "Your time is booked",
  "Token Generated": "Token and QR ready",
  "Arrived at Gate": "You reached the gate",
  Waiting: "Waiting for your turn",
  Processing: "Your wheat is being handled",
  "Quality Assessment": "Quality checked and weighed",
  "Procurement Completed": "Wheat taken by the centre",
  "Payment Initiated": "Payment started",
  "Payment Processing": "Payment on the way",
  "Payment Completed": "Payment finished",
};

export function JourneyTimeline({ current }: { current: JourneyStage }) {
  const currentIndex = JOURNEY_STAGES.indexOf(current);
  return (
    <ol className="relative space-y-1">
      {JOURNEY_STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              {i < JOURNEY_STAGES.length - 1 && (
                <span
                  className={cn(
                    "w-0.5 flex-1 bg-border",
                    done && "bg-success",
                    active && "bg-primary/40",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-4", active && "rounded-xl bg-primary-soft px-3 py-2 -mt-1")}>
              <p
                className={cn(
                  "font-bold",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stage}
                {active ? " — you are here" : ""}
              </p>
              <p className="text-sm text-muted-foreground">{PLAIN[stage]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
