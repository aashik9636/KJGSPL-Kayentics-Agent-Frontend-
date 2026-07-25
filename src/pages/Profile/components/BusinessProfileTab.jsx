import React from 'react';
import Select from 'react-select';
import { Section, Field } from './SharedUI';
import { CURRENCIES } from '../utils';

export default function BusinessProfileTab({ business, errors, onChange, industries }) {
  const newSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '6px 8px',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: state.isFocused ? '0 0 0 4px var(--primary-soft)' : 'none',
      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
      backgroundColor: state.isFocused ? 'var(--surface)' : 'var(--bg)',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999, // Fix overlap issue
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      border: '1px solid var(--border)',
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      padding: '10px 16px',
      backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-soft)' : 'white',
      color: state.isSelected ? 'white' : state.isFocused ? 'var(--primary-dark)' : 'var(--ink)',
      cursor: 'pointer',
    })
  };

  return (
    <>
      <Section title="Company info" description="Basic details about your organization to inform AI contexts.">
        <Field label="Company Name" required error={errors.companyName}>
          <input type="text" value={business.companyName} onChange={e => onChange('companyName', e.target.value)} placeholder="Kaynetics company" />
        </Field>
        <Field label="Business Type">
          <input type="text" value={business.businessType} onChange={e => onChange('businessType', e.target.value)} placeholder="e.g. b2b" />
        </Field>
        <Field label="Description" full error={errors.description}>
          <textarea value={business.description} onChange={e => onChange('description', e.target.value)} placeholder="Brief overview..." />
        </Field>
        
        <Field label="Industry Master" error={errors.industry}>
          <Select 
            options={industries} 
            value={industries.find(o => o.value === business.industry || o.label === business.industry) || (business.industry ? { value: business.industry, label: business.industry } : null)} 
            onChange={s => onChange('industry', s ? s.value : '')} 
            styles={newSelectStyles} 
            placeholder="Select Industry..."
            isSearchable 
            menuPortalTarget={document.body}
          />
        </Field>
        <Field label="Currency Master" error={errors.currency}>
          <Select 
            options={CURRENCIES} 
            value={CURRENCIES.find(o => o.value === business.currency) || null} 
            onChange={s => onChange('currency', s.value)} 
            styles={newSelectStyles} 
            placeholder="Select Currency..."
            isSearchable 
            menuPortalTarget={document.body}
          />
        </Field>
        <Field label="Business Model" full>
          <input type="text" value={business.businessModel} onChange={e => onChange('businessModel', e.target.value)} placeholder="e.g. Subscription" />
        </Field>
      </Section>

      <Section title="Contact & operations" description="Where and how your business operates.">
        <Field label="Website" error={errors.website}>
          <input type="url" value={business.website} onChange={e => onChange('website', e.target.value)} placeholder="http://..." />
        </Field>
        <Field label="Public Email" error={errors.email}>
          <input type="email" value={business.email} onChange={e => onChange('email', e.target.value)} placeholder="hello@company.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input type="tel" value={business.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+1 555..." />
        </Field>
        <Field label="Founded Year" error={errors.foundedYear}>
          <input type="number" value={business.foundedYear} onChange={e => onChange('foundedYear', parseInt(e.target.value) || '')} placeholder="e.g. 2020" min="1800" max={new Date().getFullYear()} />
        </Field>
        <Field label="Company Size">
          <input type="text" value={business.companySize} onChange={e => onChange('companySize', e.target.value)} placeholder="e.g. 11" />
        </Field>
        <Field label="Headquarters">
          <input type="text" value={business.headquarters} onChange={e => onChange('headquarters', e.target.value)} placeholder="Udaipur, India" />
        </Field>
        <Field label="Countries Served" full>
          <input type="text" value={business.countriesServed} onChange={e => onChange('countriesServed', e.target.value)} placeholder="India" />
        </Field>
      </Section>

      <Section title="Brand identity" description="Guides the AI in generating content aligned with your goals." border={false}>
        <Field label="Mission" full>
          <textarea value={business.mission} onChange={e => onChange('mission', e.target.value)} placeholder="Our mission is to..." />
        </Field>
        <Field label="Vision" full>
          <textarea value={business.vision} onChange={e => onChange('vision', e.target.value)} placeholder="We envision a world where..." />
        </Field>
        <Field label="Unique Selling Proposition (USP)" full>
          <textarea value={business.usp} onChange={e => onChange('usp', e.target.value)} placeholder="What makes you unique?" />
        </Field>
      </Section>
    </>
  );
}
