import { useTranslations } from "@/i18n";

export default function Home() {
  const t = useTranslations();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>{t("Rangelands Data Platform")}</div>
      <div>{t("Exploring Rangelands")}</div>
      <div>{t("Test string")}</div>
    </main>
  );
}
