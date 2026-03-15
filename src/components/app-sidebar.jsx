import * as React from "react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  CircleDollarSignIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  CarTaxiFront,
  Users,
  UserStar,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useAuthUser } from "@/hooks/use-auth-user";
import { BiTrip } from "react-icons/bi";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Circle } from "lucide-react";

// ================= NAVIGATION DATA =================

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Tours",
      url: "/Trips",
      icon: BiTrip,
    },
    {
      title: "Vehicle",
      url: "/Vehicle",
      icon: CarTaxiFront,
    },
    {
      title: "Drivers",
      url: "/driver-management",
      icon: Users,
    },
    {
      title: "Tour Guide",
      url: "/tour-guide",
      icon: UserStar,
    },
    {
      title: "Packages",
      url: "/packages",
      icon: ClipboardListIcon,
    },
    // {
    //   title: "Users",
    //   url: "/user-management",
    //   icon: DatabaseIcon,
    // },
  ],

  navCompany: [
    {
      title: "Reports",
      url: "/reports",
      icon: BarChartIcon,
    },
    // {
    //   title: "Revenue Analytics",
    //   url: "/analytics",
    //   icon: ArrowUpCircleIcon,
    // },
    {
      title: "Payments",
      url: "/payments",
      icon: CircleDollarSignIcon,
    },
    {
      title: "System Users",
      url: "/user-management",
      icon: SettingsIcon,
    },
  ],

  // navSecondary: [
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: SearchIcon,
  //   },
  //   {
  //     title: "Help",
  //     url: "#",
  //     icon: HelpCircleIcon,
  //   },
  // ],
};

// ================= SIDEBAR COMPONENT =================

export function AppSidebar(props) {
  const user = useAuthUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <span className="text-base font-semibold">
                  TripGenix
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        
        {/* Main Operations */}
        <NavMain items={data.navMain} />

        {/* Company Section (Admin Only) */}
        
          <div className="mt-6 border-t pt-4">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">
              Company
            </p>
            <NavMain items={data.navCompany} />
          </div>
        

        {/* Secondary Section */}
        {/* <div className="mt-6 border-t pt-4">
          <NavMain items={data.navSecondary} />
        </div> */}

      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
