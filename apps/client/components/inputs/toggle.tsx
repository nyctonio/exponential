import { Switch } from 'antd';

type ToggleAntdProps = {
  loading?: boolean;
  checked: boolean;
  onChange: (checked: boolean, event: any) => void;
  disabled?: boolean;
};

export function ToggleAntd({
  loading = false,
  checked,
  onChange,
  disabled = false,
}: ToggleAntdProps) {
  return (
    <Switch
      style={{
        backgroundColor: checked ? 'var(--primary-shade-b)' : 'gray',
      }}
      className="w-10"
      loading={loading}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

export function LabeledToggle({
  label,
  loading = false,
  checked,
  onChange,
  disabled = false,
}: ToggleAntdProps & { label: string }) {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <ToggleAntd
          loading={loading}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="text-[#696F8C] text-xs font-[400]" htmlFor="">
          {checked ? 'Enabled' : 'Disabled'}
        </label>
      </div>
    </div>
  );
}

export function InlineLabeledToggle({
  label,
  loading = false,
  checked,
  onChange,
  disabled = false,
  mobile = false,
}: ToggleAntdProps & { label: string; mobile?: boolean }) {
  return (
    <div
      className={`flex items-center ${
        mobile ? 'justify-between md:justify-start' : ''
      }  space-x-2`}
    >
      <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
        {label}
      </label>
      <ToggleAntd
        loading={loading}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export function SwitchToggle({
  onlabel,
  offlabel,
  loading = false,
  checked,
  onChange,
  disabled = false,
  className = '',
}: ToggleAntdProps & {
  onlabel: string;
  offlabel: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
        {onlabel}
      </label>
      <ToggleAntd
        loading={loading}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
        {offlabel}
      </label>
    </div>
  );
}
