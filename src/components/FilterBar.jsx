import MultiSelectDropdown from './MultiSelectDropdown.jsx'

const SCOPE_OPTIONS = [
  { value: 'Scope 1', label: 'Scope 1' },
  { value: 'Scope 2', label: 'Scope 2' },
  { value: 'Scope 3', label: 'Scope 3' },
]

const VALIDATION_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'flagged', label: 'Flagged' },
]

export default function FilterBar({
  facilities,
  years,
  facility,
  year,
  onFacilityChange,
  onYearChange,
  selectedScopes,
  onScopeChange,
  selectedValidation,
  onValidationChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MultiSelectDropdown label="Scope" options={SCOPE_OPTIONS} selected={selectedScopes} onChange={onScopeChange} />

      <select
        className="field-input text-sm"
        value={facility}
        onChange={(e) => onFacilityChange(e.target.value)}
      >
        <option value="">All facilities</option>
        {facilities.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select className="field-input text-sm" value={year} onChange={(e) => onYearChange(e.target.value)}>
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <MultiSelectDropdown
        label="Validation status"
        options={VALIDATION_OPTIONS}
        selected={selectedValidation}
        onChange={onValidationChange}
      />
    </div>
  )
}

export { SCOPE_OPTIONS, VALIDATION_OPTIONS }
