export type SSEEvent = {
  event: string;
  data: string;
};

export function parseSSEBlock(block: string): SSEEvent | null {
  const lines = block
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter(Boolean);

  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  const data = dataLines.join("\n");
  if (!data) return null;
  return { event, data };
}
