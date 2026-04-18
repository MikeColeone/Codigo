import type { FC } from "react";
import { Form, InputNumber } from "antd";

type PxFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
};

const PxField: FC<PxFieldProps> = ({ name, label, placeholder }) => {
  return (
    <Form.Item label={label} name={name} className="!mb-0">
      <div className="relative [&_.ant-input-number-input]:!pr-7">
        <InputNumber placeholder={placeholder} size="small" controls={false} />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ide-text-muted)]">
          px
        </span>
      </div>
    </Form.Item>
  );
};

const PlainField: FC<PxFieldProps> = ({ name, label, placeholder }) => {
  return (
    <Form.Item label={label} name={name} className="!mb-0">
      <InputNumber placeholder={placeholder} size="small" controls={false} />
    </Form.Item>
  );
};

const SpacingDiagramFields: FC = () => {
  return (
    <div className="relative mx-auto h-[168px] w-full max-w-[320px] select-none">
      <div className="absolute inset-0 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)]/10" />
      <div className="absolute inset-[22px] rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)]/70" />
      <div className="absolute inset-[54px] rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)]/20" />
      <div className="absolute inset-[86px] rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]/60" />

      <div className="absolute left-2 top-2 text-[10px] text-[var(--ide-text-muted)]">
        外边距
      </div>
      <div className="absolute left-[30px] top-[30px] text-[10px] text-[var(--ide-text-muted)]">
        内边距
      </div>

      <div className="absolute left-1/2 top-2 w-[72px] -translate-x-1/2">
        <PxField name="marginTop" placeholder="0" />
      </div>
      <div className="absolute right-2 top-1/2 w-[72px] -translate-y-1/2">
        <PxField name="marginRight" placeholder="0" />
      </div>
      <div className="absolute left-1/2 bottom-2 w-[72px] -translate-x-1/2">
        <PxField name="marginBottom" placeholder="0" />
      </div>
      <div className="absolute left-2 top-1/2 w-[72px] -translate-y-1/2">
        <PxField name="marginLeft" placeholder="0" />
      </div>

      <div className="absolute left-1/2 top-[46px] w-[72px] -translate-x-1/2">
        <PxField name="paddingTop" placeholder="0" />
      </div>
      <div className="absolute right-[46px] top-1/2 w-[72px] -translate-y-1/2">
        <PxField name="paddingRight" placeholder="0" />
      </div>
      <div className="absolute left-1/2 bottom-[46px] w-[72px] -translate-x-1/2">
        <PxField name="paddingBottom" placeholder="0" />
      </div>
      <div className="absolute left-[46px] top-1/2 w-[72px] -translate-y-1/2">
        <PxField name="paddingLeft" placeholder="0" />
      </div>
    </div>
  );
};

export const LayoutSpacingFields: FC<{ isGridRoot: boolean }> = ({
  isGridRoot,
}) => {
  if (isGridRoot) {
    return (
      <div className="space-y-2">
        <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
            栅格位置
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <PlainField name="gridColumnStart" label="列" placeholder="1" />
            <PlainField name="gridRowStart" label="行" placeholder="1" />
            <PlainField name="gridColumnSpan" label="列跨度" placeholder="1" />
            <PlainField name="gridRowSpan" label="行跨度" placeholder="1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
          位置大小
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          <PxField name="left" label="X" placeholder="0" />
          <PxField name="top" label="Y" placeholder="0" />
        </div>

        <div className="mt-2 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]/30 p-2">
          <SpacingDiagramFields />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-2">
          <PxField name="width" label="宽" placeholder="0" />
          <PxField name="height" label="高" placeholder="0" />
        </div>
      </div>
    </div>
  );
};

