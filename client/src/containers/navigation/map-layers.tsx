import { sidebarOpenAtom, useSyncLayers } from "@/store/map";
import { useAtom } from "jotai";

const MapLayers = () => {
  const [layers] = useSyncLayers();
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <button
      className="group flex items-center gap-2 rounded-[20px] border-2 border-orange-100/0 px-2.5 py-1.5 pl-4 text-sm transition-colors duration-300 hover:border-background hover:bg-background focus-visible:border-2 focus-visible:border-orange-100 focus-visible:bg-background focus-visible:outline-0 data-[state=open]:rounded-b-none data-[state=open]:bg-background"
      onClick={() => {
        setSidebarOpen(!sidebarOpen);
      }}
    >
      Map layers
      <div className="relative flex h-[26px] w-[26px] items-center justify-center">
        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground">
          {layers.length}
        </div>
      </div>
    </button>
  );
};

export default MapLayers;
