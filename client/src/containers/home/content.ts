import { useTranslations } from "@/i18n";
import DataImage from "@/assets/images/platform/data.png";
import CommunityImage from "@/assets/images/platform/community.png";
import CollaborationImage from "@/assets/images/platform/collaboration.png";

export const useContent = () => {
  const t = useTranslations();

  const title = t("Exploring Rangelands.");
  const subtitle = t(
    "Covering 54% of the Earth's surface and supporting extensive livestock systems, rangelands are crucial yet face threats from agriculture, mining, and urban expansion. It's essential to protect, manage, and restore these areas to preserve their ecological and cultural roles for future generations.",
  );

  const buttons = {
    more: t("Know more"),
    map: t("Go to map"),
  };

  const info = {
    title: t("About Rangelands"),
    content: [
      t(
        "Rangelands extend across 54% of global terrestrial surface and can include grasslands, deserts, tundra, forests, savannas, shrublands, wetlands, mountains and – often most importantly – water sources. Rangelands are defined by land use and management, the environment and cultural identity. Rangelands are intricately linked to the extensive livestock production systems that they support and have been formed by.",
      ),
      t(
        "Rangelands are home to millions of pastoralists and other livestock keepers worldwide, often shared with hunter-gatherers, fishers, and crop farmers, as well as to a rich diversity of plant and wildlife. Characteristically rangeland users have an innate and spiritual relationship to their lands and resources that defines who they are and what they do.",
      ),
      t(
        "However, rangelands and the people who depend upon them are under threat. Many rangelands have been lost to large-scale crop farming, mineral extraction, infrastructure development and urban expansion. As rangelands shrink in size and the demand for meat, milk, leather, and animal fibre products continues to grow, there is increasing land use pressure on those fragments that remain. Therefore, it is critical that we protect rangelands, improve governance and management where needed, and restore those that have been degraded.",
      ),
      t(
        "This rangelands data platform is a gateway to and repository of data on rangelands worldwide. By gathering, sharing, and generating data we, together, can enable more informed decision-making about rangelands, their use, management, protection, and restoration. Join us in this endeavour to sustain rangelands and the significant ecosystem services that they provide for future generations.",
      ),
    ],
  };

  const platform = t(
    "Our platform offers unique resources to support the preservation and sustainable management of rangelands worldwide.",
  );

  const cards = [
    {
      title: t("Comprehensive data"),
      description: t(
        "Access centralized rangeland data from a single repository, enabling you to find extensive information on various ecosystems with ease. Leverage this accessible data for your research, policy-making, and conservation efforts, ensuring that your decisions are always evidence-based and well-informed.",
      ),
      image: DataImage,
      icon: "cloud",
    },
    {
      title: t("Community resilience"),
      description: t(
        "Adopt sustainable land use practices by utilizing the data provided, which helps you maintain traditional livelihoods and cultural identities. Enhance your community's resilience by adapting to environmental challenges using targeted, actionable data.",
      ),
      image: CommunityImage,
      icon: "group",
    },
    {
      title: t("Global collaboration"),
      description: t(
        "Engage in a shared space to collaborate with international stakeholders, allowing you to strengthen your rangeland conservation initiatives through the exchange of knowledge and data. Contribute to global efforts, such as the UN Decade of Ecosystem Restoration, by coordinating your actions and leveraging shared information.",
      ),
      image: CollaborationImage,
      icon: "globe",
    },
  ];

  const explore = {
    button: t("Explore datasets"),
    text: t(
      "Explore the interactive map now and be part of the movement to protect and restore these critical ecosystems.",
    ),
    image: t("Rangelands datasets"),
  };

  return { title, subtitle, platform, cards, buttons, explore, info };
};
