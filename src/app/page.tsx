"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import type { BottomNavItemId } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { RootTopBar } from "@/components/RootTopBar";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { ColorBlock } from "@/components/ColorBlock";
import { ImageBlock } from "@/components/ImageBlock";
import { MediaDropzone } from "@/components/MediaDropzone";
import { SearchBar } from "@/components/SearchBar";
import { Tabs, TabsBox } from "@/components/Tabs";
import type { TabItem, TabsBoxItem } from "@/components/Tabs";
import type { SearchBarResult } from "@/components/SearchBar";

const SAMPLE_SEARCH_RESULTS: SearchBarResult[] = [
  { id: "1", title: "Slayer 10 pack 3 Inch", sellerName: "LimeStoneSoft..." },
  { id: "2", title: "Barracuda 3.8\" Sunset Orange", sellerName: "LimeStoneSoft..." },
  { id: "3", title: "Hammer Craw 4\" Watermelon Red", sellerName: "LimeStoneSoft..." },
  { id: "4", title: "Rattlesnake 5\" Midnight Black", sellerName: "LimeStoneSoft..." },
  { id: "5", title: "Cobra Tube 6\" Emerald Green", sellerName: "LimeStoneSoft..." },
];

const SAMPLE_TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "lures", label: "Lures", icon: "account_circle" },
  { id: "tackle", label: "Tackle" },
  { id: "disabled", label: "Disabled", disabled: true },
];

const SAMPLE_TABS_BOX: TabsBoxItem[] = [
  { id: "orders", label: "Order", icon: "receipt_long", badge: "10" },
  { id: "ship", label: "Ship", icon: "local_shipping" },
  { id: "history", label: "History", icon: "history" },
];

export default function Home() {
  const [activeItem, setActiveItem] = useState<BottomNavItemId>("home");
  const [activeTabId, setActiveTabId] = useState("all");
  const [activeTabsBoxId, setActiveTabsBoxId] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(
    () => (searchQuery.trim() ? SAMPLE_SEARCH_RESULTS : []),
    [searchQuery]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans dark:bg-zinc-500 px-1">
      <div className="flex w-full max-w-3xl flex-col self-center">
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">RootTopBar</span>
          <RootTopBar
            title="TheLifeoftoy"
            avatarSrc={null}
            onAddProduct={() => {}}
            onFeed={() => {}}
            onSearch={() => {}}
          />
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">ContextTopBar</span>
          <ContextTopBar
            backLabel="Section"
            title="Perch"
            onBack={() => {}}
            onFilter={() => {}}
            onSearch={() => {}}
          />
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">SearchBar</span>
          <SearchBar
            value={searchQuery}
            placeholder="Search"
            onValueChange={setSearchQuery}
            onCancel={() => setSearchQuery("")}
            results={searchResults}
            onResultSelect={(r) => setSearchQuery(r.title)}
          />
        </section>
      </div>
      <main className="flex min-h-0 flex-1 w-full max-w-3xl flex-col gap-8 self-center">
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Tabs</span>
          <Tabs
            tabs={SAMPLE_TABS}
            value={activeTabId}
            onValueChange={setActiveTabId}
            className="w-full border-b border-slate-200"
          />
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">TabsBox</span>
          <TabsBox
            tabs={SAMPLE_TABS_BOX}
            value={activeTabsBoxId}
            onValueChange={setActiveTabsBoxId}
            className="w-full border-y border-slate-200"
          />
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Avatar</span>
          <div className="flex flex-wrap items-end gap-6">
            <Avatar size={16} />
            <Avatar size={24} />
            <Avatar size={32} />
            <Avatar size={48} />
            <Avatar size={56} />
            <Avatar size={80} />
            <Avatar size={80} label="LimeStones.." />
            <Avatar size={32} label="TheLifeoftoy" labelPosition="right" />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">ColorBlock</span>
          <div className="flex flex-wrap items-end gap-4">
            <ColorBlock />
            <ColorBlock color="red" label="Red" />
            <ColorBlock color="green" label="Green" selected />
            <ColorBlock color="blue" label="Blue" />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">ImageBlock</span>
          <div className="flex flex-wrap items-end gap-6">
            <ImageBlock size="small" />
            <ImageBlock size="small" onAdd={() => {}} />
            <ImageBlock size="medium" />
            <ImageBlock size="medium" onAdd={() => {}} />
            <ImageBlock size="large" onAction={() => {}} />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">MediaDropzone</span>
          <MediaDropzone onFilesSelect={() => {}} />
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Badge</span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="success">Success</Badge>
          </div>
        </section>
      </main>
      <div className="flex w-full max-w-3xl flex-col self-center">
        <section className="flex flex-col">
          <span className="text-center font-medium text-white text-[length:var(--font-size-paragraph-md)]">BottomNav</span>
          <BottomNav
            activeItem={activeItem}
            onItemChange={setActiveItem}
          />
        </section>
      </div>
    </div>
  );
}
