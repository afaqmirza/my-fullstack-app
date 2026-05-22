/** Large +/- value control for tools */
export default function StepperControl({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  large = false,
  label,
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className={`stepper-control ${large ? 'stepper-control-lg' : ''}`}>
      {label && <label className="stepper-label">{label}</label>}
      <div className="stepper-inner">
        <button
          type="button"
          className="stepper-btn"
          onClick={dec}
          disabled={value <= min}
          aria-label="Decrease"
        >
          −
        </button>
        <span className="stepper-value">{value}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={inc}
          disabled={value >= max}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}
