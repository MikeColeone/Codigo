"use client";

import {
  type GetReleaseDataResponse,
  type TBasicComponentConfig,
  getComponentByType,
  initBuiltinComponents,
} from "@codigo/materials-react";
import { useRequest } from "ahooks";
import { useImmer } from "use-immer";
import { useState } from "react";
import { message, Button } from "antd";

initBuiltinComponents();

const usingInputType = ["input", "textArea", "radio", "checkbox"];

// �������
function generateComponent(
  conf: TBasicComponentConfig,
  onUpdate: (value: any) => void,
) {
  const Component = getComponentByType(conf.type);

  // ����������ֱ����Ⱦ
  if (!usingInputType.includes(conf.type))
    return <Component {...conf.props} key={conf.id} />;
  // ����������Ҫ���»ص�
  else return <Component {...conf.props} key={conf.id} onUpdate={onUpdate} />;
}

// ��ȡ�����ֵ
function getQuestionComponentValueField(component: any) {
  switch (component.type) {
    case "input":
    case "textArea":
      return "text";
    case "radio":
      return "defaultRadio";
    case "checkbox":
      return "defaultChecked";
    default:
      return null;
  }
}

// �����Ⱦ����
interface ComponentRenderType {
  id: string;
  data: GetReleaseDataResponse;
}

// �����Ⱦ���
export default function ComponentRender({ data, id }: ComponentRenderType) {
  const [isPosted, setIsPosted] = useState(false);
  // ��¡���ݲ����оֲ�״̬����
  const [localData, setLocalData] = useImmer(
    JSON.parse(JSON.stringify(data)) as ComponentRenderType["data"],
  );

  // �������
  function generateComponents() {
    return localData.components
      .map((comp) => {
        return {
          id: comp.id,
          type: comp.type,
          props: comp.options,
        };
      })
      .map((comp: any) =>
        generateComponent(comp, (value) => {
          // ���¾ֲ����������
          setLocalData((draft) => {
            const target = draft.components.find(
              (item) => item.id === comp.id,
            )!;
            const questionComponentValueField =
              getQuestionComponentValueField(target);
            if (questionComponentValueField)
              target.options[questionComponentValueField] = value;
          });
        }),
      );
  }

  // �������Ƿ��Ѿ��ύ���ʾ�
  useRequest(
    async () => {
      const _f = await fetch(
        `http://8.134.163.0:5000/api/pages/${data.id}/submissions/me`,
      );
      return _f.json() as Promise<{ data: boolean }>;
    },
    {
      onSuccess: ({ data }) => {
        // ����Ѿ��ύ�������ٴ��ύ
        if (data) {
          setIsPosted(true);
          message.open({ content: "�����ύ���ʾ�����л���Ĳ���" });
        }
      },
    },
  );

  // �ύ�ʾ�����
  const { run, loading } = useRequest(
    async () => {
      // ѭ���ж�ֵ�Ƿ����
      // ���ֵ�������������ύ
      const isNotCompleted = localData.components.some((comp) => {
        const questionComponentValueField =
          getQuestionComponentValueField(comp);
        if (
          questionComponentValueField &&
          !comp.options[questionComponentValueField]
        )
          return !["defaultRadio", "defaultChecked"].includes(
            questionComponentValueField,
          );

        return false;
      });
      // ���ʾ�δ��д��������ʾ��ʾ��Ϣ
      if (isNotCompleted) return { msg: "����д�����ʾ���Ϣ", data: false };

      // �ύ�ʾ�����
      const _f = await fetch(
        `http://8.134.163.0:5000/api/pages/${data.id}/submissions`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            props: localData.components
              .filter((comp) => usingInputType.includes(comp.type))
              .map((comp) => {
                return {
                  id: comp.id,
                  value: comp.options[getQuestionComponentValueField(comp)!],
                };
              }),
          }),
        },
      );

      return _f.json();
    },
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        if (data !== undefined) {
          message.warning(msg);
        } else {
          message.success(msg);
          setIsPosted(true);
        }
      },
    },
  );

  return (
    <div
      className={`${isPosted && "opacity-50 select-none pointer-events-none"}`}
    >
      {/* �����Ⱦ */}
      {generateComponents()}

      {/* �ύ�ʾ���ť */}
      {data.components.some((comp) => usingInputType.includes(comp.type)) && (
        <div className="flex items-center justify-center">
          <Button type="primary" onClick={run} loading={loading}>
            �ύ�ʾ�
          </Button>
        </div>
      )}
    </div>
  );
}
