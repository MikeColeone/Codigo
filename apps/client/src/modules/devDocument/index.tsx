import { useTitle } from "ahooks";
import Center from "./components/Center";
import { TopNavLayout } from "@/app/layouts/TopNavLayout";

export default function DevDoc() {
  useTitle("Codigo - 开发文档");

  return (
    <TopNavLayout>
      <div className="h-full overflow-y-auto">
        <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10">
          <Center />
        </section>
      </div>
    </TopNavLayout>
  );
}







