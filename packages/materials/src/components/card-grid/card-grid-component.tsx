import { Card, Col, Row, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type ICardGridComponentProps, cardGridComponentDefaultConfig } from ".";

const { Text, Title } = Typography;

interface CardGridRuntimeProps extends ICardGridComponentProps {
  runtimeHeight?: string | number;
}

/**
 * 按配置列数渲染统计卡片网格，适合展示多项摘要指标。
 */
export default function CardGridComponent(_props: CardGridRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(cardGridComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const span = props.columns === 2 ? 12 : props.columns === 3 ? 8 : 6;
  const hasRuntimeHeight =
    props.runtimeHeight !== undefined &&
    props.runtimeHeight !== null &&
    props.runtimeHeight !== "auto";
  const bodyPadding = hasRuntimeHeight ? 18 : 22;
  const contentGap = hasRuntimeHeight ? 8 : 10;
  const valueFontSize = hasRuntimeHeight ? 30 : 32;

  return (
    <div
      style={{
        height: hasRuntimeHeight ? "100%" : undefined,
        minHeight: hasRuntimeHeight ? 0 : undefined,
      }}
    >
      <Row
        gutter={[16, 16]}
        style={{
          height: hasRuntimeHeight ? "100%" : undefined,
          minHeight: hasRuntimeHeight ? 0 : undefined,
        }}
      >
        {props.items.map((item) => (
          <Col
            span={span}
            key={item.id}
            style={{
              display: hasRuntimeHeight ? "flex" : undefined,
              minHeight: hasRuntimeHeight ? 0 : undefined,
            }}
          >
            <Card
              style={{
                borderRadius: 24,
                borderColor: "#eef1f6",
                boxShadow: "0 22px 48px rgba(15, 23, 42, 0.06)",
                width: "100%",
                height: hasRuntimeHeight ? "100%" : undefined,
              }}
              styles={{
                body: {
                  padding: bodyPadding,
                  height: hasRuntimeHeight ? "100%" : undefined,
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: contentGap,
                  height: hasRuntimeHeight ? "100%" : undefined,
                  justifyContent: hasRuntimeHeight ? "space-between" : undefined,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
                  {item.title}
                </Text>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                  {item.subtitle}
                </Title>
                <div style={{ fontSize: valueFontSize, fontWeight: 700, lineHeight: 1.1 }}>
                  {item.value}
                </div>
                <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.3 }}>
                  {item.extra}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
