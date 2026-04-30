import { AimOutlined } from "@ant-design/icons";
import { Button, ColorPicker, Input, InputNumber, Segmented, Space, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ulid } from "ulid";
import {
  GEO_MAP_PICK_EVENT,
  fillComponentPropsByConfig,
  geoMapComponentDefaultConfig,
  geoMapRegionOptions,
  type IGeoMapComponentProps,
} from "@codigo/materials";
import { useEditorComponents } from "@/modules/editor/hooks";
import { FormContainer, FormPropLabel, FormContainerWithList } from "..";

type PickerColor = {
  toHexString: () => string;
};

type MapPickDetail = {
  nodeId: string;
  longitude: number;
  latitude: number;
};

export default function GeoMapComponentProps(_props: IGeoMapComponentProps) {
  const { updateCurrentCompConfigWithArray, getCurrentComponentConfig, store } =
    useEditorComponents();
  const [targetMarkerId, setTargetMarkerId] = useState<string | null>(null);
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, geoMapComponentDefaultConfig);
  }, [_props]);

  useEffect(() => {
    const currentId = getCurrentComponentConfig.get()?.id;
    if (!currentId || typeof window === "undefined") {
      return;
    }

    const handlePick = (event: Event) => {
      const detail = (event as CustomEvent<MapPickDetail>).detail;
      if (!detail || detail.nodeId !== currentId) {
        return;
      }

      const markers = Array.isArray(getCurrentComponentConfig.get()?.props?.markers)
        ? ((getCurrentComponentConfig.get()?.props?.markers ?? []) as Array<Record<string, any>>)
        : [];
      const targetId = targetMarkerId ?? markers[store.itemsExpandIndex]?.id;
      if (!targetId) {
        message.info("请先展开一个标记点后再点击地图取坐标");
        return;
      }

      const targetIndex = markers.findIndex((item) => item.id === targetId);
      if (targetIndex < 0) {
        message.warning("未找到当前要更新的标记点");
        return;
      }

      updateCurrentCompConfigWithArray({
        key: "markers",
        index: targetIndex,
        field: "longitude",
        value: String(detail.longitude),
      });
      updateCurrentCompConfigWithArray({
        key: "markers",
        index: targetIndex,
        field: "latitude",
        value: String(detail.latitude),
      });
      message.success(`已写入坐标：${detail.longitude}, ${detail.latitude}`);
    };

    window.addEventListener(GEO_MAP_PICK_EVENT, handlePick as EventListener);
    return () => {
      window.removeEventListener(GEO_MAP_PICK_EVENT, handlePick as EventListener);
    };
  }, [
    getCurrentComponentConfig,
    store.itemsExpandIndex,
    targetMarkerId,
    updateCurrentCompConfigWithArray,
  ]);

  return (
    <div className="space-y-4">
      <FormContainer layout="vertical" config={props}>
        <FormPropLabel prop={props.title} name="title" label="标题：">
          <Input />
        </FormPropLabel>
        <FormPropLabel prop={props.subtitle} name="subtitle" label="副标题：">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </FormPropLabel>
        <FormPropLabel
          prop={props.interactionHint}
          name="interactionHint"
          label="交互提示："
        >
          <Input />
        </FormPropLabel>
        <FormPropLabel
          prop={props.backgroundColor}
          name="backgroundColor"
          label="卡片背景："
        >
          <Input type="color" />
        </FormPropLabel>
        <FormPropLabel prop={props.oceanColor} name="oceanColor" label="海洋颜色：">
          <Input type="color" />
        </FormPropLabel>
        <FormPropLabel
          prop={props.defaultRegionColor}
          name="defaultRegionColor"
          label="区域默认色："
        >
          <Input type="color" />
        </FormPropLabel>
        <FormPropLabel
          prop={props.regionBorderColor}
          name="regionBorderColor"
          label="区域描边色："
        >
          <Input type="color" />
        </FormPropLabel>
        <FormPropLabel prop={props.markerColor} name="markerColor" label="默认标记色：">
          <Input type="color" />
        </FormPropLabel>
        <FormPropLabel
          prop={props.showLabels}
          name="showLabels"
          label="显示标签："
        >
          <Segmented
            options={[
              { label: "显示", value: true },
              { label: "隐藏", value: false },
            ]}
          />
        </FormPropLabel>
        <FormPropLabel
          prop={props.showLegend}
          name="showLegend"
          label="显示图例："
        >
          <Segmented
            options={[
              { label: "显示", value: true },
              { label: "隐藏", value: false },
            ]}
          />
        </FormPropLabel>
        <FormPropLabel prop={props.optionText} name="optionText" label="高级 Option：">
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            className="font-mono text-xs"
            placeholder='例如：{"tooltip":{"backgroundColor":"#fff"}}'
          />
        </FormPropLabel>
      </FormContainer>

      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
          标记点
        </div>
        <div className="mb-3 text-[11px] leading-5 text-[var(--ide-text-muted)]">
          先展开一个标记点，再点击画布中的地图即可自动写入坐标。
        </div>
        <FormContainerWithList
          id={String(getCurrentComponentConfig.get()?.id ?? "")}
          keyName="markers"
          items={props.markers.value}
          newItemDefaultValue={{
            id: ulid(),
            name: "New marker",
            longitude: 0,
            latitude: 0,
            value: "",
            color: props.markerColor.value,
            size: 14,
          }}
        >
          <FormPropLabel prop={props.markers} name="name" label="名称：">
            <Input />
          </FormPropLabel>
          <FormPropLabel prop={props.markers} name="value" label="说明值：">
            <Input />
          </FormPropLabel>
          <Space.Compact className="!flex">
            <FormPropLabel prop={props.markers} name="longitude" label="经度：">
              <InputNumber min={-180} max={180} step={0.0001} className="!w-full" />
            </FormPropLabel>
            <FormPropLabel prop={props.markers} name="latitude" label="纬度：">
              <InputNumber min={-90} max={90} step={0.0001} className="!w-full" />
            </FormPropLabel>
          </Space.Compact>
          <FormPropLabel prop={props.markers} name="size" label="点大小：">
            <InputNumber min={8} max={28} className="!w-full" />
          </FormPropLabel>
          <div className="mb-3">
            <div className="mb-1 text-[11px] text-[var(--ide-text-muted)]">点颜色：</div>
            <ColorPicker
              showText
              onChange={(value) => {
                const currentMarkers = props.markers.value;
                const target = currentMarkers[store.itemsExpandIndex];
                if (!target) return;
                updateCurrentCompConfigWithArray({
                  key: "markers",
                  index: store.itemsExpandIndex,
                  field: "color",
                  value: (value as PickerColor).toHexString(),
                });
              }}
            />
          </div>
          <Button
            icon={<AimOutlined />}
            onClick={() => {
              const currentMarkers = props.markers.value;
              const target = currentMarkers[store.itemsExpandIndex];
              setTargetMarkerId(target?.id ?? null);
              message.info("请点击画布中的地图位置以写入当前标记点坐标");
            }}
          >
            从地图取坐标
          </Button>
        </FormContainerWithList>
      </div>

      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
          区域高亮
        </div>
        <FormContainerWithList
          id={`${getCurrentComponentConfig.get()?.id ?? ""}-regions`}
          keyName="highlightRegions"
          items={props.highlightRegions.value}
          newItemDefaultValue={{
            id: ulid(),
            regionKey: "asia",
            label: "Asia",
            value: "",
            color: props.defaultRegionColor.value,
          }}
        >
          <FormPropLabel prop={props.highlightRegions} name="label" label="区域名称：">
            <Input />
          </FormPropLabel>
          <FormPropLabel prop={props.highlightRegions} name="value" label="区域值：">
            <Input />
          </FormPropLabel>
          <FormPropLabel
            prop={props.highlightRegions}
            name="regionKey"
            label="区域范围："
          >
            <Segmented
              options={geoMapRegionOptions.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </FormPropLabel>
          <div className="mb-3">
            <div className="mb-1 text-[11px] text-[var(--ide-text-muted)]">区域颜色：</div>
            <ColorPicker
              showText
              onChange={(value) => {
                updateCurrentCompConfigWithArray({
                  key: "highlightRegions",
                  index: store.itemsExpandIndex,
                  field: "color",
                  value: (value as PickerColor).toHexString(),
                });
              }}
            />
          </div>
        </FormContainerWithList>
      </div>
    </div>
  );
}
