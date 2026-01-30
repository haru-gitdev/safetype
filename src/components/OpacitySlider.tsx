import { OPACITY_MIN, OPACITY_MAX, OPACITY_STEP } from '../types/settings'
import './OpacitySlider.css'

interface OpacitySliderProps {
  value: number
  onChange: (opacity: number) => void
}

export function OpacitySlider({ value, onChange }: OpacitySliderProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className="opacity-slider-wrapper">
      <label className="opacity-label">
        Window Opacity
        <span className="opacity-value">{percentage}%</span>
      </label>
      <div className="slider-container">
        <input
          type="range"
          className="opacity-slider"
          min={OPACITY_MIN}
          max={OPACITY_MAX}
          step={OPACITY_STEP}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <div className="slider-labels">
          <span>{Math.round(OPACITY_MIN * 100)}%</span>
          <span>{Math.round(OPACITY_MAX * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
