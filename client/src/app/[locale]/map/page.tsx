import Map from "@/containers/map";

export default async function Home() {
  return (
    // The map is a client component, so it needs to be wrapped in the NextIntlClientProvider to provide the translations
    <div className="h-[100svh] overflow-y-hidden">
      <Map />
    </div>
  );
}
