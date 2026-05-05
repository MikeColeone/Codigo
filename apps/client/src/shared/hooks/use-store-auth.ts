import { createStoreAuth } from "../stores";
import { computed, action, runInAction } from "mobx";
import type { IUser } from "@codigo/schema";
import request from "../utils/request";

export const storeAuth = createStoreAuth();
export function useStoreAuth() {
  const isLogin = computed(() => !!storeAuth.token);
  const login = action(async (token: string) => {
    const formattedToken = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
    runInAction(() => {
      storeAuth.token = formattedToken;
    });
    localStorage.setItem("token", formattedToken);
    await fetchUserInfo();
  });

  const logout = action(() => {
    runInAction(() => {
      storeAuth.token = "";
      storeAuth.details = null;
    });
    localStorage.removeItem("token");
  });

  const fetchUserInfo = action(async () => {
    if (!storeAuth.token) return null;
    try {
      const { data } = await request("/user/me");
      runInAction(() => {
        storeAuth.details = data;
      });
      return data;
    } catch (e: unknown) {
      console.error("获取用户信息失败", e);
        logout();
      return null;
    }
  });

  const updateLocalUserInfo = action((updates: Partial<IUser>) => {
    if (storeAuth.details) {
      runInAction(() => {
        storeAuth.details = {
          ...storeAuth.details,
          ...updates,
        } as IUser;
      });
    }
  });

  return {
    login,
    logout,
    isLogin,
    fetchUserInfo,
    updateLocalUserInfo,
    store: storeAuth,
  };
}
