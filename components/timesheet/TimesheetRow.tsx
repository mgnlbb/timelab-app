// TimesheetRow.tsx

import { useState, useRef, useEffect } from "react"; // ← tambahkan import ini
import { format } from "date-fns";

export type RowData = {
  date: string;
  start_time: string;
  end_time: string;
  activity: string;
  remarks: string;
};

type TimesheetRowProps = {
  row: RowData;
  onChange: (date: string, field: keyof RowData, value: string) => void;
  onRowUpdate: (date: string, updates: Partial<RowData>) => void;
  isSaving: boolean;
};

type ActivityOption = {
  value: string;
  label: string;
};

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { value: "", label: "— Pilih —" },
  { value: "Weekday", label: "Weekday" },
  { value: "Holiday", label: "Holiday" },
  { value: "Sick", label: "Sick" },
  { value: "Leave", label: "Leave" },
];

const ACTIVITY_COLORS: Record<string, string> = {
  Weekday: "bg-blue-50 text-blue-700",
  Holiday: "bg-yellow-50 text-yellow-700",
  Sick: "bg-red-50 text-red-600",
  Leave: "bg-purple-50 text-purple-700",
};

const ACTIVITY_AUTOFILL: Record<string, Partial<RowData>> = {
  Weekday: { start_time: "08:00", end_time: "17:00", remarks: "" },
  Holiday: { start_time: "", end_time: "", remarks: "Hari Libur" },
  Sick: { start_time: "", end_time: "", remarks: "Sakit" },
  Leave: { start_time: "", end_time: "", remarks: "Cuti" },
};

function isWeekend(dateStr: string) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

// ↓ ExpandableRemarks diletakkan di sini, sebelum TimesheetRow
function ExpandableRemarks({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [expanded]);

  if (disabled) {
    return <span className="text-xs text-gray-300 px-2">—</span>;
  }

  if (expanded) {
    return (
      <div className="relative z-10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setExpanded(false)}
          rows={3}
          placeholder="Keterangan..."
          className="
            w-full min-w-[220px] border border-blue-400 rounded-md px-2 py-1 text-xs
            focus:outline-none focus:ring-1 focus:ring-blue-400
            resize-none shadow-lg bg-white
            absolute top-0 left-0
          "
        />
        <div className="h-6" />
      </div>
    );
  }

  return (
    <div
      onClick={() => setExpanded(true)}
      className="
        w-full border border-gray-200 rounded-md px-2 py-1 text-xs cursor-text
        text-gray-700 truncate min-h-[26px] hover:border-blue-300 transition-colors
        bg-white
      "
      title={value}
    >
      {value || <span className="text-gray-300">Keterangan</span>}
    </div>
  );
}

// ↓ TimesheetRow diletakkan setelah ExpandableRemarks
export default function TimesheetRow({
  row,
  onChange,
  onRowUpdate,
  isSaving,
}: TimesheetRowProps) {
  const date = new Date(row.date);
  const weekend = isWeekend(row.date);

  function handleActivityChange(value: string) {
    const autofill = ACTIVITY_AUTOFILL[value];
    if (autofill) {
      onRowUpdate(row.date, { activity: value, ...autofill });
    } else {
      onRowUpdate(row.date, {
        activity: "",
        start_time: "",
        end_time: "",
        remarks: "",
      });
    }
  }
  const isInvalidTime =
    row.start_time && row.end_time && row.end_time <= row.start_time;

  const inputBase = `w-full border border-gray-200 text-black rounded-md px-2 py-1 text-xs 
    focus:outline-none focus:ring-1 focus:ring-blue-400 
    disabled:bg-transparent disabled:border-transparent disabled:text-gray-300`;

  return (
    <tr
      className={`
      border-b border-gray-100 transition-colors
      ${weekend ? "bg-gray-50" : "hover:bg-blue-50/30"}
      ${isSaving ? "opacity-60" : ""}
    `}
    >
      <td className="px-3 py-2 text-xs font-medium text-gray-500 w-12">
        {format(date, "EEEE")}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 w-20 whitespace-nowrap">
        {format(date, "dd MMM")}
      </td>
      <td className="px-0 py-1 w-40">
        {weekend ? (
          <span className="text-xs text-gray-300 px-2">—</span>
        ) : (
          <select
            value={row.activity}
            onChange={(e) => handleActivityChange(e.target.value)}
            className={`${inputBase} cursor-pointer ${
              row.activity ? ACTIVITY_COLORS[row.activity] : "text-gray-400"
            }`}
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </td>

      <td className="px-2 py-1.5 w-32">
        <input
          type="time"
          value={row.start_time}
          disabled={weekend}
          onChange={(e) => onChange(row.date, "start_time", e.target.value)}
          className={inputBase}
        />
      </td>

      <td className="px-2 py-1.5 w-32">
        <input
          type="time"
          value={row.end_time}
          disabled={weekend}
          onChange={(e) => onChange(row.date, "end_time", e.target.value)}
          className={`${inputBase} ${isInvalidTime ? "border-red-400 bg-red-50" : ""}`}
        />
        {isInvalidTime && (
          <p className="text-red-400 text-[10px] mt-0.5">
            End time harus lebih besar
          </p>
        )}
      </td>

      <td className="px-2 py-1.5 relative text-black">
        <ExpandableRemarks
          value={row.remarks}
          disabled={weekend}
          onChange={(val) => onChange(row.date, "remarks", val)}
        />
      </td>
    </tr>
  );
}
