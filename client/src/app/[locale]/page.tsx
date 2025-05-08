import Footer from "@/containers/footer";
import HomeComponent from "@/containers/home";
import Header from "@/containers/home/header";

export default function Home() {
  return (
    <main className="h-auto min-h-screen w-[100vsw] overflow-x-hidden">
      <Header />
      <HomeComponent />
      <Footer />
    </main>
  );
}
