export type MetricValue = number | null

export interface Metrics {
  average_forecast_mw: MetricValue
  average_actual_mw: MetricValue
  mae_mw: MetricValue
  rmse_mw: MetricValue
  bias_mw: MetricValue
  matched_intervals: number
  missing_intervals: number
}

export interface Interval {
  start_time: string
  forecast_mw: MetricValue
  actual_mw: MetricValue
  error_mw: MetricValue
  forecast_publish_time: string | null
  is_interpolated: boolean
}

export interface WindData {
  delivery_date: string
  decision_cutoff: string
  timezone: string
  metrics: Metrics
  intervals: Interval[]
  methodology: string
}
