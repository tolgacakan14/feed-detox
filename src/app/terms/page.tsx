import type { Metadata } from "next";
import { LegalPage } from "@/components/feedfix/LegalPage";

export const metadata: Metadata = {
  title: "Terms — Feed Detox",
  description: "Terms of use for Feed Detox — an independent, unaffiliated recommendation-training tool.",
};

const UPDATED_EN = "Last updated: reflects the current codebase as of this deployment.";
const UPDATED_TR = "Son güncelleme: bu deployment’taki mevcut codebase’i yansıtır.";

export default function TermsPage() {
  return (
    <LegalPage
      titleEn="Terms of Use"
      titleTr="Kullanım Koşulları"
      updatedEn={UPDATED_EN}
      updatedTr={UPDATED_TR}
      tr={
          <>
            <section>
              <h2>Ürün nedir</h2>
              <p>
                Feed Detox, girdiğin bir topic için X/Twitter, Instagram, TikTok ve YouTube üzerinde direct
                creator, content ve community link’leri öneren bir keşif aracıdır. Amaç, bu platformlardaki
                kendi recommendation algorithm’ini eğitmene yardımcı olmaktır — biz hesabına bağlanmayız,
                erişmeyiz veya onu değiştirmeyiz.
              </p>
            </section>
            <section>
              <h2>Bağımsız ürün</h2>
              <p>
                Feed Detox bağımsız bir üründür ve X, Instagram, TikTok, YouTube veya bu şirketlerin ana
                şirketleriyle affiliate, sponsored veya endorsed değildir. Her link, gerçek platformu kendi
                browser’ında, kendi hesabınla açar.
              </p>
            </section>
            <section>
              <h2>Sonuçlar hakkında</h2>
              <p>
                Önerilen link’ler live search provider’lardan (configure edilmişse) ve curated data’dan
                gelir. Bir sonucun her zaman erişilebilir, güncel veya belirttiğimiz gibi kalacağını garanti
                etmeyiz — third-party platform’lar içeriği kaldırabilir veya değiştirebilir. Bir link
                bozuksa bunu bize bildirebilirsin.
              </p>
            </section>
            <section>
              <h2>Kabul edilebilir kullanım</h2>
              <ul>
                <li>Servisi otomatik olarak scrape etmek veya kötüye kullanmak için kullanma.</li>
                <li>Servisi yasa dışı, zararlı veya taciz edici içerik bulmak için kullanma.</li>
                <li>Search provider’ların (Tavily, YouTube Data API) kendi kullanım koşullarına uy.</li>
              </ul>
            </section>
            <section>
              <h2>Garanti yok</h2>
              <p>
                Feed Detox “olduğu gibi” sağlanır, herhangi bir garanti olmadan. Bu bir beta/erken aşama
                üründür.
              </p>
            </section>
            <section>
              <h2>İletişim</h2>
              <p>
                Sorular için projenin{" "}
                <a
                  href="https://github.com/tolgacakan14/feed-detox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-tealbrand underline dark:text-limepunch"
                >
                  GitHub repository’sini
                </a>{" "}
                kullanabilirsin.
              </p>
            </section>
          </>
      }
      en={
          <>
            <section>
              <h2>What this product is</h2>
              <p>
                Feed Detox is a discovery tool that recommends direct creators, content, and communities on
                X/Twitter, Instagram, TikTok, and YouTube for a topic you type. It exists to help you train
                your own recommendation algorithm on those platforms — we never connect to, access, or
                modify your account.
              </p>
            </section>
            <section>
              <h2>Independent product</h2>
              <p>
                Feed Detox is an independent product and is not affiliated with, sponsored by, or endorsed
                by X, Instagram, TikTok, YouTube, or their parent companies. Every link opens the real
                platform in your own browser, under your own account.
              </p>
            </section>
            <section>
              <h2>About the results</h2>
              <p>
                Recommended links come from live search providers (when configured) and curated data. We do
                not guarantee that a result will always be reachable, current, or stay as described —
                third-party platforms can remove or change content. If a link is broken, you can report it
                to us.
              </p>
            </section>
            <section>
              <h2>Acceptable use</h2>
              <ul>
                <li>Don&apos;t use the service to scrape or automate abuse of it.</li>
                <li>Don&apos;t use it to find illegal, harmful, or harassing content.</li>
                <li>Respect the terms of the underlying search providers (Tavily, YouTube Data API).</li>
              </ul>
            </section>
            <section>
              <h2>No warranty</h2>
              <p>Feed Detox is provided &quot;as is&quot;, without warranty of any kind. This is a beta/early-stage product.</p>
            </section>
            <section>
              <h2>Contact</h2>
              <p>
                For questions, use the project&apos;s{" "}
                <a
                  href="https://github.com/tolgacakan14/feed-detox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-tealbrand underline dark:text-limepunch"
                >
                  GitHub repository
                </a>
                .
              </p>
            </section>
          </>
      }
    />
  );
}
