import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Status = "available" | "occupied" | "reserved";
type Reservation = {
  name?: string;
  contactNumber?: string;
  reservationTime?: string;
  partySize?: number;
  notes?: string;
  payment?: {
    amount?: number;
    currency?: string;
    status?: "pending" | "paid" | "failed";
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
    cardLast4?: string;
  } | null;
};
type Table = {
  id: string;
  tableNumber: number;
  seats: number;
  status: Status;
  reservation?: Reservation | null;
};

const statusColor: Record<Status, string> = {
  available: "bg-success/85 hover:bg-success border-success text-white",
  occupied: "bg-destructive/85 border-destructive text-white",
  reserved: "bg-warning/85 border-warning text-white",
};

const statusLabel: Record<Status, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
};

const emptyReservation = {
  name: "",
  contactNumber: "",
  reservationTime: "",
  partySize: "2",
  notes: "",
};

const emptyPaymentForm = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

const RESERVATION_FEE = 100;

export const TableLayout = () => {
  const { user } = useAuth();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyReservation);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const counts = useMemo(
    () => ({
      available: tables.filter((t) => t.status === "available").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      seats2: tables.filter((t) => t.seats === 2).length,
      seats4: tables.filter((t) => t.seats === 4).length,
      seats6: tables.filter((t) => t.seats === 6).length,
    }),
    [tables],
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  );

  useEffect(() => {
    if (!selectedTable) return;

    const partySize = Math.min(selectedTable.seats, user ? 2 : selectedTable.seats);
    setForm({
      name: selectedTable.reservation?.name || user?.name || "",
      contactNumber: selectedTable.reservation?.contactNumber || user?.contactNumber || "",
      reservationTime: selectedTable.reservation?.reservationTime || "",
      partySize: String(selectedTable.reservation?.partySize || partySize),
      notes: selectedTable.reservation?.notes || "",
    });
    setPaymentForm((current) => ({
      ...current,
      cardholderName: user?.name || current.cardholderName || "",
    }));
  }, [selectedTable, user]);

  useEffect(() => {
    let cancelled = false;

    const load = async (silent = false) => {
      try {
        const data = await apiFetch<{
          tables: Array<{
            _id: string;
            tableNumber: number;
            capacity: number;
            status: Status;
            reservation?: Reservation | null;
          }>;
        }>("/api/tables");
        if (cancelled) return;
        setTables(
          data.tables.map((table) => ({
            id: table._id,
            tableNumber: table.tableNumber,
            seats: table.capacity,
            status: table.status,
            reservation: table.reservation || null,
          })),
        );
      } catch (error) {
        if (!silent) {
          toast.error("Could not load tables", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(() => {
      load(true);
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const updateForm = (key: keyof typeof emptyReservation, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePaymentForm = (key: keyof typeof emptyPaymentForm, value: string) => {
    setPaymentForm((current) => ({ ...current, [key]: value }));
  };

  const reserveTable = async () => {
    if (!selectedTable) return;

    const partySize = Number(form.partySize);
    if (!form.name.trim() || !form.contactNumber.trim() || !form.reservationTime.trim()) {
      toast.error("Please complete the reservation details");
      return;
    }
    if (!Number.isFinite(partySize) || partySize < 1 || partySize > selectedTable.seats) {
      toast.error(`Party size must be between 1 and ${selectedTable.seats}`);
      return;
    }
    if (
      !paymentForm.cardholderName.trim() ||
      !paymentForm.cardNumber.trim() ||
      !paymentForm.expiry.trim() ||
      !paymentForm.cvv.trim()
    ) {
      toast.error("Please complete the payment details");
      return;
    }

    setSaving(true);
    try {
      const paymentData = await apiFetch<{
        payment: NonNullable<Reservation["payment"]>;
      }>("/api/payments/reservation", {
        method: "POST",
        body: {
          tableId: selectedTable.id,
          amount: RESERVATION_FEE,
          cardholderName: paymentForm.cardholderName.trim(),
          cardNumber: paymentForm.cardNumber.trim(),
          expiry: paymentForm.expiry.trim(),
          cvv: paymentForm.cvv.trim(),
        },
      });

      const data = await apiFetch<{
        table: {
          _id: string;
          status: Status;
          reservation?: Reservation | null;
        };
      }>(`/api/tables/${selectedTable.id}/status`, {
        method: "PUT",
        body: {
          status: "reserved",
          reservation: {
            name: form.name.trim(),
            contactNumber: form.contactNumber.trim(),
            reservationTime: form.reservationTime,
            partySize,
            notes: form.notes.trim(),
            payment: paymentData.payment,
          },
        },
      });

      setTables((current) =>
        current.map((table) =>
          table.id === selectedTable.id
            ? {
                ...table,
                status: data.table.status,
                reservation: data.table.reservation || null,
              }
            : table,
        ),
      );
      toast.success(`Table ${selectedTable.tableNumber} reserved`, {
        description: `${form.name.trim()} · Party of ${partySize} · Paid Rs. ${RESERVATION_FEE}`,
      });
      setPaymentForm(emptyPaymentForm);
    } catch (error) {
      toast.error("Could not reserve table", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="tables" className="py-10 md:py-16 bg-gradient-warm">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8 animate-slide-up">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-2 sm:mb-3">Floor Plan</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4">
            Pick the perfect table
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg">
            30 tables with a practical mix: 5 for couples, 15 for groups of 4, and 10 for groups of 6.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          <TooltipProvider delayDuration={100}>
            <div className="lg:col-span-3 relative bg-card rounded-2xl sm:rounded-3xl shadow-elegant border border-border/50 p-4 sm:p-6 md:p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.08),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative flex items-center justify-between mb-5 text-xs font-semibold tracking-widest text-muted-foreground">
                <span>ENTRANCE ▸</span>
                <span>◂ KITCHEN</span>
              </div>

              <div className="relative grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4">
                {tables.map((table) => (
                  <Tooltip key={table.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedTableId(table.id)}
                        className={cn(
                          "relative aspect-square border-2 grid place-items-center rounded-xl shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          statusColor[table.status],
                          selectedTableId === table.id && "ring-4 ring-accent ring-offset-2 ring-offset-card",
                        )}
                        aria-label={`Table ${table.tableNumber}, ${table.seats} seats, ${statusLabel[table.status]}`}
                      >
                        <div className="text-center leading-tight">
                          <div className="font-display text-base sm:text-lg font-bold">T{table.tableNumber}</div>
                          <div className="text-[10px] opacity-90">{table.seats} seats</div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-medium max-w-xs">
                      <div>Table {table.tableNumber} - Seats {table.seats} - {statusLabel[table.status]}</div>
                      {table.reservation?.name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Reserved for {table.reservation.name}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
                 {!loading && tables.length === 0 && (
                   <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                     No table data available right now.
                   </div>
                 )}
                </div>
             </div>
          </TooltipProvider>

           <div className="space-y-3 sm:space-y-4">
            <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-3 sm:mb-4">Legend</h3>
              <div className="space-y-2 sm:space-y-3">
                {(["available", "reserved", "occupied"] as Status[]).map((status) => (
                  <div key={status} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className={cn("w-4 h-4 rounded border-2", statusColor[status])} />
                    <span>{statusLabel[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-3 sm:mb-4">Capacity Mix</h3>
              <div className="space-y-2 sm:space-y-3">
                <Stat label="2-seat tables" value={counts.seats2} accent="text-primary" />
                <Stat label="4-seat tables" value={counts.seats4} accent="text-accent" />
                <Stat label="6-seat tables" value={counts.seats6} accent="text-success" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-4">
                {selectedTable ? `Table T${selectedTable.tableNumber}` : "Reservation Details"}
              </h3>

              {!selectedTable && (
                <p className="text-sm text-muted-foreground">
                  Select a table to reserve it or review its reservation details.
                </p>
              )}

              {selectedTable && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{selectedTable.seats} seats</div>
                      <div className="font-medium text-primary">{statusLabel[selectedTable.status]}</div>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider",
                      selectedTable.status === "available" && "bg-success/15 text-success border-success/30",
                      selectedTable.status === "reserved" && "bg-warning/15 text-warning border-warning/30",
                      selectedTable.status === "occupied" && "bg-destructive/15 text-destructive border-destructive/30",
                    )}>
                      {selectedTable.status}
                    </span>
                  </div>

                  {selectedTable.status === "available" ? (
                    <div className="space-y-3">
                      <Field label="Guest Name">
                        <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Aayush Kulkarni" />
                      </Field>
                      <Field label="Contact Number">
                        <Input value={form.contactNumber} onChange={(e) => updateForm("contactNumber", e.target.value)} placeholder="+91 98765 43210" />
                      </Field>
                      <Field label="Reservation Time">
                        <Input type="datetime-local" value={form.reservationTime} onChange={(e) => updateForm("reservationTime", e.target.value)} />
                      </Field>
                      <Field label={`Party Size (max ${selectedTable.seats})`}>
                        <Input type="number" min="1" max={selectedTable.seats} value={form.partySize} onChange={(e) => updateForm("partySize", e.target.value)} />
                      </Field>
                      <Field label="Notes">
                        <Textarea
                          value={form.notes}
                          onChange={(e) => updateForm("notes", e.target.value)}
                          placeholder="Birthday, window table, high chair, dietary note..."
                          rows={3}
                        />
                      </Field>
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-primary">Mock Payment Gateway</p>
                            <p className="text-xs text-muted-foreground">
                              Pay the reservation fee before we block this table for you.
                            </p>
                          </div>
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                            Rs. {RESERVATION_FEE}
                          </span>
                        </div>
                        <Field label="Cardholder Name">
                          <Input
                            value={paymentForm.cardholderName}
                            onChange={(e) => updatePaymentForm("cardholderName", e.target.value)}
                            placeholder="Aayush Kulkarni"
                          />
                        </Field>
                        <Field label="Card Number">
                          <Input
                            value={paymentForm.cardNumber}
                            onChange={(e) => updatePaymentForm("cardNumber", e.target.value)}
                            placeholder="4111 1111 1111 1111"
                            inputMode="numeric"
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Expiry (MM/YY)">
                            <Input
                              value={paymentForm.expiry}
                              onChange={(e) => updatePaymentForm("expiry", e.target.value)}
                              placeholder="12/28"
                            />
                          </Field>
                          <Field label="CVV">
                            <Input
                              value={paymentForm.cvv}
                              onChange={(e) => updatePaymentForm("cvv", e.target.value)}
                              placeholder="123"
                              inputMode="numeric"
                            />
                          </Field>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Demo mode: this is a fake gateway for testing reservations only.
                        </p>
                      </div>
                      <Button className="w-full" onClick={reserveTable} disabled={saving}>
                        {saving ? "Processing Payment..." : `Pay Rs. ${RESERVATION_FEE} & Reserve Table T${selectedTable.tableNumber}`}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <Detail label="Reserved For" value={selectedTable.reservation?.name || "Not provided"} />
                      <Detail label="Contact" value={selectedTable.reservation?.contactNumber || "Not provided"} />
                      <Detail label="Time" value={selectedTable.reservation?.reservationTime || "Not provided"} />
                      <Detail label="Party Size" value={selectedTable.reservation?.partySize ? String(selectedTable.reservation.partySize) : "Not provided"} />
                      <Detail label="Notes" value={selectedTable.reservation?.notes || "No notes"} />
                      <Detail
                        label="Payment"
                        value={
                          selectedTable.reservation?.payment?.status === "paid"
                            ? `Paid Rs. ${selectedTable.reservation.payment.amount || RESERVATION_FEE}`
                            : "Not paid"
                        }
                      />
                      <Detail
                        label="Transaction"
                        value={selectedTable.reservation?.payment?.transactionId || "Not provided"}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-4">Tonight</h3>
              <div className="space-y-3">
                <Stat label="Available" value={counts.available} accent="text-success" />
                <Stat label="Reserved" value={counts.reserved} accent="text-warning" />
                <Stat label="Occupied" value={counts.occupied} accent="text-destructive" />
                <div className="pt-3 border-t border-border flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total tables</span>
                  <span className="font-display text-2xl font-bold text-primary">{tables.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn("font-display text-2xl font-bold", accent)}>{value}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="mb-1.5 block text-sm">{label}</Label>
    {children}
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right text-primary font-medium">{value}</span>
  </div>
);
