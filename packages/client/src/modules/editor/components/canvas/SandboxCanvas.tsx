import { useMemo, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { useStoreComponents, useStorePage } from "@/shared/hooks";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { message } from "antd";

// Custom hook component to listen for code changes in Sandpack
const CodeSyncListener = ({
  onCodeChange,
}: {
  onCodeChange: (code: string) => void;
}) => {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;

  useEffect(() => {
    const activeFileContent = files[activeFile]?.code;
    if (activeFileContent) {
      // We debounce the sync in the parent component
      onCodeChange(activeFileContent);
    }
  }, [files, activeFile, onCodeChange]);

  return null;
};

function extractSchemaText(source: string) {
  const schemaKey = "const pageSchema =";
  const keyIndex = source.indexOf(schemaKey);
  if (keyIndex < 0) {
    throw new Error("未找到 pageSchema，请保留 const pageSchema = [...]");
  }

  const schemaStart = source.indexOf("[", keyIndex);
  if (schemaStart < 0) {
    throw new Error("未找到 pageSchema 数组起始位置");
  }

  let depth = 0;
  let schemaEnd = -1;

  for (let i = schemaStart; i < source.length; i++) {
    const char = source[i];
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        schemaEnd = i;
        break;
      }
    }
  }

  if (schemaEnd < 0) {
    throw new Error("pageSchema 数组未正常闭合");
  }

  return source.slice(schemaStart, schemaEnd + 1);
}

export const SandboxCanvas = observer(() => {
  const { store, getComponentById, replaceByCode } = useStoreComponents();
  const { store: pageStore } = useStorePage();

  const schemaText = useMemo(() => {
    const serializableComponents = store.sortableCompConfig
      .map((id) => getComponentById(id))
      .filter(Boolean)
      .map((item) => {
        return {
          id: item.id,
          type: item.type,
          props: toJS(item.props || {}),
          styles: toJS(
            (item as { styles?: Record<string, unknown> }).styles || {},
          ),
        };
      });

    return JSON.stringify(serializableComponents, null, 2);
  }, [getComponentById, store.sortableCompConfig, store.compConfigs]);

  const generatedCode = useMemo(() => {
    if (pageStore.codeFramework === "vue") {
      return `<script setup lang="ts">
import LowCodeRenderer from "./LowCodeRenderer.vue";
const pageSchema = ${schemaText};
</script>

<template>
  <div class="codigo-page" style="height: 100%; min-height: 100vh; position: relative;">
    <LowCodeRenderer
      v-for="component in pageSchema"
      :key="component.id"
      :component="component"
    />
  </div>
</template>
`;
    }

    return `import React from "react";
import { LowCodeRenderer } from "./LowCodeRenderer";

const pageSchema = ${schemaText};

export default function Page() {
  return (
    <div className="codigo-page" style={{ height: '100%', minHeight: '100vh', position: 'relative' }}>
      {pageSchema.map((component) => (
        <LowCodeRenderer key={component.id} component={component} />
      ))}
    </div>
  );
}
`;
  }, [pageStore.codeFramework, schemaText]);

  const sandboxFiles: Record<string, string> = useMemo(() => {
    if (pageStore.codeFramework === "react") {
      return {
        "/App.js": generatedCode,
        "/LowCodeRenderer.js": `
export function LowCodeRenderer({ component }) {
  const { type, props, styles } = component;
  
  return (
    <div style={{ ...styles, border: '1px dashed #ccc', padding: '8px', margin: '4px', borderRadius: '4px', position: styles?.position || 'relative', left: styles?.left, top: styles?.top }}>
      <div style={{ fontSize: '14px', marginBottom: '4px', color: '#10b981' }}><strong>{type}</strong></div>
      <div style={{ fontSize: '12px', color: '#666', background: '#f8fafc', padding: '4px', borderRadius: '4px' }}>
        {JSON.stringify(props)}
      </div>
    </div>
  );
}
        `,
      };
    }

    if (pageStore.codeFramework === "vue") {
      return {
        "/src/App.vue": generatedCode,
        "/src/LowCodeRenderer.vue": `
<script setup>
defineProps({ component: Object })
</script>
<template>
  <div :style="[component.styles, { border: '1px dashed #ccc', padding: '8px', margin: '4px', borderRadius: '4px', position: component.styles?.position || 'relative', left: component.styles?.left, top: component.styles?.top }]">
    <div style="font-size: 14px; margin-bottom: 4px; color: #10b981"><strong>{{ component.type }}</strong></div>
    <div style="font-size: 12px; color: #666; background: #f8fafc; padding: 4px; border-radius: 4px;">
      {{ JSON.stringify(component.props) }}
    </div>
  </div>
</template>
        `,
      };
    }
    return {};
  }, [generatedCode, pageStore.codeFramework]);

  const [localCode, setLocalCode] = useState("");

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
  };

  useEffect(() => {
    if (!localCode) return;

    // Check if it's the same as generated, to avoid infinite loops
    if (localCode === generatedCode) return;

    const timer = window.setTimeout(() => {
      try {
        const schemaSource = extractSchemaText(localCode);
        const parsedValue = JSON.parse(schemaSource);
        if (Array.isArray(parsedValue)) {
          // Sync back to visual canvas store
          replaceByCode(parsedValue);
          message.success("画布已同步更新", 1);
        }
      } catch (e) {
        // Ignore errors while typing, only valid JSON schemas will be synced
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [localCode, generatedCode, replaceByCode]);

  return (
    <div className="w-full h-full bg-white flex flex-col relative group">
      <div className="absolute top-2 right-4 z-50 flex items-center gap-2">
        <span className="text-xs text-slate-500 bg-white/80 px-2 py-1 rounded shadow-sm">
          💡 修改代码后，停顿1秒自动同步到可视化画布
        </span>
      </div>
      <SandpackProvider
        template={pageStore.codeFramework === "vue" ? "vue" : "react"}
        files={sandboxFiles}
        theme="auto"
        customSetup={{
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
        }}
      >
        <SandpackLayout style={{ flex: 1, height: "100%", minHeight: "100%" }}>
          <SandpackCodeEditor
            showLineNumbers
            wrapContent
            style={{ height: "100%", flex: 1 }}
          />
          <SandpackPreview
            style={{ height: "100%", flex: 1 }}
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
          />
        </SandpackLayout>
        <CodeSyncListener onCodeChange={handleCodeChange} />
      </SandpackProvider>
    </div>
  );
});
