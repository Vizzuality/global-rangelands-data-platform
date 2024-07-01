type VideoProps = Partial<HTMLVideoElement>;

const Video = ({ className, width, height, src }: VideoProps) => {
  return (
    <video autoPlay muted loop className={className} width={width} height={height} preload="none">
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default Video;
