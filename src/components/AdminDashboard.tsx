import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Clock, TrendingUp, Phone, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { io, Socket } from "socket.io-client";

type QueueItem = {
  id: string;
  token: string;
  name: string;
  numberOfPeople: number;
  status: "Waiting" | "Called" | "Seated";
  estimatedWaitMinutes: number | null;
  position: number;
  tableAssigned: number | null;
};

type TableItem = {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  reservation?: {
    name?: string;
    contactNumber?: string;
    reservationTime?: string;
    partySize?: number;
    notes?: string;
  } | null;
};

type ReservationFormState = {
  status: TableItem["status"];
  name: string;
  contactNumber: string;
  reservationTime: string;
  partySize: string;
  notes: string;
};

type DashboardData = {
  queue: QueueItem[];
  tables: TableItem[];
  summary: {
    totalPeopleWaiting: number;
    totalTablesAvailable: number;
    totalTablesOccupied: number;
    totalTablesReserved: number;
  };
};

const statusBadge: Record<TableItem["status"], string> = {
  available: "bg-success/15 text-success border-success/30",
  occupied: "bg-destructive/15 text-destructive border-destructive/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
};

const queueButtonState = new Set(["Waiting", "Called"]);
const emptyReservationForm: ReservationFormState = {
  status: "available",
  name: "",
  contactNumber: "",
  reservationTime: "",
  partySize: "",
  notes: "",
};

export const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [waitInputs, setWaitInputs] = useState<Record<string, string>>({});
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(emptyReservationForm);

  const stats = useMemo(() => {
    const queue = dashboard?.queue || [];
    const tables = dashboard?.tables || [];
    const seatedCount = queue.filter((entry) => entry.status === "Seated").length;

    return [
      { label: "People Waiting", value: String(dashboard?.summary.totalPeopleWaiting ?? 0), icon: Users, accent: "text-primary" },
      { label: "Active Queue", value: String(queue.filter((entry) => queueButtonState.has(entry.status)).length), icon: Clock, accent: "text-accent" },
      { label: "Tables Available", value: String(dashboard?.summary.totalTablesAvailable ?? 0), icon: TrendingUp, accent: "text-success" },
      { label: "Tables Reserved", value: String(dashboard?.summary.totalTablesReserved ?? 0), icon: Phone, accent: "text-warning" },
      { label: "Guests Seated", value: String(seatedCount), icon: Check, accent: "text-accent" },
    ];
  }, [dashboard]);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async (silent = false) => {
      if (!token) return;
      try {
        const data = await apiFetch<DashboardData>("/api/admin/dashboard", { token });
        if (!cancelled) {
          setDashboard(data);
          setWaitInputs(Object.fromEntries(data.queue.map((entry) => [entry.id, String(entry.estimatedWaitMinutes ?? "")])));
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Not authorized") {
          logout();
        }
        if (!silent) {
          toast.error("Could not load admin dashboard", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    const socket = io(API_BASE_URL);
    socket.on("queueUpdated", () => {
      loadDashboard(true);
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [logout, token]);

  const mutate = async (
    key: string,
    request: () => Promise<unknown>,
    successMessage: string,
    successDescription?: string,
  ) => {
    setBusyKey(key);
    try {
      await request();
      toast.success(successMessage, successDescription ? { description: successDescription } : undefined);
      if (!token) return;
      const next = await apiFetch<DashboardData>("/api/admin/dashboard", { token });
      setDashboard(next);
      setWaitInputs(Object.fromEntries(next.queue.map((entry) => [entry.id, String(entry.estimatedWaitMinutes ?? "")])));
    } catch (error) {
      toast.error("Action failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const queue = dashboard?.queue || [];
  const tables = dashboard?.tables || [];

  const openEditTable = (table: TableItem) => {
    setEditingTable(table);
    setReservationForm({
      status: table.status,
      name: table.reservation?.name || "",
      contactNumber: table.reservation?.contactNumber || "",
      reservationTime: table.reservation?.reservationTime || "",
      partySize: table.reservation?.partySize ? String(table.reservation.partySize) : "",
      notes: table.reservation?.notes || "",
    });
  };

  const closeEditTable = () => {
    setEditingTable(null);
    setReservationForm(emptyReservationForm);
  };

  const updateReservationForm = (key: keyof ReservationFormState, value: string) => {
    setReservationForm((current) => ({ ...current, [key]: value }));
  };

  const bulkUpdateTables = async (
    status: TableItem["status"],
    key: string,
    successMessage: string,
    successDescription?: string,
  ) => {
    await mutate(
      key,
      () =>
        apiFetch("/api/admin/tables/bulk", {
          method: "PUT",
          token,
          body: { status },
        }),
      successMessage,
      successDescription,
    );
  };

  const saveTableReservation = async () => {
    if (!editingTable) return;

    const partySize = Number(reservationForm.partySize);
    const hasReservationDetails =
      reservationForm.name.trim() ||
      reservationForm.contactNumber.trim() ||
      reservationForm.reservationTime.trim() ||
      reservationForm.notes.trim() ||
      reservationForm.partySize.trim();

    if (
      reservationForm.status === "reserved" &&
      (
        !reservationForm.name.trim() ||
        !reservationForm.contactNumber.trim() ||
        !reservationForm.reservationTime.trim() ||
        !Number.isFinite(partySize)
      )
    ) {
      toast.error("Reserved tables need guest name, contact, time, and party size");
      return;
    }

    if (reservationForm.partySize.trim()) {
      if (!Number.isFinite(partySize) || partySize < 1 || partySize > editingTable.capacity) {
        toast.error(`Party size must be between 1 and ${editingTable.capacity}`);
        return;
      }
    }

    await mutate(
      `edit-table-${editingTable._id}`,
      () =>
        apiFetch(`/api/admin/tables/${editingTable._id}/status`, {
          method: "PUT",
          token,
          body: {
            status: reservationForm.status,
            reservation:
              reservationForm.status === "available" && !hasReservationDetails
                ? undefined
                : {
                    name: reservationForm.name.trim(),
                    contactNumber: reservationForm.contactNumber.trim(),
                    reservationTime: reservationForm.reservationTime.trim(),
                    partySize: reservationForm.partySize.trim() ? partySize : undefined,
                    notes: reservationForm.notes.trim(),
                  },
          },
        }),
      `Table ${editingTable.tableNumber} updated`,
      reservationForm.status === "available" ? "Reservation details cleared" : "Reservation details saved",
    );

    closeEditTable();
  };

  return (
    <section id="admin" className="py-24 bg-gradient-warm">
      <div className="container">
        <div className="mb-10 animate-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Admin</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">Operations Dashboard</h2>
            <p className="text-muted-foreground text-lg mt-3">Live queue, table status, and seating actions.</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-8 h-12 border-primary/20 hover:bg-primary/5 shadow-soft"
            onClick={() => window.location.href = "/admin/analytics"}
          >
            <TrendingUp className="w-4 h-4 mr-2 text-accent" /> View Analytics
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 hover-lift animate-scale-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center">
                  <s.icon className={`w-5 h-5 ${s.accent}`} />
                </div>
              </div>
              <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl font-semibold text-primary">Queue Control</h3>
              <span className="text-sm text-muted-foreground">{queue.length} entries</span>
            </div>

            <div className="space-y-2">
              {queue.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-background border border-border/60">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="font-display text-xl font-bold text-primary w-16">{entry.token}</div>
                    <div className="text-sm min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      <div className="text-muted-foreground text-xs">
                        Party of {entry.numberOfPeople} · Position #{entry.position} · {entry.status}
                        {entry.tableAssigned ? ` · Table ${entry.tableAssigned}` : ""}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="600"
                          value={waitInputs[entry.id] ?? ""}
                          onChange={(e) =>
                            setWaitInputs((current) => ({
                              ...current,
                              [entry.id]: e.target.value,
                            }))
                          }
                          className="h-8 w-24"
                          placeholder="mins"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyKey === `wait-${entry.id}`}
                          onClick={() =>
                            mutate(
                              `wait-${entry.id}`,
                              () =>
                                apiFetch(`/api/admin/queue/${entry.id}/wait-estimate`, {
                                  method: "PUT",
                                  token,
                                  body: { estimatedWaitMinutes: Number(waitInputs[entry.id] || 0) },
                                }),
                              `${entry.token} wait updated`,
                              `${waitInputs[entry.id] || 0} minutes`,
                            )
                          }
                        >
                          Save Wait
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {entry.estimatedWaitMinutes !== null ? `${entry.estimatedWaitMinutes}m live` : "not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `call-${entry.id}` || entry.status !== "Waiting"}
                      onClick={() =>
                        mutate(
                          `call-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}/call`, { method: "PUT", token }),
                          `${entry.token} called`,
                          entry.tableAssigned ? `Assigned table ${entry.tableAssigned}` : undefined,
                        )
                      }
                    >
                      <Phone className="w-4 h-4 text-accent" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `seat-${entry.id}` || entry.status === "Seated"}
                      onClick={() =>
                        mutate(
                          `seat-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}/seat`, { method: "PUT", token }),
                          `${entry.token} seated`,
                        )
                      }
                    >
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `remove-${entry.id}`}
                      onClick={() =>
                        mutate(
                          `remove-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}`, { method: "DELETE", token }),
                          `${entry.token} removed`,
                        )
                      }
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {!loading && queue.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No guests are currently in the queue.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-2xl font-semibold text-primary">Table Management</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyKey === "bulk-occupied" || tables.length === 0}
                  onClick={() =>
                    bulkUpdateTables(
                      "occupied",
                      "bulk-occupied",
                      "All tables updated",
                      "Marked all tables occupied",
                    )
                  }
                >
                  Occupied All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyKey === "bulk-available" || tables.length === 0}
                  onClick={() =>
                    bulkUpdateTables(
                      "available",
                      "bulk-available",
                      "All tables updated",
                      "Marked all tables not occupied",
                    )
                  }
                >
                  Not Occupied All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tables.map((table) => (
                <div key={table._id} className="bg-background rounded-xl p-4 border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-display text-lg font-bold text-primary">T{table.tableNumber}</div>
                      <div className="text-xs text-muted-foreground">{table.capacity} seats</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusBadge[table.status]}`}>
                      {table.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-3 min-h-[72px]">
                    <div>
                      Reserved for: <span className="font-medium text-foreground">{table.reservation?.name || "Walk-in / none"}</span>
                    </div>
                    <div>
                      Contact: <span className="font-medium text-foreground">{table.reservation?.contactNumber || "Not set"}</span>
                    </div>
                    <div>
                      Time / party: <span className="font-medium text-foreground">
                        {table.reservation?.reservationTime || "Not set"}
                        {table.reservation?.partySize ? ` · ${table.reservation.partySize} guests` : ""}
                      </span>
                    </div>
                    {table.reservation?.notes && (
                      <div>
                        Notes: <span className="font-medium text-foreground">{table.reservation.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "reserved", "occupied"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={table.status === status ? "default" : "outline"}
                        size="sm"
                        disabled={busyKey === `table-${table._id}-${status}`}
                        onClick={() =>
                          mutate(
                            `table-${table._id}-${status}`,
                            () =>
                              apiFetch(`/api/admin/tables/${table._id}/status`, {
                                method: "PUT",
                                token,
                                body: { status },
                              }),
                            `Table ${table.tableNumber} updated`,
                            `Marked ${status}`,
                          )
                        }
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openEditTable(table)}
                  >
                    Edit
                  </Button>
                </div>
              ))}

              {!loading && tables.length === 0 && (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No table data is available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={Boolean(editingTable)} onOpenChange={(open) => !open && closeEditTable()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? `Edit Table T${editingTable.tableNumber}` : "Edit Table"}
            </DialogTitle>
            <DialogDescription>
              Update table status and reservation details for the selected table.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm">Status</Label>
              <select
                value={reservationForm.status}
                onChange={(e) => updateReservationForm("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="available">available</option>
                <option value="reserved">reserved</option>
                <option value="occupied">occupied</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Guest Name</Label>
              <Input value={reservationForm.name} onChange={(e) => updateReservationForm("name", e.target.value)} placeholder="Guest name" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Contact Number</Label>
              <Input value={reservationForm.contactNumber} onChange={(e) => updateReservationForm("contactNumber", e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Reservation Time</Label>
              <Input value={reservationForm.reservationTime} onChange={(e) => updateReservationForm("reservationTime", e.target.value)} placeholder="2026-04-27 19:30" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">
                Party Size {editingTable ? `(max ${editingTable.capacity})` : ""}
              </Label>
              <Input
                type="number"
                min="1"
                max={editingTable?.capacity || 20}
                value={reservationForm.partySize}
                onChange={(e) => updateReservationForm("partySize", e.target.value)}
                placeholder="4"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Notes</Label>
              <Textarea
                rows={4}
                value={reservationForm.notes}
                onChange={(e) => updateReservationForm("notes", e.target.value)}
                placeholder="Birthday, window seat, allergy note..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditTable}>
              Cancel
            </Button>
            <Button
              onClick={saveTableReservation}
              disabled={busyKey === `edit-table-${editingTable?._id || ""}`}
            >
              {busyKey === `edit-table-${editingTable?._id || ""}` ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
