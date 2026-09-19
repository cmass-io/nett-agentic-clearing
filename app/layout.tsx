import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Activity, ChartNoAxesCombined, Network } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "NETT — Agentic Clearing Network", template: "%s | NETT" },
  description: "A deterministic multi-agent clearing simulation for global payment obligations.",
};

export const viewport: Viewport = { themeColor: "#07100d", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <div className="app-shell">
          <header className="topbar">
            <Link className="brand" href="/" aria-label="NETT dashboard">
              <span className="brand-mark">N</span>
              <span><strong>NETT</strong><small>Agentic Clearing Network</small></span>
            </Link>
            <nav className="nav-links" aria-label="Primary navigation">
              <Link href="/"><Activity size={15} /> Network</Link>
              <Link href="/agents"><Network size={15} /> Agents</Link>
              <Link href="/analysis"><ChartNoAxesCombined size={15} /> Analysis</Link>
            </nav>
            <div className="network-status"><i /> NETWORK: SIMULATION <span>ONLINE</span></div>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <span>NETT // SIMULATED DATA ONLY</span>
            <span>Hackathon prototype — no custody, transmission, or settlement of real funds.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
