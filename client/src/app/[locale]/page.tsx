import { setRequestLocale } from "next-intl/server";

import Footer from "@/containers/footer";
import HomeComponent from "@/containers/home";
import Header from "@/containers/home/header";

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <main className="h-auto min-h-screen w-[100vsw] overflow-x-hidden">
      <Header />
      <HomeComponent />
      <Footer />
    </main>
  );
}
