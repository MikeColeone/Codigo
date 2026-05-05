import { Suspense, lazy } from "react";
import { Spin } from "antd";
import { useSearchParams } from "react-router-dom";
import { ParticleBackground } from "../background/particle-background";
import { ProjectPlazaBackground } from "../background/project-plaza-background";
import { HomeFeatureGrid } from "../sections/home-feature-grid";
import { HomeHeroSection } from "../sections/home-hero-section";
import { HomeFooter } from "./home-footer";
import { HomeHeader } from "./home-header";

const HomeTemplatePlaza = lazy(() =>
  import("../sections/home-template-plaza").then((module) => ({
    default: module.HomeTemplatePlaza,
  })),
);
const HomeMaterialsPlaza = lazy(() =>
  import("../sections/home-materials-plaza").then((module) => ({
    default: module.HomeMaterialsPlaza,
  })),
);
const HomeDevDocSection = lazy(() =>
  import("../sections/home-dev-doc-section").then((module) => ({
    default: module.HomeDevDocSection,
  })),
);

/** 首页异步分区的统一加载态。 */
function HomeSectionFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
      <Spin size="large" />
    </div>
  );
}

/** 组合首页布局与营销区块。 */
export function HomePage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") ?? "home";
  const isProjectPlazaView =
    view === "templates" || view === "materials" || view === "doc";

  return (
    <div className="relative min-h-full bg-[var(--ide-bg)] text-[var(--ide-text)]">
      <HomeHeader />
      {view === "home" ? (
        <>
          <ParticleBackground />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,108,189,0.06),transparent_45%)]" />
        </>
      ) : null}
      {isProjectPlazaView ? <ProjectPlazaBackground /> : null}
      <main className="relative z-10 pt-[var(--header-height)]">
        <Suspense fallback={<HomeSectionFallback />}>
          {view === "templates" ? (
            <HomeTemplatePlaza />
          ) : view === "materials" ? (
            <HomeMaterialsPlaza />
          ) : view === "doc" ? (
            <HomeDevDocSection />
          ) : (
            <>
              <HomeHeroSection />
              <HomeFeatureGrid />
            </>
          )}
        </Suspense>
      </main>
      {view === "home" ? <HomeFooter /> : null}
    </div>
  );
}
