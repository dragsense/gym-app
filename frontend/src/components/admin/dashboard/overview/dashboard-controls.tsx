import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared-ui/date-picker"
import type { DateRange } from "react-day-picker"
import type { ICombinedDashboardData } from "@shared/interfaces/dashboard.interface";
import { EAnalyticsPeriod } from "@shared/enums";

import type { IExtraProps } from "./dashboard-view"
import { type TSingleHandlerStore } from "@/stores"

interface IDashboardControlsProps {
  store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}

export const DashboardControls: React.FC<IDashboardControlsProps> = ({
  store
}) => {

  const period = store((state) => state.extra.period)
  const customRange = store((state) => state.extra.customRange)
  const setExtra = store((state) => state.setExtra)

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    if (!date) {
      setExtra('customRange', undefined);
      store.getState().setParams({ customRange: undefined });
      return;
    }

    let range: DateRange | undefined;
    if (date instanceof Date) {
      range = { from: date };
    } else if ("from" in date) {
      const { from, to } = date;
      if (from && to && from.getTime() !== to.getTime()) {
        range = { from, to };
      } else if (from) {
        range = { from };
      }
    }

    if (range) {
      setExtra('customRange', range);
      // Trigger refetch by updating params
      store.getState().setParams({ customRange: range });
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
      <div className="flex gap-2">
        <DatePicker
          value={customRange}
          onSelect={handleDateSelect}
          placeholder="Custom range"
          mode="range"
        />

        <Select
          value={period}
          onValueChange={(value: EAnalyticsPeriod) => {
            setExtra('period', value);
            // Trigger refetch by updating params
            store.getState().setParams({ period: value });
          }}
        >
          <SelectTrigger className="w-32 bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EAnalyticsPeriod.DAY}>Daily</SelectItem>
            <SelectItem value={EAnalyticsPeriod.WEEK}>Weekly</SelectItem>
            <SelectItem value={EAnalyticsPeriod.MONTH}>Monthly</SelectItem>
            <SelectItem value={EAnalyticsPeriod.YEAR}>Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
