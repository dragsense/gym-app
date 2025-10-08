import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabContent {
  index: string;
  label: string;
  content: React.ReactNode;
}

interface AppTabsProps {
  tabs: TabContent[];
  defaultTab?: string;
}

export function AppTabs({
  tabs,
  defaultTab = "1",
}: AppTabsProps) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid grid-cols-2">
        {tabs.map((tab, index) => (
          <TabsTrigger key={index} value={tab.index}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={index} value={tab.index}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
