import { useEffect, useMemo, useState } from "react";
import { useTitle } from "ahooks";
import {
  Avatar,
  Button,
  Input,
  List,
  Modal,
  Select,
  Space,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import request from "@/shared/utils/request";
import { useAdminPageId } from "../hooks/use-admin-page-id";
import {
  roleColorMap,
  roleLabelMap,
  type PermissionRole,
} from "@/modules/editor/stores";

type CollaboratorRow = {
  id: string;
  user_id: number;
  name: string;
  role: PermissionRole;
};

export default function AdminPermissions() {
  useTitle("Codigo - 权限设置");
  const navigate = useNavigate();
  const { pageId, resolvingPageId, hasPageId } = useAdminPageId();
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<PermissionRole>("viewer");

  const roleOptions = useMemo(
    () =>
      (Object.keys(roleLabelMap) as PermissionRole[]).map((role) => ({
        value: role,
        label: roleLabelMap[role],
      })),
    [],
  );

  const loadCollaborators = async () => {
    if (!pageId) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await request(`/pages/${pageId}/collaborators`, {
        method: "GET",
      });
      setCollaborators((data?.collaborators ?? []) as CollaboratorRow[]);
    } catch (error: any) {
      message.error(error?.response?.data?.msg ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    const normalized = inviteName.trim();
    if (!pageId) {
      message.warning("缺少页面编号");
      return;
    }
    if (!normalized) {
      message.warning("请输入协作者用户名");
      return;
    }
    setLoading(true);
    try {
      await request(`/pages/${pageId}/collaborators`, {
        method: "POST",
        data: { userName: normalized, role: inviteRole },
      });
      setInviteName("");
      await loadCollaborators();
    } catch (error: any) {
      message.error(error?.response?.data?.msg ?? "邀请失败");
      setLoading(false);
    }
  };

  const handleUpdateRole = async (row: CollaboratorRow, nextRole: PermissionRole) => {
    if (!pageId) {
      message.warning("缺少页面编号");
      return;
    }
    if (row.role === "owner") {
      return;
    }
    setLoading(true);
    try {
      await request(`/pages/${pageId}/collaborators/${row.user_id}`, {
        method: "PUT",
        data: { role: nextRole },
      });
      await loadCollaborators();
    } catch (error: any) {
      message.error(error?.response?.data?.msg ?? "修改失败");
      setLoading(false);
    }
  };

  const handleRemove = async (row: CollaboratorRow) => {
    if (!pageId) {
      message.warning("缺少页面编号");
      return;
    }
    if (row.role === "owner") {
      return;
    }
    Modal.confirm({
      title: "移除协作者",
      content: `确认移除 ${row.name} 吗？`,
      okText: "移除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        setLoading(true);
        try {
          await request(`/pages/${pageId}/collaborators/${row.user_id}`, {
            method: "DELETE",
          });
          await loadCollaborators();
        } catch (error: any) {
          message.error(error?.response?.data?.msg ?? "移除失败");
          setLoading(false);
        }
      },
    });
  };

  const owner = collaborators.find((item) => item.role === "owner") ?? null;
  const members = collaborators.filter((item) => item.role !== "owner");

  useEffect(() => {
    if (hasPageId) {
      void loadCollaborators();
    }
  }, [hasPageId, pageId]);

  return (
    <div className="h-full p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] text-[var(--ide-text-muted)]">
            页面协作权限
          </div>
          <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ide-text)]">
            权限设置
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {resolvingPageId ? null : hasPageId ? (
            <>
              <Button type="default" onClick={() => navigate(`/editor?id=${pageId}`)}>
                返回编辑器
              </Button>
              <Button type="default" loading={loading} onClick={loadCollaborators}>
                刷新
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate("/editor")}>
              进入编辑器
            </Button>
          )}
        </div>
      </div>

      {resolvingPageId ? (
        <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            正在读取页面
          </div>
          <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">
            当前入口未携带页面编号，正在读取你拥有的页面权限信息。
          </div>
        </div>
      ) : !hasPageId ? (
        <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            暂无可管理页面
          </div>
          <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">
            当前入口未携带页面编号，且没有读取到你拥有的页面。请先进入编辑器创建或打开一个页面。
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-3">
          <section className="col-span-12 lg:col-span-4 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
            <div className="text-[12px] font-medium text-[var(--ide-text)]">
              邀请协作者
            </div>
            <div className="mt-2 text-[11px] text-[var(--ide-text-muted)]">
              输入对方的用户名（username），邀请后对方可通过开发链接进入编辑器。
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="用户名"
                disabled={loading}
              />
              <Select
                value={inviteRole}
                onChange={(value) => setInviteRole(value)}
                options={roleOptions}
                disabled={loading}
              />
              <Button type="primary" onClick={handleInvite} loading={loading}>
                邀请
              </Button>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-8 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  协作者列表
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--ide-text-muted)]">
                  页面 ID：{pageId}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <List
                loading={loading}
                dataSource={owner ? [owner, ...members] : members}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Select
                        key="role"
                        value={item.role}
                        onChange={(value) => handleUpdateRole(item, value)}
                        options={roleOptions}
                        disabled={loading || item.role === "owner"}
                        style={{ width: 100 }}
                      />,
                      item.role !== "owner" ? (
                        <Button
                          key="remove"
                          danger
                          type="text"
                          disabled={loading}
                          onClick={() => handleRemove(item)}
                        >
                          移除
                        </Button>
                      ) : (
                        <span key="owner" className="text-[11px] text-[var(--ide-text-muted)]">
                          所有者
                        </span>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={28}
                          className="border border-[var(--ide-border)]"
                          style={{
                            backgroundColor: roleColorMap[item.role],
                            color: "white",
                          }}
                        >
                          {(item.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      title={
                        <Space size={8}>
                          <span className="text-[12px] text-[var(--ide-text)]">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-[var(--ide-text-muted)]">
                            {roleLabelMap[item.role]}
                          </span>
                        </Space>
                      }
                      description={
                        <span className="text-[11px] text-[var(--ide-text-muted)]">
                          user_id: {item.user_id}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
