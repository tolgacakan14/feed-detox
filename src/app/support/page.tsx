import type { Metadata } from "next";
import { LegalPage } from "@/components/feedfix/LegalPage";

export const metadata: Metadata = {
  title: "Support — Feed Detox",
  description: "Get help with Feed Detox, report a broken link, or ask a question.",
};

const UPDATED_EN = "Last updated: reflects the current codebase as of this deployment.";
const UPDATED_TR = "Son güncelleme: bu deployment’taki mevcut codebase’i yansıtır.";

export default function SupportPage() {
  return (
    <LegalPage
      titleEn="Support"
      titleTr="Destek"
      updatedEn={UPDATED_EN}
      updatedTr={UPDATED_TR}
      tr={
          <>
            <section>
              <h2>Bir link bozuk mu?</h2>
              <p>
                Feed Detox link’leri gösterip göstermeden önce doğrulamaya çalışır, ama third-party
                platform’lar içeriği bizim kontrolümüz dışında kaldırabilir. Bozuk bir link bulursan,
                lütfen aşağıdaki GitHub repository’sinde bir issue aç — topic, platform ve link’in kendisini
                ekle.
              </p>
            </section>
            <section>
              <h2>Bir soru mu var?</h2>
              <p>
                Şu anda dedicated bir support email’i veya live chat configure edilmedi. En hızlı yol,
                projenin{" "}
                <a
                  href="https://github.com/tolgacakan14/feed-detox/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-tealbrand underline dark:text-limepunch"
                >
                  GitHub issues
                </a>{" "}
                sayfasında bir issue açmak.
              </p>
            </section>
            <section>
              <h2>Beta ürün notu</h2>
              <p>
                Feed Detox aktif geliştirilen bir beta üründür. Bazı platformlarda (özellikle TikTok)
                direct link coverage’ı diğerlerinden daha sınırlı olabilir — bu durumda daha az sonuç
                gösteririz, boş slot’ları zayıf eşleşmelerle doldurmak yerine.
              </p>
            </section>
          </>
      }
      en={
          <>
            <section>
              <h2>Found a broken link?</h2>
              <p>
                Feed Detox tries to validate links before showing them, but third-party platforms can
                remove content outside our control. If you find a broken link, please open an issue on the
                GitHub repository below — include the topic, platform, and the link itself.
              </p>
            </section>
            <section>
              <h2>Have a question?</h2>
              <p>
                No dedicated support email or live chat is configured yet. The fastest way to reach us is
                to open an issue on the project&apos;s{" "}
                <a
                  href="https://github.com/tolgacakan14/feed-detox/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-tealbrand underline dark:text-limepunch"
                >
                  GitHub issues
                </a>{" "}
                page.
              </p>
            </section>
            <section>
              <h2>A note on beta coverage</h2>
              <p>
                Feed Detox is an actively developed beta product. Direct link coverage on some platforms
                (TikTok in particular) can be thinner than others — when that happens, we show fewer
                results rather than filling the gap with weak matches.
              </p>
            </section>
          </>
      }
    />
  );
}
