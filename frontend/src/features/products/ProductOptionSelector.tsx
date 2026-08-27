type ProductOptionSelectorProps = {
  options: Record<string, string[]>
  selectedOptions: Record<string, string>
  onChange: (optionName: string, optionValue: string) => void
}

function formatOptionLabel(optionName: string) {
  return optionName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function optionId(optionName: string, optionValue: string) {
  return `${optionName}-${optionValue}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function ProductOptionSelector({
  options,
  selectedOptions,
  onChange,
}: ProductOptionSelectorProps) {
  const optionGroups = Object.entries(options).filter(([, values]) => values.length > 0)
  const missingOptions = optionGroups
    .filter(([optionName]) => !selectedOptions[optionName])
    .map(([optionName]) => formatOptionLabel(optionName))

  if (optionGroups.length === 0) return null

  return (
    <section className="product-options" aria-labelledby="options-title">
      <div className="product-options__heading">
        <p className="eyebrow">CHOOSE YOUR FRAME</p>
        <h2 id="options-title">Make it yours.</h2>
        <p>Every available option is required for this learning-demo selection.</p>
      </div>

      <div className="product-options__groups">
        {optionGroups.map(([optionName, values]) => (
          <fieldset className="product-option-group" key={optionName}>
            <legend>
              <span>{formatOptionLabel(optionName)}</span>
              <span className="product-option-group__required">Required</span>
            </legend>
            <div className="product-option-group__values">
              {values.map((optionValue) => {
                const id = optionId(optionName, optionValue)
                const isColourOption = /colou?r/i.test(optionName)

                return (
                  <span
                    className={`product-option${isColourOption ? ' product-option--colour' : ''}`}
                    data-option-value={optionValue.toLowerCase().replace(/\s+/g, '-')}
                    key={optionValue}
                  >
                    <input
                      id={id}
                      name={optionName}
                      type="radio"
                      value={optionValue}
                      checked={selectedOptions[optionName] === optionValue}
                      onChange={() => onChange(optionName, optionValue)}
                    />
                    <label htmlFor={id}>
                      {isColourOption ? <span className="product-option__swatch" aria-hidden="true" /> : null}
                      <span>{optionValue}</span>
                    </label>
                  </span>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <p className="product-options__status" role="status" aria-live="polite">
        {missingOptions.length > 0
          ? `Choose: ${missingOptions.join(', ')}`
          : 'All required options are selected.'}
      </p>
    </section>
  )
}
