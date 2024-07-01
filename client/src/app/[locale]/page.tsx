import Footer from "@/containers/footer";
import HomeComponent from "@/containers/home";

export default function Home() {
  return (
    <main className="h-auto min-h-screen w-[100vsw] overflow-x-hidden">
      <HomeComponent />
      <Footer />
    </main>
  );
}
