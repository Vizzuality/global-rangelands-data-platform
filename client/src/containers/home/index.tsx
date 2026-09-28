import { AboutVideo } from "./sections/about-video";
import { Hero } from "./sections/hero";
import { Livestock } from "./sections/livestock";
import { Resources } from "./sections/resources";
import { Stelarr } from "./sections/stelarr";
import { FeaturesCards } from "./sections/features-cards";
import { Threat } from "./sections/threat";

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Stelarr />
      <Livestock />
      <FeaturesCards />
      <AboutVideo />
      <Resources />
      <Threat />
    </div>
  );
};
export default Home;
