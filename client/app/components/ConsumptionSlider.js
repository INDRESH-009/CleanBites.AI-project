'use client';

import React from 'react';

const ConsumptionSlider = ({ value, onChange, label = "How much of it will you have?" }) => {
  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="consumption-slider" style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label} ({value}%)
      </label>
      <input
        id="consumption-slider"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default ConsumptionSlider;
