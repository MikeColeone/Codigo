import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

type SettingsLogoUploaderProps = {
  logoUrl: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

/**
 * 基础设置 logo 上传组件：提供上传、预览与移除交互。
 */
export default function SettingsLogoUploader(props: SettingsLogoUploaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="group relative flex h-[108px] w-[108px] cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] transition-colors hover:border-[var(--ide-accent)] hover:bg-[var(--ide-hover)]">
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          disabled={props.uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              props.onUpload(file);
            }
            event.currentTarget.value = "";
          }}
        />
        {props.logoUrl ? (
          <img
            src={props.logoUrl}
            alt="站点 logo"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--ide-text-muted)]">
            {props.uploading ? (
              <LoadingOutlined className="text-[18px]" />
            ) : (
              <PlusOutlined className="text-[18px]" />
            )}
          </div>
        )}
        {props.uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.35)] text-[11px] text-white">
            上传中
          </div>
        ) : null}
      </label>
      <div className="text-[11px] leading-5 text-[var(--ide-text-muted)]">
        支持 2MB 以内 PNG、JPG 格式图片
      </div>
      {props.logoUrl ? (
        <div className="flex items-center gap-2">
          <Button size="small" onClick={() => props.onRemove()}>
            移除
          </Button>
          <div className="text-[11px] text-[var(--ide-text-muted)]">点击图片可重新上传</div>
        </div>
      ) : null}
    </div>
  );
}
