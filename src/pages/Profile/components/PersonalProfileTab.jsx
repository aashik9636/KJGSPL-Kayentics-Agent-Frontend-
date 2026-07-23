import React from 'react';
import Select from 'react-select';
import { Section, Field, InputCls } from './SharedUI';
import { TIMEZONES, LANGUAGES, selectStyles } from '../utils';

export default function PersonalProfileTab({ profile, errors, onChange }) {
  return (
    <div className="animate-fade-in">
      <Section title="General" description="Update your personal information and contact details.">
        <div className="grid grid-cols-2 gap-5">
          <Field label="First Name *" error={errors.firstName}>
            <input type="text" value={profile.firstName} onChange={e => onChange('firstName', e.target.value)} className={InputCls(errors.firstName)} placeholder="Jane" />
          </Field>
          <Field label="Last Name *" error={errors.lastName}>
            <input type="text" value={profile.lastName} onChange={e => onChange('lastName', e.target.value)} className={InputCls(errors.lastName)} placeholder="Doe" />
          </Field>
        </div>
        <Field label="Email Address">
          <input type="email" value={profile.email} disabled className="w-full px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-[14px] text-gray-500 cursor-not-allowed" />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input type="tel" value={profile.phone} onChange={e => onChange('phone', e.target.value)} className={InputCls(errors.phone)} placeholder="+1 (555) 000-0000" />
        </Field>
      </Section>

      <Section title="Professional Role" description="Your designation within the organization.">
        <Field label="Job Title">
          <input type="text" value={profile.jobTitle} onChange={e => onChange('jobTitle', e.target.value)} className={InputCls(errors.jobTitle)} placeholder="e.g. Marketing Director" />
        </Field>
        <Field label="Department">
          <input type="text" value={profile.department} onChange={e => onChange('department', e.target.value)} className={InputCls(errors.department)} placeholder="e.g. Demand Generation" />
        </Field>
      </Section>

      <Section title="Preferences" description="Manage your region and language settings." border={false}>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Timezone">
            <Select options={TIMEZONES} value={TIMEZONES.find(o => o.value === profile.timezone)} onChange={s => onChange('timezone', s.value)} styles={selectStyles} isSearchable />
          </Field>
          <Field label="Language">
            <Select options={LANGUAGES} value={LANGUAGES.find(o => o.value === profile.language)} onChange={s => onChange('language', s.value)} styles={selectStyles} isSearchable={false} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
