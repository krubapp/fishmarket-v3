"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import type { BottomNavItemId } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { RootTopBar } from "@/components/RootTopBar";
import { SearchBar } from "@/components/SearchBar";
import type { SearchBarResult } from "@/components/SearchBar";

const SAMPLE_SEARCH_RESULTS: SearchBarResult[] = [
  { id: "1", title: "Slayer 10 pack 3 Inch", sellerName: "LimeStoneSoft..." },
  { id: "2", title: "Barracuda 3.8\" Sunset Orange", sellerName: "LimeStoneSoft..." },
  { id: "3", title: "Hammer Craw 4\" Watermelon Red", sellerName: "LimeStoneSoft..." },
  { id: "4", title: "Rattlesnake 5\" Midnight Black", sellerName: "LimeStoneSoft..." },
  { id: "5", title: "Cobra Tube 6\" Emerald Green", sellerName: "LimeStoneSoft..." },
];

export default function Home() {
  const [activeItem, setActiveItem] = useState<BottomNavItemId>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(
    () => (searchQuery.trim() ? SAMPLE_SEARCH_RESULTS : []),
    [searchQuery]
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col self-center bg-white dark:bg-black">
        <RootTopBar
          title="TheLifeoftoy"
          avatarSrc={null}
          onAddProduct={() => {}}
          onFeed={() => {}}
          onSearch={() => {}}
        />
        <ContextTopBar
          backLabel="Section"
          title="Perch"
          onBack={() => {}}
          onFilter={() => {}}
          onSearch={() => {}}
        />
        <SearchBar
          value={searchQuery}
          placeholder="Search"
          onValueChange={setSearchQuery}
          onCancel={() => setSearchQuery("")}
          results={searchResults}
          onResultSelect={(r) => setSearchQuery(r.title)}
        />
      </div>
      <main className="flex min-h-0 flex-1 w-full max-w-3xl flex-col items-center justify-between self-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
      <div className="flex w-full max-w-3xl flex-col self-center bg-white dark:bg-black">
        <BottomNav
          activeItem={activeItem}
          onItemChange={setActiveItem}
        />
      </div>
    </div>
  );
}
