import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { dateLabel } from '../format'

const MIN_DELIVERY_DATE = new Date(2026, 0, 2)
const MAX_DELIVERY_DATE = new Date(2026, 1, 1)
const FIRST_MONTH = new Date(2026, 0, 1)
const LAST_MONTH = new Date(2026, 1, 1)

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isoDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z" />
    </svg>
  )
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const selected = parseDate(value)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(selected)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMonth(selected)
  }, [value])

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  function selectDate(next: Date | undefined) {
    if (!next) return
    onChange(isoDate(next))
    setOpen(false)
  }

  return (
    <div className="date-picker-shell" ref={shellRef}>
      <button
        type="button"
        className="date-trigger"
        aria-label={`Choose delivery date, currently ${dateLabel.format(new Date(`${value}T12:00:00Z`))}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="delivery-date-popover"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{dateLabel.format(new Date(`${value}T12:00:00Z`))}</span>
        <span className="text-muted"><CalendarIcon /></span>
      </button>

      {open && (
        <div
          id="delivery-date-popover"
          className="date-popover"
          role="dialog"
          aria-label="Choose a delivery date"
        >
              <DayPicker
                mode="single"
                required
                selected={selected}
                onSelect={selectDate}
                month={month}
                onMonthChange={setMonth}
                startMonth={FIRST_MONTH}
                endMonth={LAST_MONTH}
                disabled={[{ before: MIN_DELIVERY_DATE }, { after: MAX_DELIVERY_DATE }]}
                weekStartsOn={1}
                navLayout="around"
                showOutsideDays={false}
                fixedWeeks
                formatters={{
                  formatCaption: (date) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date),
                  formatWeekdayName: (date) => new Intl.DateTimeFormat('en-GB', { weekday: 'narrow' }).format(date),
                }}
              />
              <p className="date-popover-note">Delivery dates for decisions made 1–31 January</p>
        </div>
      )}
    </div>
  )
}
