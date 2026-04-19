import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export const GEO_MAP_PICK_EVENT = "codigo:geo-map-pick";

export const geoMapRegionOptions = [
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "africa", label: "Africa" },
  { value: "asia", label: "Asia" },
  { value: "oceania", label: "Oceania" },
] as const;

export type GeoMapRegionKey = (typeof geoMapRegionOptions)[number]["value"];

export interface IGeoMapMarker {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  value?: string;
  color?: string;
  size?: number;
}

export interface IGeoMapHighlightRegion {
  id: string;
  regionKey: GeoMapRegionKey;
  label: string;
  value?: string;
  color?: string;
}

export interface IGeoMapComponentProps {
  title: string;
  subtitle: string;
  interactionHint: string;
  backgroundColor: string;
  oceanColor: string;
  defaultRegionColor: string;
  regionBorderColor: string;
  markerColor: string;
  showLabels: boolean;
  showLegend: boolean;
  optionText: string;
  markers: IGeoMapMarker[];
  highlightRegions: IGeoMapHighlightRegion[];
}

export type TGeoMapComponentConfig = TBasicComponentConfig<
  "geoMap",
  IGeoMapComponentProps
>;

export type TGeoMapComponentConfigResult =
  TransformedComponentConfig<IGeoMapComponentProps>;

const defaultMarkers: IGeoMapMarker[] = [
  {
    id: "geo-map-marker-1",
    name: "New York",
    longitude: -74.006,
    latitude: 40.7128,
    value: "$12.4k",
    color: "#2356d8",
    size: 16,
  },
  {
    id: "geo-map-marker-2",
    name: "Berlin",
    longitude: 13.405,
    latitude: 52.52,
    value: "$8.2k",
    color: "#4f46e5",
    size: 15,
  },
  {
    id: "geo-map-marker-3",
    name: "Singapore",
    longitude: 103.8198,
    latitude: 1.3521,
    value: "$6.7k",
    color: "#16a34a",
    size: 14,
  },
];

const defaultHighlightRegions: IGeoMapHighlightRegion[] = [
  {
    id: "geo-map-region-1",
    regionKey: "north-america",
    label: "North America",
    value: "$42.6k",
    color: "#cfe1ff",
  },
  {
    id: "geo-map-region-2",
    regionKey: "europe",
    label: "Europe",
    value: "$28.1k",
    color: "#dfe6ff",
  },
  {
    id: "geo-map-region-3",
    regionKey: "asia",
    label: "Asia",
    value: "$31.8k",
    color: "#d8f2e3",
  },
];

export const geoMapComponentDefaultConfig: TGeoMapComponentConfigResult = {
  title: {
    value: "Revenue by location",
    defaultValue: "Revenue by location",
    isHidden: false,
  },
  subtitle: {
    value: "Track highlighted regions and drop pins to inspect market focus.",
    defaultValue:
      "Track highlighted regions and drop pins to inspect market focus.",
    isHidden: false,
  },
  interactionHint: {
    value: "Tip: pick a marker and click the map to capture coordinates.",
    defaultValue: "Tip: pick a marker and click the map to capture coordinates.",
    isHidden: false,
  },
  backgroundColor: {
    value: "#ffffff",
    defaultValue: "#ffffff",
    isHidden: false,
  },
  oceanColor: {
    value: "#f4f7fb",
    defaultValue: "#f4f7fb",
    isHidden: false,
  },
  defaultRegionColor: {
    value: "#dbeafe",
    defaultValue: "#dbeafe",
    isHidden: false,
  },
  regionBorderColor: {
    value: "#9ab8f5",
    defaultValue: "#9ab8f5",
    isHidden: false,
  },
  markerColor: {
    value: "#2356d8",
    defaultValue: "#2356d8",
    isHidden: false,
  },
  showLabels: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  showLegend: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  optionText: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  markers: {
    value: defaultMarkers,
    defaultValue: defaultMarkers,
    isHidden: false,
  },
  highlightRegions: {
    value: defaultHighlightRegions,
    defaultValue: defaultHighlightRegions,
    isHidden: false,
  },
};
