import { Button } from "@/components/ui/button";
import Video from "@/components/ui/video";
import Collaborators from "./collaborator";
import HomeCard from "./card";
import { useContent } from "./content";
import Image from "next/image";
import { Link } from "@/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

import MapImage from "@/assets/images/map.png";

const introVideo = "https://storage.googleapis.com/rdp-landing-bucket/rangelands-intro.mp4";
const exploreVideo = "https://storage.googleapis.com/rdp-landing-bucket/rangelands-explore.mp4";

const Home = () => {
  const c = useContent();

  return (
    <div className="space-y-[100px] pt-8">
      <div>
        <div className="mx-auto flex min-h-[80vh] flex-col justify-end lg:flex-row lg:gap-28">
          <div className="flex-1 shrink-0">
            <div className="w-full lg:absolute">
              <div className="container mx-auto flex">
                <div className="mb-11 mt-24 space-y-9 lg:flex-[0.5]">
                  <h1 className="text-5xl font-bold leading-none tracking-[-0.8px] xl:text-[80px]">
                    {c.title}
                  </h1>
                  <p className="text-pretty text-xl leading-relaxed 2xl:text-[22px]">
                    {c.subtitle}
                  </p>
                  <div className="space-x-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">{c.buttons.more}</Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[70vh] max-w-[50vw] overflow-y-auto 2xl:max-w-[40vw]">
                        <DialogHeader className="text-2xl font-bold">{c.info.title}</DialogHeader>
                        {c.info.content.map((content) => (
                          <p key={content} className="text-sm leading-relaxed">
                            {content}
                          </p>
                        ))}
                      </DialogContent>
                    </Dialog>
                    <Button>
                      <Link href="/map">{c.buttons.map}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-end">
            <div className="3xl:max-h-[55vh] max-h-[75vh] overflow-hidden lg:w-[45vw] lg:rounded-l-[30px]">
              <Video
                src={introVideo}
                width={584}
                height={660}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto space-y-[100px]">
        <div>
          <Collaborators />
        </div>
        <div>
          <div className="flex">
            <p className="flex-[0.5] text-pretty text-[22px] leading-relaxed lg:pr-28">
              {c.platform}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-16">
          {c.cards.map((card) => {
            return (
              <HomeCard
                icon={card.icon}
                description={card.description}
                image={card.image}
                title={card.title}
                key={card.title}
              />
            );
          })}
        </div>
      </div>
      <div>
        <div className="min-h-[33vw]s h-[500px]">
          <Video
            src={exploreVideo}
            width={1300}
            height={500}
            className="h-full w-screen object-cover"
          />
        </div>
        <div className="bg-global">
          <div className="mx-auto flex justify-end gap-28 pb-12">
            <div className="flex flex-1 shrink-0 items-center pb-24 pt-12">
              <div className="absolute w-full">
                <div className="container mx-auto flex">
                  <div className="flex-[0.5] space-y-5">
                    <p className="max-w-[500px] text-pretty text-[22px] leading-relaxed text-white">
                      {c.explore.text}
                    </p>
                    <Button className="border-background" variant="outline">
                      <Link href="/map">{c.explore.button}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-1 justify-end">
              <div className="h-[412px] min-h-[30vw] w-[45vw] -translate-y-10 overflow-hidden rounded-l-[10px]">
                <Image
                  src={MapImage}
                  alt={c.explore.image}
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
