import { Calendar, Home, icons, Inbox, MapPin, Search, Settings } from "lucide-react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/collapsible"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    url:"/",
    icon: Home,
  },
  // {
  //   title: "Travel Timeline",
  //   url: "/timeline",
  //   icon: Calendar,
  // },
  // {
  //   title: "City Explorer",
  //   url: "/cities",
  //   icon: MapPin,
  // },
  // {
  //   title: "Travel Journey",
  //   url: "/travels",
  //   icon: Calendar,
  // },
  {
    title:"Testing-City-Explorer",
    url:"/test-cities",
    icon: MapPin
  },

  // {
  //   title: "My Duolingo",
  //   url: "/duolingo",
  //   icon: Home,
    
  // },
]
export function AppSidebar() {
  return (
    <Sidebar className="text-black min-h-screen" style={{
      fontFamily: '"Playfair Display", serif',
    }}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2" style={{
              fontFamily: '"Playfair Display", serif',
            }}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}