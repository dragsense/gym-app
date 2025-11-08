import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { IBillingAnalytics } from '@shared/interfaces/dashboard.interface';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface IBillingOverviewProps {
  data: IBillingAnalytics | null;
  loading?: boolean;
  isAdmin?: boolean;
  dynamicDateLabel?: string;
}

export const BillingOverview = ({
  data: analyticsData,
  isAdmin = false,
  loading = false,
  dynamicDateLabel,
}: IBillingOverviewProps) => {

  if (!analyticsData) return <div className="p-4 text-center">No billing data available</div>;

  const currencyFormatter = (value: number) => formatCurrency(value)

  if (loading) {
    return <div className="p-4 text-center">Loading billing data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AppCard
        header={
          <div>
            <h2 className="text-md font-semibold tracking-tight">Billing Analytics</h2>
            <p className="text-muted-foreground text-sm">{isAdmin ? "Platform" : "Your"} {dynamicDateLabel}</p>
          </div>

        }
      >
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-2">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5  gap-4 mb-6">
              <AppCard
                header={<span className="text-sm font-medium text-secondary">Total Billings</span>}
                footer={`${analyticsData.summary.total_billings || 0} invoices`}
              >
                <div className="text-2xl font-bold text-secondary">{formatCurrency(analyticsData.revenue.total / 100)}</div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium text-green-600">Paid</span>}
                footer={`${analyticsData.summary.paid_billings || 0} completed`}
              >
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(analyticsData.summary.total_paid / 100)}
                </div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium text-yellow-600">Pending</span>}
                footer={`${analyticsData.summary.pending_billings || 0} awaiting`}
              >
                <div className="text-2xl font-bold text-yellow-700">
                  {formatCurrency(analyticsData.summary.total_pending / 100)}
                </div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium text-red-600">Failed</span>}
                footer={`${analyticsData.summary.failed_billings || 0} rejected`}
              >
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(analyticsData.summary.total_failed / 100)}
                </div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium text-red-800">Overdue</span>}
                footer={`${analyticsData.summary.overdue_billings || 0} late`}
              >
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(analyticsData.summary.total_overdue / 100)}
                </div>
              </AppCard>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Payment Success Rate</span>
                <span className="font-medium">
                  {analyticsData.summary.total_billings > 0
                    ? ((analyticsData.summary.paid_billings / analyticsData.summary.total_billings) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  analyticsData.summary.total_billings > 0
                    ? (analyticsData.summary.paid_billings / analyticsData.summary.total_billings) * 100
                    : 0
                }
                className="h-2"
              />

            </div>

          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AppCard
                header={<span className="text-sm font-medium">Total Revenue</span>}
                footer={`${analyticsData.revenue.transactions} transactions`}
              >
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.total / 100)}</div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium">Paid Revenue</span>}
                footer={`${analyticsData.summary.paid_billings} payments`}
              >
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.paid / 100)}</div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium">Pending Revenue</span>}
                footer={`${analyticsData.summary.pending_billings} pending`}
              >
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.pending / 100)}</div>
              </AppCard>

              {isAdmin ? (
                <AppCard
                  header={<span className="text-sm font-medium">Platform Revenue</span>}
                >
                  <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.platform / 100)}</div>
                </AppCard>
              ) : (
                <AppCard
                  header={<span className="text-sm font-medium">Your Earnings</span>}
                  footer="After platform fees"
                >
                  <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.trainer)}</div>
                </AppCard>
              )}
            </div>


            <AppCard
              header={<span className="text-sm font-medium">Revenue Timeline</span>}
              footer="Current month revenue status"
            >
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={currencyFormatter} />
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#0088FE" name="Total Revenue" strokeWidth={3} />
                    <Line type="monotone" dataKey="paid" stroke="#00C49F" name="Paid Revenue" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AppCard>

          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppCard
                header={<span className="text-sm font-medium">Revenue by Type</span>}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.typeDistribution.map(item => ({
                          ...item,
                          total_amount: Number(item.total_amount / 100),
                          paid_amount: Number(item.paid_amount / 100),
                          average_amount: Number(item.average_amount / 100),
                          count: Number(item.count)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="type"
                        label={({ type, total_amount }) =>
                          `${type}: ${formatCurrency(total_amount)}`
                        }
                      >
                        {analyticsData.typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `Type: ${props.payload.type}`,
                        ]}
                      />
                      <Legend
                        formatter={(value, entry, index) => (
                          <span className="text-sm text-muted-foreground">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>


              </AppCard>


              <AppCard
                header={<span className="text-sm font-medium">Payment Methods</span>}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.paymentMethods.map(pm => ({
                          ...pm,
                          amount: Number(pm.amount / 100) || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="amount"
                        nameKey="method"
                        label={({ method, amount, percent }) =>
                          `${method.toUpperCase()}: ${formatCurrency(amount)} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {analyticsData.paymentMethods.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AppCard>

              <AppCard
                header={<span className="text-sm font-medium">Currency Breakdown</span>}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.currencyBreakdown.map(cb => ({
                          ...cb,
                          total_amount: Number(cb.total_amount / 100) || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="total_amount"
                        nameKey="currency"
                        label={({ currency, total_amount, percent }) =>
                          `${currency}: ${formatCurrency(total_amount)} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {analyticsData.currencyBreakdown.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AppCard>
            </div>

            <AppCard
              header={<span className="text-sm font-medium">Performance Metrics</span>}
              footer="Key billing indicators"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Avg. Billing</span>
                  <div className="text-xl font-semibold">
                    {formatCurrency(analyticsData.summary.average_billing_amount)}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Avg. Paid</span>
                  <div className="text-xl font-semibold">
                    {formatCurrency(analyticsData.summary.average_paid_amount)}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <div className="text-xl font-semibold">
                    {analyticsData.summary.total_billings > 0
                      ? ((analyticsData.summary.paid_billings / analyticsData.summary.total_billings) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Pending Rate</span>
                  <div className="text-xl font-semibold">
                    {analyticsData.summary.total_billings > 0
                      ? ((analyticsData.summary.pending_billings / analyticsData.summary.total_billings) * 100).toFixed(
                        1,
                      )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </AppCard>
          </TabsContent>
        </Tabs>
      </AppCard>
    </div>
  )
}


