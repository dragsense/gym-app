import { Calendar, Clock, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useShallow } from "zustand/shallow";

// Types
import { type ISchedule } from "@shared/interfaces/schedule.interface";

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Separator } from "@/components/ui/separator";

// Enums
import { EScheduleStatus } from "@shared/enums";

// Stores
import { type TSingleHandlerStore } from "@/stores";

// Config
import { type THandlerComponentProps } from "@/@types/handler-types";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";

// Utils
import { 
  formatDate, 
  formatDateTime, 
  formatTimeOfDay, 
  formatInterval,
  getDayOfWeekName,
  getMonthName 
} from "@/utils/date-format";

export interface IScheduleViewExtraProps { }

interface IScheduleViewProps extends THandlerComponentProps<TSingleHandlerStore<ISchedule, IScheduleViewExtraProps>> { }

const getStatusColor = (status: EScheduleStatus) => {
  switch (status) {
    case EScheduleStatus.ACTIVE:
      return "bg-green-100 text-green-800 border-green-200";
    case EScheduleStatus.PAUSED:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case EScheduleStatus.COMPLETED:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case EScheduleStatus.FAILED:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};


function ScheduleView({ store, storeKey }: IScheduleViewProps) {
    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: item, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!item) {
        return null;
    }

    
    const handleCloseView = () => {
        reset();
    };

  return (
    <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
    <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <AppDialog
            title="Schedule Details"
            description="View detailed information about this schedule"
        >
      {/* Header */}
      <AppCard>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              <Badge variant="outline" className="capitalize">{item.frequency}</Badge>
              <span className="text-sm text-muted-foreground">
                Action: <span className="font-mono">{item.action}</span>
              </span>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Configuration */}
        <AppCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Configuration
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frequency:</span>
              <span className="font-medium capitalize">{item.frequency}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(item.startDate)}</span>
            </div>
            {item.endDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{formatDate(item.endDate)}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Run:</span>
              <span className="font-medium">{formatDate(item.nextRunDate)}</span>
            </div>
            {item.lastRunAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Run:</span>
                <span className="font-medium">{formatDateTime(item.lastRunAt)}</span>
              </div>
            )}
          </div>
        </AppCard>

        {/* Time Configuration */}
        <AppCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Configuration
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium">{formatTimeOfDay(item.timeOfDay)}</span>
            </div>
            {item.interval ? (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interval:</span>
                  <span className="font-medium">
                    {formatInterval(item.intervalValue || item.interval, item.intervalUnit)}
                    {!item.intervalValue && ` (${item.interval} min)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time:</span>
                  <span className="font-medium">{formatTimeOfDay(item.endTime)}</span>
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  ⏱️ {formatInterval(item.intervalValue || item.interval, item.intervalUnit)} from {formatTimeOfDay(item.timeOfDay)} to {formatTimeOfDay(item.endTime)}
                </div>
              </>
            ) : (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  🕐 Runs once at {formatTimeOfDay(item.timeOfDay)}
              </div>
            )}
            <Separator />
            {item.weekDays && item.weekDays.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week Days:</span>
                <span className="font-medium">
                  {item.weekDays.map(d => getDayOfWeekName(d)).join(', ')}
                </span>
              </div>
            )}
            {item.monthDays && item.monthDays.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days of Month:</span>
                <span className="font-medium">{item.monthDays.join(', ')}</span>
              </div>
            )}
            {item.months && item.months.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Months:</span>
                <span className="font-medium">
                  {item.months.map(m => getMonthName(m)).join(', ')}
                </span>
              </div>
            )}
            {item.timezone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone:</span>
                <span className="font-medium font-mono text-sm">{item.timezone}</span>
              </div>
            )}
          </div>
        </AppCard>
      </div>

      {/* Execution Statistics */}
      <AppCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Execution Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{item.executionCount}</div>
            <div className="text-sm text-muted-foreground">Total Runs</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{item.successCount}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{item.failureCount}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {item.executionCount > 0 
                ? ((item.successCount / item.executionCount) * 100).toFixed(1) 
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {item.lastExecutionStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {item.lastExecutionStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">Last Execution: {item.lastExecutionStatus}</span>
            </div>
            {item.lastErrorMessage && (
              <div className="mt-2 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{item.lastErrorMessage}</span>
              </div>
            )}
          </div>
        )}
      </AppCard>

      {/* Execution History */}
      {item.executionHistory && item.executionHistory.length > 0 && (
        <AppCard>
          <h3 className="text-lg font-semibold mb-4">Execution History (Last {item.executionHistory.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {item.executionHistory.map((execution: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  execution.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {execution.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium capitalize">{execution.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(execution.executedAt)}
                  </span>
                </div>
                {execution.errorMessage && (
                  <div className="mt-2 text-sm text-red-600">
                    {execution.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {/* Additional Data */}
      {item.data && Object.keys(item.data).length > 0 && (
        <AppCard>
          <h3 className="text-lg font-semibold mb-4">Additional Data</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(item.data, null, 2)}
          </pre>
        </AppCard>
      )}
    </AppDialog>
    </DialogContent>
    </Dialog>
  );
}

export default ScheduleView;

