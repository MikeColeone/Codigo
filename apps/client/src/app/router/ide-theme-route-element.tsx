import { type ReactNode } from "react";
import { IdeThemeLayout } from "@/app/layouts/ide-theme-layout";
import SuspensedRouteElement from "./suspensed-route-element";
type IdeThemeRouteElementProps = {
  children: ReactNode;
};
export function IdeThemeRouteElement({ children }: IdeThemeRouteElementProps) {
  return (
    <IdeThemeLayout className="h-full w-full overflow-hidden">
      <SuspensedRouteElement loadingMode="fullscreen">{children}</SuspensedRouteElement>
    </IdeThemeLayout>
  );
}

