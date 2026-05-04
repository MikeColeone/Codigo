import type { AdminBigScreenOverviewResponse } from "@codigo/schema";
import request from "@/shared/utils/request";

/**
 * 获取后台数据大屏概览数据。
 */
export async function fetchAdminBigScreenOverview() {
  const response = await request<{ data: AdminBigScreenOverviewResponse }>("/admin/big-screen", {
    method: "GET",
  });
  return response.data;
}
