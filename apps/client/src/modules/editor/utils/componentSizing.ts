export function resolveMinSizeByType(type: string | undefined | null) {
  switch (type) {
    case "avatar":
      return { minWidth: 24, minHeight: 24 };
    case "button":
      return { minWidth: 60, minHeight: 28 };
    case "geoMap":
      return { minWidth: 240, minHeight: 180 };
    default:
      return { minWidth: 80, minHeight: 40 };
  }
}
