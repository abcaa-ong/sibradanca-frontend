import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartItem = {
  name: string
  value: number
}

type ChartPanelProps = {
  title: string
  data: ChartItem[]
  type?: 'bar' | 'pie'
  className?: string
  emptyMessage?: string
}

const colors = {
  yellow: '#f4eb00',
  blue: '#48a9e6',
  pink: '#ef2f8d',
  green: '#7be33d',
  purple: '#b36ce6',
  cyan: '#6fd8e6',
}

export function ChartPanel({
  title,
  data,
  type = 'bar',
  className = '',
  emptyMessage = 'Carregando...',
}: ChartPanelProps) {
  const palette = [
    colors.yellow,
    colors.blue,
    colors.pink,
    colors.green,
    colors.purple,
    colors.cyan,
  ]

  const hasData = data.some((item) => item.value > 0)

  return (
    <div className={`card chart-panel statistics-chart-panel ${className}`.trim()}>
      <div className="panel-top">
        <div>
          <span className="eyebrow">Painel</span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{title}</h3>
        </div>
      </div>

      <div className="bar-area">
        {!hasData ? (
          <div
            style={{
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: '1rem',
              color: '#475569',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            <p style={{ maxWidth: 320 }}>{emptyMessage}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Tooltip />
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45}>
                  {data.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[14, 14, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
