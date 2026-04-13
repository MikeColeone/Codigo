import type {
  GetTemplateListResponse,
  TemplateDetailResponse,
  TemplateListQuery,
} from "@codigo/schema";
import request from "@/shared/utils/request";

export async function fetchTemplateList(params?: TemplateListQuery) {
  const response = await request<{ data: GetTemplateListResponse }>("/templates", {
    method: "GET",
    params,
  });
  return response.data;
}

export async function fetchTemplateDetail(id: number) {
  const response = await request<{ data: TemplateDetailResponse }>(`/templates/${id}`, {
    method: "GET",
  });
  return response.data;
}

