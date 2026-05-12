import { Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const manrope = Manrope({
  subsets: ['cyrillic', 'latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

/** `viewport-fit=cover` — коректні `safe-area-inset-*` у Safari / Telegram WebView */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const siteUrl = 'https://tactic.vercel.app';

/** Прев’ю в месенджерах / соцмережах — фото товару, не маркетинговий банер */
const ogProductImage = '/images/tactic-shadow-a/olive/1.jpeg';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Тактичне взуття | tactic',
  description: 'Тактичні кросівки з доставкою по Україні.',
  keywords: ['тактичні кросівки', 'tactic', 'взуття', 'кросівки'],
  openGraph: {
    title: 'tactic',
    description: 'Тактичні кросівки з доставкою по Україні.',
    url: siteUrl,
    siteName: 'tactic',
    images: [
      {
        url: ogProductImage,
        width: 1600,
        height: 1600,
        alt: 'Тактичні кросівки',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tactic',
    description: 'Тактичні кросівки з доставкою по Україні.',
    images: [ogProductImage],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        {/* TikTok Pixel у head — кореневий layout покриває всі маршрути */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
              ttq.setAndDefer = function (t, e) {
                t[e] = function () {
                  t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
              };
              for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
              ttq.instance = function (t) {
                for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                return e;
              };
              ttq.load = function (e, n) {
                var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
                    o = n && n.partner;
                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date;
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};
                n = d.createElement("script");
                n.type = "text/javascript";
                n.async = true;
                n.src = r + "?sdkid=" + e + "&lib=" + t;
                e = d.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(n, e);
              };
              ttq.load('D7GF7HJC77U8OVL7ELEG');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      </head>
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
