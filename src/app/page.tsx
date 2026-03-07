"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import type { BottomNavItemId } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { RootTopBar } from "@/components/RootTopBar";
import { Badge } from "@/components/Badge";
import { ColorBlock } from "@/components/ColorBlock";
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
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans dark:bg-zinc-500">
      <div className="flex w-full max-w-3xl flex-col self-center">
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
      <main className="flex min-h-0 flex-1 w-full max-w-3xl flex-col gap-8 self-center px-6 py-8 sm:px-8">
        <Tabs
          tabs={SAMPLE_TABS}
          value={activeTabId}
          onValueChange={setActiveTabId}
          className="w-full border-b border-slate-200"
        />
        <TabsBox
          tabs={SAMPLE_TABS_BOX}
          value={activeTabsBoxId}
          onValueChange={setActiveTabsBoxId}
          className="w-full border-y border-slate-200"
        />
        <div className="flex flex-wrap items-end gap-4">
          <ColorBlock />
          <ColorBlock color="red" label="Red" />
          <ColorBlock color="green" label="Green" selected />
          <ColorBlock color="blue" label="Blue" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="success">Success</Badge>
        </div>
      </main>
      <div className="flex w-full max-w-3xl flex-col self-center">
        <BottomNav
          activeItem={activeItem}
          onItemChange={setActiveItem}
        />
      </div>
    </div>
  );
}
