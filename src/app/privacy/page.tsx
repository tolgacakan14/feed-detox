import type { Metadata } from "next";
import { LegalPage } from "@/components/feedfix/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — Feed Detox",
  description: "How Feed Detox handles the topics you type, search-provider calls, and local storage.",
};

const UPDATED_EN = "Last updated: reflects the current codebase as of this deployment.";
const UPDATED_TR = "Son güncelleme: bu deployment’taki mevcut codebase’i yansıtır.";

export default function PrivacyPage() {
  return (
    <LegalPage
      titleEn="Privacy"
      titleTr="Gizlilik"
      updatedEn={UPDATED_EN}
      updatedTr={UPDATED_TR}
      tr={
          <>
            <p>
              Bu sayfa, Feed Detox’un şu anki kod tabanının gerçekten ne yaptığını anlatır — pazarlama dili
              değil, doğrulanabilir davranış. Feed Detox’un henüz kullanıcı hesabı, authentication veya
              payment sistemi yok.
            </p>
            <section>
              <h2>Yazdığın topic ne oluyor?</h2>
              <p>
                Bir Feed Pack oluşturduğunda, yazdığın topic/prompt server’a (bir Next.js API route’una)
                gönderilir. Server bu metni kullanarak, operatör bu third-party service’leri configure
                etmişse, arama sorgusu olarak <strong>Tavily</strong> (web search) ve/veya{" "}
                <strong>YouTube Data API</strong>’ye (Google) iletir. API key configure edilmemişse, hiçbir
                query hiçbir third-party’ye gitmez — pack sadece curated/demo data ile oluşturulur.
              </p>
              <p>
                Topic’in şu anda kalıcı bir database’de saklanmıyor. Ancak sonuç sayfasının URL’i
                (<code>/results?data=…</code>) prompt’unu ve seçimlerini base64 + URL-encoded formatta
                taşır — bu <strong>encryption değil</strong>, tersine çevrilebilir bir encoding’dir. Bu
                link’i paylaşırsan, alan kişi topic’ini decode edip okuyabilir. Bu link’ler ayrıca hosting
                provider’ımızın (Vercel) standart request log’larında görünebilir.
              </p>
            </section>
            <section>
              <h2>Analytics</h2>
              <p>
                Şu anda hiçbir third-party analytics SDK’si entegre değil. “generate_pack”, “sample_pack_opened”
                gibi event’ler sadece kendi browser’ının console’una <code>console.log</code> ile yazılır —
                hiçbir server’a veya third-party’ye gönderilmez.
              </p>
            </section>
            <section>
              <h2>Early Access email formu</h2>
              <p>
                Footer’daki email formu şu anda girdiğin email’i sadece kendi browser sekmenin memory’sinde
                tutar — bir server’a gönderilmez ve sayfayı yenilediğinde kaybolur. Kalıcı bir signup
                database’i henüz bağlı değil.
              </p>
            </section>
            <section>
              <h2>Local storage</h2>
              <p>
                Browser’ında sadece <strong>tek bir</strong> localStorage key’i tutulur:{" "}
                <code>feeddetox.lang</code> — dil tercihini (English/Türkçe) hatırlamak için. Başka hiçbir
                cookie veya localStorage kullanılmıyor.
              </p>
            </section>
            <section>
              <h2>Hosting</h2>
              <p>
                Bu ürün Vercel üzerinde host ediliyor. Vercel, her request için standart HTTP metadata’sını
                (IP address, user agent, timestamp) kendi operasyonel log’larının bir parçası olarak işler —
                bu, Vercel gibi herhangi bir hosting provider için normaldir. Retention süresi hakkında
                spesifik bir iddiada bulunmuyoruz; Vercel’in kendi policy’lerine bakabilirsin.
              </p>
            </section>
            <section>
              <h2>Trademark açıklaması</h2>
              <p>
                Feed Detox bağımsız bir üründür ve X, Instagram, TikTok, YouTube veya bu şirketlerin ana
                şirketleriyle herhangi bir şekilde affiliate değildir. Platform isimleri sadece hangi
                platformdan bahsettiğimizi açıklamak için kullanılır.
              </p>
            </section>
            <section>
              <h2>İletişim</h2>
              <p>
                Şu anda dedicated bir support email’i configure edilmedi. Sorular veya sorunlar için
                projenin{" "}
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
            <p>
              This page describes what Feed Detox&apos;s current codebase actually does — not marketing
              language, verifiable behavior. Feed Detox has no user accounts, authentication, or payment
              system today.
            </p>
            <section>
              <h2>What happens to the topic you type?</h2>
              <p>
                When you generate a Feed Pack, the topic/prompt you type is sent to our server (a Next.js
                API route). The server uses that text to form search queries sent to{" "}
                <strong>Tavily</strong> (web search) and/or the <strong>YouTube Data API</strong> (Google) —
                only if the site operator has configured those third-party API keys. If no key is
                configured, no query is sent to any third party and the pack is built from curated/demo
                data only.
              </p>
              <p>
                Your topic is not currently stored in a persistent database. However, the results page URL
                (<code>/results?data=…</code>) carries your prompt and selections base64 + URL-encoded —
                this is <strong>not encryption</strong>, it is reversible encoding. Anyone you share that
                link with can decode and read your topic. These links may also appear in our hosting
                provider&apos;s (Vercel) standard request logs.
              </p>
            </section>
            <section>
              <h2>Analytics</h2>
              <p>
                No third-party analytics SDK is currently integrated. Events like &quot;generate_pack&quot;
                and &quot;sample_pack_opened&quot; are only written to your own browser&apos;s console via{" "}
                <code>console.log</code> — nothing is sent to any server or third party.
              </p>
            </section>
            <section>
              <h2>Early Access email form</h2>
              <p>
                The email form in the footer currently holds the email you type only in your own browser
                tab&apos;s memory — it is not sent to a server, and is lost when you refresh the page. A
                persistent signup database is not yet connected.
              </p>
            </section>
            <section>
              <h2>Local storage</h2>
              <p>
                Your browser holds exactly <strong>one</strong> localStorage key: <code>feeddetox.lang</code>{" "}
                — to remember your language preference (English/Türkçe). No other cookies or localStorage
                are used.
              </p>
            </section>
            <section>
              <h2>Hosting</h2>
              <p>
                This product is hosted on Vercel. Vercel processes standard HTTP request metadata (IP
                address, user agent, timestamp) for every request as part of its normal operational
                logging — this is standard for any hosting provider. We make no specific claim about
                retention duration; see Vercel&apos;s own policies for that.
              </p>
            </section>
            <section>
              <h2>Trademark disclaimer</h2>
              <p>
                Feed Detox is an independent product and is not affiliated with X, Instagram, TikTok,
                YouTube, or their parent companies. Platform names are used only to describe which platform
                a result belongs to.
              </p>
            </section>
            <section>
              <h2>Contact</h2>
              <p>
                No dedicated support inbox is currently configured. For questions or issues, use the
                project&apos;s{" "}
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
