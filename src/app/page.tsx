"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import type { BottomNavItemId } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { RootTopBar } from "@/components/RootTopBar";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { BorderLine } from "@/components/BorderLine";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ColorBlock } from "@/components/ColorBlock";
import { IconButton } from "@/components/IconButton";
import { ImageBlock } from "@/components/ImageBlock";
import { ImageButton } from "@/components/ImageButton";
import { Link } from "@/components/Link";
import { CostBreakdown } from "@/components/CostBreakdown";
import { Drawer } from "@/components/Drawer";
import { DrawerTopBar } from "@/components/DrawerTopBar";
import { MediaDropzone } from "@/components/MediaDropzone";
import { TrackInventoryCard } from "@/components/TrackInventoryCard";
import { ProductListing } from "@/components/ProductListing";
import { SearchBar } from "@/components/SearchBar";
import { SectionLine } from "@/components/SectionLine";
import { Tabs, TabsBox } from "@/components/Tabs";
import type { TabItem, TabsBoxItem } from "@/components/Tabs";
import { VariantOptionButton } from "@/components/VariantOptionButton";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWithTopBarOpen, setDrawerWithTopBarOpen] = useState(false);
  const searchResults = useMemo(
    () => (searchQuery.trim() ? SAMPLE_SEARCH_RESULTS : []),
    [searchQuery]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans dark:bg-zinc-500 px-1 pb-50">
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
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Drawer</span>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" size="small" onClick={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <Button variant="outline" size="small" onClick={() => setDrawerWithTopBarOpen(true)}>
              Open drawer with top bar
            </Button>
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filters">
              <p className="text-slate-700 text-[length:var(--font-size-paragraph-md)]">
                Drawer content. Use for filters, settings, or secondary panels.
              </p>
              <div className="mt-4">
                <Checkbox label="Option A" onChange={() => {}} />
                <Checkbox label="Option B" onChange={() => {}} className="mt-2" />
              </div>
            </Drawer>
            <Drawer
              open={drawerWithTopBarOpen}
              onClose={() => setDrawerWithTopBarOpen(false)}
              aria-label="Variants"
            >
              <DrawerTopBar
                title="Variants"
                onBack={() => setDrawerWithTopBarOpen(false)}
                actionLabel="Add group"
                onAction={() => {}}
                actionIcon="add"
                className="-mx-6 -mt-4"
              />
              <div className="text-slate-700 text-[length:var(--font-size-paragraph-md)]">
                Drawer content with custom top bar (back, title, action button).
              </div>
            </Drawer>
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Checkbox</span>
          <div className="flex flex-wrap items-center gap-6 rounded bg-white p-4">
            <Checkbox aria-label="Unchecked" onChange={() => {}} />
            <Checkbox checked aria-label="Checked" onChange={() => {}} />
            <Checkbox label="Soft Plastic" onChange={() => {}} />
            <Checkbox label="Checked option" checked onChange={() => {}} />
            <Checkbox disabled label="Disabled" />
            <Checkbox checked error label="Error" onChange={() => {}} />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">IconButton</span>
          <div className="flex flex-wrap items-center gap-4">
            <IconButton name="favorite" aria-label="Like" onClick={() => {}} />
            <IconButton name="favorite" variant="subtle" aria-label="Like" />
            <IconButton name="favorite" variant="outline" aria-label="Like" />
            <IconButton name="favorite" variant="transparent" aria-label="Like" />
            <IconButton name="favorite" variant="neutrals" aria-label="Like" />
            <IconButton name="favorite" size="large" aria-label="Like" />
            <IconButton name="delete" variant="default" tone="error" aria-label="Delete" />
            <IconButton name="delete" variant="subtle" tone="error" aria-label="Delete" />
            <IconButton name="add" aria-label="Add" disabled />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Link</span>
          <div className="flex flex-wrap items-center gap-4 rounded bg-white p-4">
            <Link href="#">Sign Up</Link>
            <Link onClick={() => {}}>Sign Up</Link>
            <Link size="small">Sign Up</Link>
            <Link showIcon={false}>Learn more</Link>
            <Link disabled>Sign Up</Link>
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
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">ImageButton</span>
          <div className="flex flex-wrap items-end gap-6">
            <ImageButton
              src="https://placehold.co/100x100/e3eae1/8b9189?text=1"
              alt="Option 1"
              onClick={() => {}}
            />
            <ImageButton
              src="https://placehold.co/100x100/e3eae1/8b9189?text=2"
              alt="Option 2"
              selected
            />
            <ImageButton
              src="https://placehold.co/100x100/e3eae1/8b9189?text=3"
              alt="Option 3"
            />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">VariantOptionButton</span>
          <div className="flex flex-wrap items-end gap-6">
            <VariantOptionButton onClick={() => {}}>large</VariantOptionButton>
            <VariantOptionButton selected>large</VariantOptionButton>
            <VariantOptionButton>medium</VariantOptionButton>
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">ProductListing</span>
          <div className="flex flex-wrap items-start gap-6">
            <ProductListing
              imageSrc="https://placehold.co/218x218/e3eae1/8b9189?text=Product"
              title="Slayer 10 pack 3 Inch"
              price="SEK 1,299"
              originalPrice="SEK 1,299"
              sellerName="LimeStonesoftbaits"
              badge="NEW DROP"
              conditionLabel="Condition:"
              conditionValue="New"
            />
            <ProductListing
              imageSrc="https://placehold.co/218x218/e3eae1/8b9189?text=Product"
              title="Slayer 10 pack 3 Inch"
              price="SEK 1,299"
              sellerName="LimeStonesoftbaits"
              badge="NEW DROP"
              conditionValue="New"
              contentPosition="right"
            />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">CostBreakdown</span>
          <div className="w-full max-w-sm rounded bg-white">
            <CostBreakdown
              rows={[
                { label: "Subtotal (1)", value: "SEK 2000.00" },
                { label: "Shipping Fee", value: "150 SEK" },
                { label: "Total amount", value: "SEK 2000.00", highlightLabel: true },
              ]}
            />
          </div>
        </section>
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">TrackInventoryCard</span>
          <div className="flex flex-wrap items-start gap-6">
            <TrackInventoryCard
              actionLabel="Sign Up"
              onAction={() => {}}
              items={[]}
            />
            <TrackInventoryCard
              actionLabel="Sign Up"
              onAction={() => {}}
              items={[
                {
                  name: "Wobble Grub",
                  detail: "100 sold / 500 amount",
                  progress: 0.58,
                },
              ]}
            />
            <TrackInventoryCard
              actionLabel="Sign Up"
              onAction={() => {}}
              items={[
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.74 },
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.58 },
              ]}
            />
            <TrackInventoryCard
              actionLabel="Sign Up"
              onAction={() => {}}
              items={[
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.5 },
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.8 },
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.2 },
                { name: "Wobble Grub", detail: "100 sold / 500 amount", progress: 0.9 },
              ]}
            />
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
        <section className="flex flex-col">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">Button</span>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="mini" variant="subtle" leadingIcon="school" onClick={() => {}}>Sign Up</Button>
            <Button size="extraSmall" onClick={() => {}}>Sign Up</Button>
            <Button size="small" variant="subtle" onClick={() => {}}>Sign Up</Button>
            <Button size="medium" variant="outline" trailingIcon="chevron_right" onClick={() => {}}>Sign Up</Button>
            <Button size="large" onClick={() => {}}>Sign Up</Button>
            <Button variant="default" disabled>Disabled</Button>
            <Button size="mini" variant="subtle" leadingIcon="school" active>Active</Button>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <span className="mb-1 font-medium text-white text-[length:var(--font-size-paragraph-md)]">BorderLine & SectionLine</span>
          <div className="w-full max-w-md rounded bg-white p-4">
            <p className="text-slate-700 text-sm">Content above</p>
            <BorderLine className="my-3" />
            <p className="text-slate-700 text-sm">Content between border and section line</p>
            <SectionLine className="my-3" />
            <p className="text-slate-700 text-sm">Content below</p>
          </div>
        </section>
      </main>
      <div className="flex w-full max-w-3xl flex-col self-center fixed bottom-0">
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
