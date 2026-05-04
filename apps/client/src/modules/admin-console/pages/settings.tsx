import { useEffect, useMemo, useState } from "react";
import { useTitle } from "ahooks";
import { Button, Input, Modal, message } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useStoreAuth } from "@/shared/hooks";
import { uploadFile } from "@/modules/editor/api/resource";
import SettingsLogoUploader from "../components/settings-logo-uploader";
import {
  buildSiteAccessUrl,
  clearSiteSettings,
  createDefaultSiteSettings,
  loadSiteSettings,
  sanitizeSiteSlug,
  saveSiteSettings,
  type SiteSettingsDraft,
} from "../utils/site-settings-storage";

const { TextArea } = Input;

/**
 * 基础设置页：维护站点基础信息、logo 与本地草稿状态。
 */
export default function AdminSettings() {
  useTitle("Codigo - 基础设置");
  const { store } = useStoreAuth();
  const ownerName = store.details?.username?.trim() || "";

  const [savedSettings, setSavedSettings] = useState<SiteSettingsDraft>(() =>
    loadSiteSettings(ownerName),
  );
  const [form, setForm] = useState<SiteSettingsDraft>(() => loadSiteSettings(ownerName));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const nextSettings = loadSiteSettings(ownerName);
    setSavedSettings(nextSettings);
    setForm(nextSettings);
  }, [ownerName]);

  const accessUrl = useMemo(() => buildSiteAccessUrl(form.siteSlug), [form.siteSlug]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedSettings);

  const updateForm = (patch: Partial<SiteSettingsDraft>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    const siteName = form.siteName.trim();
    const siteSlug = sanitizeSiteSlug(form.siteSlug);
    const nextOwnerName = form.ownerName.trim() || ownerName || "当前创建者";
    if (!siteName) {
      message.warning("请输入站点名称");
      return;
    }
    if (!siteSlug) {
      message.warning("请输入合法的站点地址");
      return;
    }
    setSaving(true);
    const nextValue: SiteSettingsDraft = {
      ...form,
      siteName,
      siteSlug,
      ownerName: nextOwnerName,
      description: form.description.trim(),
    };
    saveSiteSettings(nextValue);
    setSavedSettings(nextValue);
    setForm(nextValue);
    setSaving(false);
    message.success("基础设置已保存");
  };

  const handleReset = () => {
    setForm(savedSettings);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "删除站点",
      icon: <ExclamationCircleFilled />,
      content: "删除后会清空当前站点的基础设置草稿与 logo 预览，是否继续？",
      okText: "删除站点",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        const nextValue = createDefaultSiteSettings(ownerName);
        clearSiteSettings();
        setSavedSettings(nextValue);
        setForm(nextValue);
        message.success("站点基础设置已删除");
      },
    });
  };

  const handleUploadLogo = async (file: File) => {
    const validType = ["image/png", "image/jpeg"].includes(file.type);
    if (!validType) {
      message.warning("仅支持 PNG、JPG 格式图片");
      return;
    }
    const isWithinLimit = file.size <= 2 * 1024 * 1024;
    if (!isWithinLimit) {
      message.warning("图片大小不能超过 2MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      const response = await uploadFile(formData);
      const url = response?.data?.url;
      if (!url) {
        throw new Error("missing-url");
      }
      updateForm({ logoUrl: url });
      message.success("logo 上传成功");
    } catch (error: any) {
      message.error(error?.response?.data?.msg ?? "logo 上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full p-4">
      <div className="mx-auto max-w-[1120px] rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-5 shadow-[var(--ide-panel-shadow)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] text-[var(--ide-text-muted)]">控制台 / 站点配置</div>
            <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ide-text)]">
              基础设置
            </h2>
          </div>
          <div className="text-[11px] text-[var(--ide-text-muted)]">
            修改后保存即可更新当前站点基础信息
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1 text-[12px] text-[var(--ide-text)]">
              站点名称 <span className="text-[#ff4d4f]">*</span>
            </div>
            <Input
              value={form.siteName}
              placeholder="请输入站点名称"
              maxLength={40}
              onChange={(event) => updateForm({ siteName: event.target.value })}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1 text-[12px] text-[var(--ide-text)]">
              站点地址 <span className="text-[#ff4d4f]">*</span>
            </div>
            <div className="space-y-2">
              <Input
                value={form.siteSlug}
                placeholder="请输入站点地址"
                maxLength={32}
                onChange={(event) =>
                  updateForm({ siteSlug: sanitizeSiteSlug(event.target.value) })
                }
              />
              <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] px-3 py-2 text-[12px] text-[var(--ide-text-muted)]">
                {accessUrl}
              </div>
              <div className="text-[11px] leading-5 text-[var(--ide-text-muted)]">
                修改后需要重新保存，站点访问链接会按最新地址更新
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1 text-[12px] text-[var(--ide-text)]">站点 logo</div>
            <SettingsLogoUploader
              logoUrl={form.logoUrl}
              uploading={uploading}
              onUpload={handleUploadLogo}
              onRemove={() => updateForm({ logoUrl: "" })}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1 text-[12px] text-[var(--ide-text)]">站点负责人</div>
            <div className="space-y-2">
              <Input
                value={form.ownerName}
                placeholder="请输入负责人"
                maxLength={30}
                onChange={(event) => updateForm({ ownerName: event.target.value })}
              />
              <div className="text-[11px] leading-5 text-[var(--ide-text-muted)]">
                默认使用当前登录用户，也可以手动修改为其他负责人
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1 text-[12px] text-[var(--ide-text)]">站点描述</div>
            <TextArea
              value={form.description}
              placeholder="请输入站点描述"
              rows={4}
              maxLength={200}
              showCount
              onChange={(event) => updateForm({ description: event.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--ide-border)] pt-4">
          <div className="text-[11px] text-[var(--ide-text-muted)]">
            {isDirty ? "当前有未保存变更" : "当前内容已是最新保存状态"}
          </div>
          <div className="flex items-center gap-2">
            <Button danger onClick={handleDelete}>
              删除站点
            </Button>
            <Button onClick={handleReset} disabled={!isDirty}>
              取消
            </Button>
            <Button type="primary" onClick={handleSave} loading={saving}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
