import { makeAutoObservable } from "mobx";
import type { IUser } from "@codigo/schema";
interface IStoreAuth {
  token: string | null;
  details: IUser | null;
}
export function createStoreAuth() {
  return makeAutoObservable<IStoreAuth>({
    token: localStorage.getItem("token"),
    details: null,
  });
}
export type TStoreAuth = ReturnType<typeof createStoreAuth>;