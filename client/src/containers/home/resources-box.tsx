import Image from "next/image";

type ResourcesBoxProps = {
  title: string;
  content: string;
};

const ResourcesBox = ({ title, content }: ResourcesBoxProps) => {
  return (
    <div className="relative mx-auto aspect-square h-full max-w-[340px] bg-green-light text-white">
      <Image
        width={340}
        height={340}
        src="/images/home/resources-box-border.svg"
        alt=""
        className="absolute h-full w-full object-center"
      />
      <div className="space-y-4 p-10">
        <h3 className="font-serif text-[32px] leading-[36px]">{title}</h3>
        <p className="text-base leading-6">{content}.</p>
      </div>
    </div>
  );
};

export default ResourcesBox;
