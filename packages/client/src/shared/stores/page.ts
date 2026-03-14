import { makeAutoObservable } from "mobx";

interface IStorePage {
  title: string;
  description: string;
  tdk: string;
}

export function createStorePage() {
  return makeAutoObservable<IStorePage>({
    title: "Codigo低代码平台",
    description: "Codigo低代码开发页面详情",
    tdk: "lowcode platform, lowcode development, lowcode page details",
  });
}

export type TStorePage = ReturnType<typeof createStorePage>;
