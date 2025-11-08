import React, { useState } from 'react';
import { useStore } from 'zustand';
import { type TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2, } from 'lucide-react';

// Components
import CompactDashboard from './compact-dashboard';

// Types
import type { ICombinedDashboardData } from '@shared/interfaces/dashboard.interface';
import { EAnalyticsPeriod } from "@shared/enums";

import type { DateRange } from 'react-day-picker';



export interface IExtraProps {
  period: EAnalyticsPeriod
  customRange?: DateRange
}

interface IDashboardViewProps {
  storeKey: string;
  store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}


export const DashboardView: React.FC<IDashboardViewProps> = ({ storeKey, store }) => {


  if (!store) {
    return <div>Dashboard store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const isLoading = store((state) => state.isLoading);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <CompactDashboard store={store} />
    </div >
  );
};
