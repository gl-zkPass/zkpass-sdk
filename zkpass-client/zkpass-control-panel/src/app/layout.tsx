/*
 * layout.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutComponent from "@components/rootLayout.component";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "zkPass CP",
  description: "zkPass Control Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <main className='dark text-foreground bg-background'>
          <RootLayoutComponent>
            <div className='h-fit flex flex-col justify-center items-center py-8 min-h-screen overscroll-contain'>
              {children}
            </div>
          </RootLayoutComponent>
        </main>
      </body>
    </html>
  );
}
