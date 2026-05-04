import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
  Legend,
  LabelList,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Car,
  Gauge,
  Layers,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(187 100% 70%)",
  "hsl(271 91% 80%)",
  "hsl(38 95% 75%)",
];

import { fetchDashboardData } from "@/lib/fetchDashboardData";
const utilColor = (v: number) => {
  if (v >= 60) return "hsl(var(--success))";
  if (v >= 30) return "hsl(var(--chart-1))";
  if (v >= 15) return "hsl(var(--warning))";
  return "hsl(var(--danger))";
};

const Index = () => {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllOperators, setShowAllOperators] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleDateFilter, setVehicleDateFilter] = useState("");
  const [vehicleSearchFilter, setVehicleSearchFilter] = useState("");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  // 🔥 Loading fix
  if (isLoading) return <div>Loading...</div>;

  // 🔥 API data
const rawData = data?.raw || [];

const filteredMonthlyMap: any = {};
rawData.forEach((item: any) => {
  const matchDevice =
    selectedDevice === "all" || item.device === selectedDevice;

  const [day, month] = item.date.split("/");
  const itemDate = new Date(2026, month - 1, day);

  const matchStart = startDate ? itemDate >= new Date(startDate) : true;
  const matchEnd = endDate ? itemDate <= new Date(endDate) : true;

  if (!matchDevice || !matchStart || !matchEnd) return;

  const monthKey = item.date.split("/")[1]; // MM

  if (!filteredMonthlyMap[monthKey]) {
    filteredMonthlyMap[monthKey] = 0;
  }

  filteredMonthlyMap[monthKey] += item.duration;
});

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const filteredMonthly = Object.keys(filteredMonthlyMap).map(m => {
  const hours = filteredMonthlyMap[m];
  const daysInMonth = new Date(2026, Number(m), 0).getDate();
  const deviceCount = new Set(rawData.map(d => d.device)).size;
const maxHours = daysInMonth * 24 * deviceCount;

  return {
    month: monthNames[Number(m) - 1],
    hours,
    utilization: Number(((hours / maxHours) * 100).toFixed(1))
  };
});

// 🔥 STEP 1: Device list
const devices = [
  "all",
  ...new Set(rawData.map((d: any) => d.device))
];
const filteredDevices = devices.filter((d) =>
  d === "all" || d.toLowerCase().includes(deviceSearch.toLowerCase())
);

// 🔥 STEP 2: Filter logic
const filteredMap: any = {};

rawData.forEach((item: any) => {
  const matchDevice =
    selectedDevice === "all" || item.device === selectedDevice;

  const [day, month] = item.date.split("/");
  const itemDate = new Date(2026, month - 1, day);

  const matchStart = startDate ? itemDate >= new Date(startDate) : true;
  const matchEnd = endDate ? itemDate <= new Date(endDate) : true;

  if (!matchDevice || !matchStart || !matchEnd) return;

  // 🔥 GROUP BY DATE
  if (!filteredMap[item.date]) {
    filteredMap[item.date] = 0;
  }

  filteredMap[item.date] += item.duration;
});

// 🔥 FINAL DATA FOR CHART
const deviceCount = new Set(rawData.map(d => d.device)).size;

const filteredDaily = Object.keys(filteredMap)
  .map(date => {
    const hours = filteredMap[date];
    const maxHours = 24 * deviceCount;

    return {
      date,
      hours,
      utilization: Number(((hours / maxHours) * 100).toFixed(1))
    };
  })
  .sort((a, b) => {
    const [d1, m1] = a.date.split("/");
    const [d2, m2] = b.date.split("/");
    return new Date(2026, m1 - 1, d1) - new Date(2026, m2 - 1, d2);
  });
  const overspeedTracking = data?.overspeed || [];

  // (empty for now)
  const departmentUtilization = [];
const operatorTrips = [];
 const vehicleMap: any = {};

rawData.forEach((item: any) => {
  const deviceId = item.device;
const machineNo = item.machine || item.device;
  if (!deviceId) return;

  const [day, month] = item.date.split("/");
  const itemDate = new Date(2026, month - 1, day);

  const matchDevice =
    selectedDevice === "all" || deviceId === selectedDevice;

  const matchStart = startDate ? itemDate >= new Date(startDate) : true;
  const matchEnd = endDate ? itemDate <= new Date(endDate) : true;

  const year = itemDate.getFullYear();
  const monthStr = String(itemDate.getMonth() + 1).padStart(2, "0");
  const dayStr = String(itemDate.getDate()).padStart(2, "0");
  const formattedItemDate = `${year}-${monthStr}-${dayStr}`;

  const matchVehicleDate = !vehicleDateFilter || formattedItemDate === vehicleDateFilter;
  const matchVehicleSearch = !vehicleSearchFilter || machineNo.toLowerCase().includes(vehicleSearchFilter.toLowerCase());

  if (!matchDevice || !matchStart || !matchEnd || !matchVehicleDate || !matchVehicleSearch) return;

  if (!vehicleMap[deviceId]) {
   vehicleMap[deviceId] = {
  device: deviceId,
  machine: machineNo, // ✅ add
  totalDuration: 0,
  uniqueDays: new Set(),
};
  }

  vehicleMap[deviceId].totalDuration += item.duration;

  // ✅ unique date count
  vehicleMap[deviceId].uniqueDays.add(item.date);
});

const vehicleUtilization = Object.values(vehicleMap).map((v: any) => {
  const days = v.uniqueDays.size || 1;
  const avgHours = v.totalDuration / days;

  return {
    vehicle: v.machine || v.device,
    utilization: Number(((avgHours / 24) * 100).toFixed(1)),
  };
});

// ✅ SORT + LIMIT (IMPORTANT)


// ✅ FIRST SORT
const sortedVehicles = [...vehicleUtilization].sort(
  (a, b) => b.utilization - a.utilization
);

// ✅ THEN LIMIT
const displayedVehicles = showAllVehicles
  ? sortedVehicles
  : sortedVehicles.slice(0, 10);
  // 🔥 crash fix
  const totalHours =
  filteredMonthly.length > 0
    ? filteredMonthly.reduce((s, m) => s + m.hours, 0).toFixed(0)
    : 0;

  const avgUtil =
  filteredMonthly.length > 0
    ? (
        filteredMonthly.reduce((s, m) => s + m.utilization, 0) /
        filteredMonthly.length
      ).toFixed(1)
    : 0;
// ✅ normalize date
const normalizeDate = (date: string) => {
  if (!date) return "";

  // ISO format
  const d = new Date(date);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  // dd-mm-yyyy
  if (date.includes("-")) {
    const parts = date.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return "";
};
  const totalVehicles = vehicleUtilization.length;
const cleanedOverspeed = overspeedTracking.filter(
  (o: any) => o.operator !== "Grand Total" && o.date !== "Grand Total"
);
const uniqueMap = new Map();

cleanedOverspeed.forEach((item: any) => {
  const key = item.operator + "_" + normalizeDate(item.date);

  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, item);
  }
});

const finalData = Array.from(uniqueMap.values());

console.log("FINAL DATA 👉", finalData);
console.log("CLEANED DATA 👉", cleanedOverspeed);
 const totalOverspeed =
  finalData.length > 0
    ? finalData.reduce((s: number, o: any) => s + o.count, 0)
    : 0;

  

  
// ✅ remove total row


// ✅ GROUP BY OPERATOR + DATE FILTER
const operatorMap: any = {};

cleanedOverspeed.forEach((item: any) => {
  const operator = item.operator;
  const date = normalizeDate(item.date);
  const count = item.count || 0;

  const matchDate = !selectedDate || date === selectedDate;
  if (!matchDate) return;

  if (!operatorMap[operator]) {
    operatorMap[operator] = {
      operator,
      dates: {},
    };
  }

  if (!operatorMap[operator].dates[date]) {
    operatorMap[operator].dates[date] = 0;
  }

  operatorMap[operator].dates[date] = count;
});


// ✅ TOTAL CALCULATION (ONLY ONCE, LOOP KE BAAD)
// ✅ TOTAL CALCULATION
Object.values(operatorMap).forEach((op: any) => {
  op.total = Object.values(op.dates).reduce(
    (sum: number, val: any) => sum + val,
    0
  );
});

// ✅ FINAL SORT
const sortedOverspeed = Object.values(operatorMap).sort(
  (a: any, b: any) => b.total - a.total
);  const displayedOperators = showAllOperators
  ? sortedOverspeed
  : sortedOverspeed.slice(0, 7);
  const operatorDetails =
  selectedOperator && operatorMap[selectedOperator]
    ? Object.entries(operatorMap[selectedOperator].dates).map(
        ([date, count]) => ({
          date,
          count,
        })
      )
    : [];
const overspeedAvg =
  sortedOverspeed.length > 0
    ? sortedOverspeed.reduce((s: number, o: any) => s + o.total, 0) /
      sortedOverspeed.length
    : 0;

  // 🔥 compute displayDaily
  const displayDaily = (() => {
    if (dailyStartDate || dailyEndDate) {
      return filteredDaily.filter((item: any) => {
        const [d, m] = item.date.split("/");
        const itemDate = new Date(2026, Number(m) - 1, Number(d));
        const matchStart = dailyStartDate ? itemDate >= new Date(dailyStartDate) : true;
        const matchEnd = dailyEndDate ? itemDate <= new Date(dailyEndDate) : true;
        return matchStart && matchEnd;
      });
    }
    return filteredDaily.slice(-7);
  })();

  // 🔥 peak fix
  const peakDay =
  displayDaily.length > 0
    ? displayDaily.reduce((a: any, b: any) =>
          a.utilization > b.utilization ? a : b
        )
      : { date: "-", utilization: 0 };

  const kpis = [
    {
      label: "Total Hours",
      value: totalHours,
      sub: "May–Dec 2023",
      icon: <Activity className="h-5 w-5" />,
      gradient: "from-chart-1/20 to-chart-2/20",
    },
    {
      label: "Avg Utilization",
      value: `${avgUtil}%`,
      sub: "Across all months",
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "from-chart-3/20 to-chart-1/20",
    },
    {
      label: "Total Vehicles",
      value: totalVehicles,
      sub: "Tracked daily",
      icon: <Car className="h-5 w-5" />,
      gradient: "from-chart-2/20 to-chart-5/20",
    },
    {
      label: "OverSpeed Events",
      value: totalOverspeed.toLocaleString(),
      sub: "Daily tracking",
      icon: <AlertTriangle className="h-5 w-5" />,
      gradient: "from-chart-4/20 to-danger/20",
    },
  ];

  // 👉 rest code SAME hai (maine touch nahi kiya)

  const podiumStyles = [
    {
      bg: "var(--gradient-danger)",
      ring: "ring-danger/40",
      label: "1st Worst",
      crown: "text-danger",
    },
    {
      bg: "var(--gradient-warning)",
      ring: "ring-warning/40",
      label: "2nd",
      crown: "text-warning",
    },
    {
      bg: "linear-gradient(135deg, hsl(var(--chart-4)), hsl(var(--chart-2)))",
      ring: "ring-chart-4/40",
      label: "3rd",
      crown: "text-chart-4",
    },
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-12 space-y-8">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-6 md:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "var(--gradient-glow)" }}
          />

          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live Analytics
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                Vehicle Utilization{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  Dashboard
                </span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl">
                Monthly, daily, vehicle, department & operator insights with
                overspeed leaderboard.
              </p>
            </div>
            {/* FILTERS TOP RIGHT */}
            
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={`rounded-2xl border border-border bg-gradient-to-br ${k.gradient} p-5 transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {k.label}
                  </span>
                  <span className="text-primary">{k.icon}</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {k.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>
              </div>
            ))}
          </div>
        </header>
{/* ✅ NEW FILTER BAR */}
<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-wrap items-center gap-3">
  {/* Label */}
  <div className="flex items-center gap-2 text-sm text-gray-300">
    <span className="text-cyan-400">🔽</span>
    <span>Filters</span>
  </div>

  {/* Date Range */}
  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2 rounded-xl">
    <span>📅</span>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="bg-transparent outline-none text-white"
    />
    <span className="text-gray-500">→</span>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="bg-transparent outline-none text-white"
    />
  </div>

  {/* Device Dropdown */}
  <select
    value={selectedDevice}
    onChange={(e) => setSelectedDevice(e.target.value)}
    className="bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-white"
  >
    <option value="all">All Vehicles</option>
    {filteredDevices.map((d: any) => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}
  </select>

  {/* Buttons */}
  <button
    onClick={() => {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    }}
    className="bg-cyan-500 text-white px-3 py-2 rounded-xl text-sm"
  >
    Today
  </button>

  <button
    onClick={() => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const last = new Date().toISOString().split("T")[0];
      setStartDate(first);
      setEndDate(last);
    }}
    className="bg-cyan-500 text-white px-3 py-2 rounded-xl text-sm"
  >
    This Month
  </button>

  {/* Reset */}
  <button
    onClick={() => {
      setStartDate("");
      setEndDate("");
      setSelectedDevice("all");
      setDeviceSearch("");
    }}
    className="ml-auto text-gray-400 hover:text-white text-sm"
  >
    Reset
  </button>
</div>
        {/* Monthly */}
        <SectionCard
          title="Monthly Vehicle Utilization Trend"
          subtitle="Hours operated and utilization % per month"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={filteredMonthly}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
              <Bar yAxisId="left" dataKey="hours" name="Hours" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
                name="Utilization %"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Daily */}
        <SectionCard
          title="Daily Vehicle Utilization Trend"
          subtitle={`Peak day: ${peakDay.date} at ${peakDay.utilization}%`}
          icon={<Calendar className="h-5 w-5" />}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dailyStartDate}
                onChange={(e) => setDailyStartDate(e.target.value)}
                className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-white text-sm outline-none cursor-pointer"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input
                type="date"
                value={dailyEndDate}
                onChange={(e) => setDailyEndDate(e.target.value)}
                className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-white text-sm outline-none cursor-pointer"
              />
              {(dailyStartDate || dailyEndDate) && (
                <button
                  onClick={() => {
                    setDailyStartDate("");
                    setDailyEndDate("");
                  }}
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={displayDaily}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
              <Bar
                dataKey="utilization"
                name="Utilization %"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="utilization" position="top" fill="currentColor" fontSize={11} formatter={(v: number) => `${v}%`} />
              </Bar>
              <Bar
                dataKey="hours"
                name="Hours"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="hours" position="top" fill="currentColor" fontSize={11} formatter={(v: number) => `${v}h`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Vehicle-wise */}
        <SectionCard
          title="Vehicle-wise Utilization"
          subtitle="Daily utilization by individual vehicle"
          icon={<Car className="h-5 w-5" />}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search Machine No..."
                value={vehicleSearchFilter}
                onChange={(e) => setVehicleSearchFilter(e.target.value)}
                className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-white text-sm outline-none w-[160px]"
              />
              <input
                type="date"
                value={vehicleDateFilter}
                onChange={(e) => setVehicleDateFilter(e.target.value)}
                className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-white text-sm outline-none cursor-pointer"
              />
              {(vehicleDateFilter || vehicleSearchFilter) && (
                <button
                  onClick={() => {
                    setVehicleDateFilter("");
                    setVehicleSearchFilter("");
                  }}
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative overflow-y-auto max-h-[500px]">
              <button
  onClick={() => setShowAllVehicles(!showAllVehicles)}
  className="absolute right-4 top-2 z-10 text-sm bg-cyan-500 text-white px-3 py-1 rounded"
>
  {showAllVehicles ? "Show Top 10" : "View All"}
</button>
              {displayedVehicles.length > 0 ? (
  <ResponsiveContainer
  width="100%"
  height={showAllVehicles ? sortedVehicles.length * 35 : 420}
>
    <BarChart
    barSize={18}
      data={displayedVehicles}
      layout="vertical"
      margin={{ left: 12 }}
    >
      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <YAxis
  type="category"
  dataKey="vehicle"
  width={120}
  stroke="hsl(var(--muted-foreground))"
  fontSize={11}
/>
      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
      
      <Bar dataKey="utilization" name="Utilization %" radius={[0, 8, 8, 0]}>
        {displayedVehicles.map((d, i) => (
          <Cell key={i} fill={utilColor(d.utilization)} />
        ))}
      </Bar>

    </BarChart>
  </ResponsiveContainer>
) : (
  <div className="text-center text-gray-400 py-10">
    No vehicle data available
  </div>
)}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-success">
                    Top 3 Performers
                  </span>
                </div>
                <ul className="space-y-2">
                  {sortedVehicles.slice(0, 3).map((v, i) => (
                    <li key={v.vehicle} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">
                        #{i + 1} {v.vehicle}
                      </span>
                      <span className="text-success font-bold">{v.utilization}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-danger">
                    Needs Attention
                  </span>
                </div>
                <ul className="space-y-2">
                  {sortedVehicles.slice(-3).reverse().map((v) => (
                    <li key={v.vehicle} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{v.vehicle}</span>
                      <span className="text-danger font-bold">{v.utilization}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Department */}
        <SectionCard
          title="Department-wise Utilization"
          subtitle="Hours share & utilization across departments"
          icon={<Layers className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Tooltip content={<ChartTooltip />} />
                <Pie
                  data={departmentUtilization}
                  dataKey="hours"
                  nameKey="department"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {departmentUtilization.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={departmentUtilization}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-25} textAnchor="end" height={70} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
                <Bar dataKey="utilization" name="Utilization %" radius={[8, 8, 0, 0]}>
                  {departmentUtilization.map((d, i) => (
                    <Cell key={i} fill={utilColor(d.utilization)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Operator Trips */}
        <SectionCard
          title="Monthly Trips by Operator"
          subtitle="Feb 2024 — Hours & utilization per operator"
          icon={<Users className="h-5 w-5" />}
        >
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={[...operatorTrips].sort((a, b) => b.utilization - a.utilization)}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="operator" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
              <Bar yAxisId="left" dataKey="hours" name="Hours" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
                name="Utilization %"
                stroke="hsl(var(--chart-4))"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* OverSpeed Leaderboard */}
        <SectionCard
          title="Daily OverSpeed Tracking"
          subtitle="Operators ranked by overspeed events — comparison with average"
          icon={<Gauge className="h-5 w-5" />}
          action={
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">Date Filter:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-white text-sm outline-none cursor-pointer"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          }
        >
          {/* Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sortedOverspeed.slice(0, 3).map((o, i) => {
              const style = podiumStyles[i];
              const diff = overspeedAvg
  ? (((o.total - overspeedAvg) / overspeedAvg) * 100).toFixed(0)
  : 0;
              return (
                <div
                  key={o.operator}
                  className={`relative overflow-hidden rounded-2xl p-6 ring-1 ${style.ring}`}
                  style={{ background: style.bg }}
                >
                  <div className="absolute -right-4 -top-4 opacity-20">
                    <Trophy className="h-24 w-24 text-white" />
                  </div>
                  <div className="relative">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">
                      {style.label}
                    </div>
                    <div className="text-2xl font-bold text-white">{o.operator}</div>
                    <div className="text-4xl font-extrabold text-white mt-2">
                      {o.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/90 mt-1">
                      events · {Number(diff) > 0 ? "+" : ""}
                      {diff}% vs avg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
<div className="flex justify-end mb-3">
  <button
    onClick={() => setShowAllOperators(!showAllOperators)}
    className="bg-primary text-white px-3 py-2 rounded hover:bg-primary/80 text-sm"
  >
    {showAllOperators ? "Show Top 7" : "View All"}
  </button>
 </div>
          {/* Full ranked chart */}
          {!showAllOperators ? (
  // ✅ TOP 7 GRAPH
  <ResponsiveContainer width="100%" height={340}>
    <BarChart
  data={displayedOperators}
  onClick={(e: any) => {
    if (e && e.activePayload) {
      const op = e.activePayload[0].payload.operator;
      setSelectedOperator(op);
    }
  }}
>
      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="operator" stroke="hsl(var(--muted-foreground))" fontSize={11} />
      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <Tooltip content={<ChartTooltip />} />

      <Bar dataKey="total" name="OverSpeed Count" radius={[8, 8, 0, 0]}>
        {displayedOperators.map((o, i) => (
          <Cell
            key={i}
            fill={
              i === 0
                ? "hsl(var(--danger))"
                : i === 1
                ? "hsl(var(--warning))"
                : i === 2
                ? "hsl(var(--chart-4))"
                : "hsl(var(--chart-1))"
            }
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
) : (
  // ✅ FULL TABLE (ALL OPERATORS)
  <div className="overflow-auto max-h-[400px] border rounded-lg">
    <table className="w-full text-sm">
      <thead className="bg-muted sticky top-0">
        <tr>
  <th className="p-3">Rank</th>
  <th className="p-3">Operator</th>
  <th className="p-3">Date</th>
  <th className="p-3">Overspeed Count</th>
</tr>
      </thead>

      <tbody>
  {sortedOverspeed.map((op: any, index: number) => (
    <tr
      key={index}
      className="border-b hover:bg-muted/30 cursor-pointer"
      onClick={() => setSelectedOperator(op.operator)}
    >
      <td className="p-3">{index + 1}</td>
      <td className="p-3">{op.operator}</td>
      <td className="p-3 text-xs text-gray-400">
  {Object.keys(op.dates).slice(0, 2).join(", ")}
  {Object.keys(op.dates).length > 2 && "..."}
</td>
      <td className="p-3 font-bold text-red-400">
        {op.total}
      </td>
    </tr>
  ))}
</tbody>   </table>
  </div>
)}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-danger" />
            Average:{" "}
            <span className="font-semibold text-foreground">
              {overspeedAvg.toFixed(0)} events/operator
            </span>
          </div>
          {selectedOperator && (
  <div className="mt-6 p-4 border rounded-xl bg-black/40">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-white">
        {selectedOperator} - Overspeed History
      </h3>

      <button
        onClick={() => setSelectedOperator(null)}
        className="text-red-400"
      >
        Close
      </button>
    </div>

    <div className="overflow-auto max-h-[300px]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Count</th>
          </tr>
        </thead>

        <tbody>
          {operatorDetails.map((d: any, i: number) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-2">
                {d.date}
              </td>
              <td className="p-2 text-red-400 font-bold">
                {d.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        </SectionCard>

        <footer className="text-center text-xs text-muted-foreground py-4">
          Mock data preview · Connect your sheet to see live numbers
        </footer>
      </div>
    </div>
  );
};

export default Index;
