import { AboutVideo } from "./sections/about-video";
import { Hero } from "./sections/hero";
import { Livestock } from "./sections/livestock";
import { Resources } from "./sections/resources";
import { Stelarr } from "./sections/stelarr";
import { StoriesCards } from "./sections/stories-cards";
import { Threat } from "./sections/threat";

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Stelarr />
      <Livestock />
      <StoriesCards />
      <AboutVideo />
      <Resources />
      <Threat />
    </div>
  );
};
export default Home;
