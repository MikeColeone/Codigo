import type { FC } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { getComponentPropsByType } from "@/modules/editor/components/LowCodeComponents";
import type { TStoreComponents } from "@/shared/stores";
import { useStoreComponents } from "@/shared/hooks";

const ComponentFields: FC<{ store: TStoreComponents }> = observer(
  ({ store }) => {
    // 为选中组件展示
    if (!store.currentCompConfig)
      return <div style={{ textAlign: "center" }}>未选中组件</div>;

    const { getCurrentComponentConfig } = useStoreComponents();

    // 右侧的配置属性组件
    const ComponentProps = getComponentPropsByType(
      getCurrentComponentConfig.get()!.type
      // "image"
    );

    return (
      <ComponentProps
        {...toJS(getCurrentComponentConfig.get()?.props)}
        id={getCurrentComponentConfig.get()?.id}
      />
    );
  }
);

export default ComponentFields;
