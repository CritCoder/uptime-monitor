import * as React from "react"
import * as RechartsPrimitive from "recharts"

const Chart = RechartsPrimitive.ResponsiveContainer

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(({ active, payload, label, formatter }, ref) => {
  if (!active || !payload) {
    return null
  }

  return (
    <div
      ref={ref}
      className="rounded-lg border bg-white px-3 py-2 shadow-md"
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-900">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  Chart,
  ChartTooltip,
  ChartTooltipContent,
}

