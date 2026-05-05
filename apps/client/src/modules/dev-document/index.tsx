import { useTitle } from "ahooks";
import Center from "./components/center";
import { TopNavLayout } from "@/app/layouts/top-nav-layout";
import { ProjectPlazaBackground } from "@/modules/home/components/background/project-plaza-background";

export default function DevDoc() {
  useTitle("Codigo - 使用手册");

  return (
    <TopNavLayout>
      <div className="relative h-full bg-[var(--ide-bg)] text-[var(--ide-text)]">
        <ProjectPlazaBackground />
        <div className="relative h-full">
          <Center variant="page" />
        </div>
      </div>
    </TopNavLayout>
  );
}



