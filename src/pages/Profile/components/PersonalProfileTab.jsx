import React from 'react';
import Select from 'react-select';
import { Section, Field } from './SharedUI';
import { TIMEZONES, LANGUAGES } from '../utils';

export default function PersonalProfileTab({ profile, errors, onChange }) {
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
      <Section title="General" description="Update your personal information and contact details.">
        <Field label="First Name" required error={errors.firstName}>
          <input type="text" value={profile.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="Jane" />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input type="text" value={profile.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="Doe" />
        </Field>
        <Field label="Email Address" full readonly>
          <input type="email" value={profile.email} disabled />
          <span className="hint">Contact support to change your login email.</span>
        </Field>
        <Field label="Phone Number" full error={errors.phone}>
          <input type="tel" value={profile.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </Field>
      </Section>

      <Section title="Professional role" description="Your designation within the organization.">
        <Field label="Job Title">
          <input type="text" value={profile.jobTitle} onChange={e => onChange('jobTitle', e.target.value)} placeholder="e.g. Marketing Director" />
        </Field>
        <Field label="Department">
          <input type="text" value={profile.department} onChange={e => onChange('department', e.target.value)} placeholder="e.g. Demand Generation" />
        </Field>
      </Section>

      <Section title="Preferences" description="Manage your region and language settings." border={false}>
        <Field label="Timezone">
          <Select 
            options={TIMEZONES} 
            value={TIMEZONES.find(o => o.value === profile.timezone)} 
            onChange={s => onChange('timezone', s.value)} 
            styles={newSelectStyles} 
            isSearchable 
            menuPortalTarget={document.body}
          />
        </Field>
        <Field label="Language">
          <Select 
            options={LANGUAGES} 
            value={LANGUAGES.find(o => o.value === profile.language)} 
            onChange={s => onChange('language', s.value)} 
            styles={newSelectStyles} 
            isSearchable={false} 
            menuPortalTarget={document.body}
          />
        </Field>
      </Section>
    </>
  );
}
