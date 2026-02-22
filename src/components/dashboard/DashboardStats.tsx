import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardStatsProps {
  data: {
    date: string;
    received: number;
    analyzed: number;
    sent: number;
  }[];
  period: 'today' | 'week' | 'month';
}

export function DashboardStats({ data, period }: DashboardStatsProps) {
  const totals = data.reduce(
    (acc, curr) => ({
      received: acc.received + curr.received,
      analyzed: acc.analyzed + curr.analyzed,
      sent: acc.sent + curr.sent,
    }),
    { received: 0, analyzed: 0, sent: 0 }
  );

  const formatDate = (date: string) => {
    switch (period) {
      case 'today':
        return format(new Date(date), 'HH:mm', { locale: fr });
      case 'week':
        return format(new Date(date), 'EEE', { locale: fr });
      case 'month':
        return format(new Date(date), 'dd MMM', { locale: fr });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-blue-600">ECG Reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.received}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-green-600">ECG Analysés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.analyzed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm text-purple-600">Rapports Envoyés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.sent}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Tendances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => formatDate(value as string)}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="hsl(var(--chart-1))"
                  name="Reçus"
                />
                <Line
                  type="monotone"
                  dataKey="analyzed"
                  stroke="hsl(var(--chart-2))"
                  name="Analysés"
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="hsl(var(--chart-3))"
                  name="Envoyés"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}