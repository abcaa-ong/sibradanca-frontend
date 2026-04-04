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
import type { TooltipProps } from 'recharts'

type ChartItem = {
  name: string
  value: number
}

type ChartPanelProps = {
  title: string
  data: ChartItem[]
  type?: 'bar' | 'pie'
  className?: string
  isLoading?: boolean
  emptyMessage?: string
  eyebrowLabel?: string
  summaryItems?: number
}

const colors = {
  yellow: '#f4eb00',
  blue: '#48a9e6',
  pink: '#ef2f8d',
  green: '#7be33d',
  purple: '#b36ce6',
  cyan: '#6fd8e6',
}

function resolveTooltipLabel(
  label: string | number | undefined,
  item: {
    name?: string | number
    payload?: unknown
  },
) {
  const payload = item.payload as Partial<ChartItem> | undefined

  if (payload?.name) {
    return payload.name
  }

  if (typeof label === 'string' && label && label !== 'value') {
    return label
  }

  if (typeof item.name === 'string' && item.name !== 'value') {
    return item.name
  }

  return 'Registro'
}

export function ChartPanel({
  title,
  data,
  type = 'bar',
  className = '',
  isLoading = false,
  emptyMessage = 'Carregando...',
  eyebrowLabel = 'Leitura',
  summaryItems = 0,
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
  const placeholderPieData = [{ name: 'Sem dados', value: 1 }]
  const summaryData =
    summaryItems > 0
      ? [...data].sort((left, right) => right.value - left.value).slice(0, summaryItems)
      : []

  const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value)

  function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) {
      return null
    }

    const item = payload[0]
    const value = typeof item.value === 'number' ? item.value : Number(item.value ?? 0)
    const resolvedLabel = resolveTooltipLabel(label, item)

    return (
      <div className="statistics-tooltip">
        <strong>{resolvedLabel}</strong>
        <span>{formatNumber(value)} registros na base apresentada</span>
      </div>
    )
  }

  return (
    <div className={`card chart-panel statistics-chart-panel ${className}`.trim()}>
      <div className="panel-top">
        <div>
          <span className="eyebrow">{eyebrowLabel}</span>
          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.3 }}>{title}</h3>
        </div>
      </div>

      <div className="bar-area">
        {!hasData && isLoading ? (
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
                {hasData ? <Tooltip content={<CustomTooltip />} /> : null}
                <Pie
                  data={hasData ? data : placeholderPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={45}
                  isAnimationActive={false}
                >
                  {(hasData ? data : placeholderPieData).map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#667085', fontSize: 12 }}
                  interval={0}
                  angle={data.some((item) => item.name.length > 12) ? -18 : 0}
                  textAnchor={data.some((item) => item.name.length > 12) ? 'end' : 'middle'}
                  height={data.some((item) => item.name.length > 12) ? 58 : 32}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                {hasData ? <Tooltip content={<CustomTooltip />} /> : null}
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

      {summaryData.length ? (
        <div className="statistics-chart-summary">
          {summaryData.map((item) => (
            <div key={`${title}-${item.name}`} className="statistics-chart-summary-row">
              <span>{item.name}</span>
              <strong>{formatNumber(item.value)}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
