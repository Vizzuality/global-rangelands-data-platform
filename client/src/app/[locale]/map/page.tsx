import Datasets from "@/containers/datasets";
import Map from "@/containers/map";
import Sidebar from "@/containers/sidebar";

export default async function Home() {
  return (
    // The map is a client component, so it needs to be wrapped in the NextIntlClientProvider to provide the translations
    <div className="flex">
      <Sidebar>
        <Datasets />
      </Sidebar>
      <Map />
    </div>
  );
}
