import type { Metadata } from "next";
import "./globals.css";

const siteOrigin = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Transight 온체인 추적 실습 기초",
  description: "하나의 주소에서 발생한 세 가지 사건을 추적하며 CEX, DeFi, Bridge를 구분하는 초급 온체인 실습",
  other: { "codex-preview": "development" },
  openGraph: {
    title: "Transight 온체인 추적 실습 기초",
    description: "주소 하나로 배우는 CEX · Bridge · DeFi 추적",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Transight 온체인 추적 실습 기초" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transight 온체인 추적 실습 기초",
    description: "주소 하나로 배우는 CEX · Bridge · DeFi 추적",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
