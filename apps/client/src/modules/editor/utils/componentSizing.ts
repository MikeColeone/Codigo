export function resolveMinSizeByType(type: string | undefined | null) {
  switch (type) {
    case "avatar":
      return { minWidth: 24, minHeight: 24 };
    case "button":
      return { minWidth: 60, minHeight: 28 };
    default:
      return { minWidth: 80, minHeight: 40 };
  }
}

