import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="p-3 md:p-4 group-data-[collapsible=icon]:p-2">
            <SidebarMenu className="gap-1 md:gap-2 group-data-[collapsible=icon]:gap-1">
                {items.map((item) => {
                    const isChildActive = item.items?.some(subItem => page.url.startsWith(resolveUrl(subItem.href)));
                    return item.items && item.items.length > 0 ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isChildActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isChildActive}
                                        className="h-10 px-4 w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-[#ac0021] transition-all duration-200 ease-in-out data-[active=true]:bg-[#AC0021] data-[active=true]:text-white data-[state=open]:bg-[#AC0021] data-[state=open]:text-white data-[active=true]:hover:bg-[#AC0021] data-[active=true]:hover:text-white [&[data-active=true]>svg]:text-white [&[data-state=open]>svg]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 overflow-hidden"
                                    >
                                        {item.icon && <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover/menu-item:text-[#ac0021] data-[active=true]:group-hover/menu-item:text-white" />}
                                        <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-200">{item.title}</span>
                                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-all duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden group-hover/menu-item:text-[#ac0021] data-[active=true]:group-hover/menu-item:text-white" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="ml-4 mt-1 space-y-1 border-l-2 border-sidebar-border pl-2 mr-0 pr-0 group-data-[collapsible=icon]:hidden">
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={page.url === resolveUrl(subItem.href)}
                                                    className="h-9 px-3 w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-[#ac0021] transition-all duration-200 ease-in-out data-[active=true]:bg-[#AC0021] data-[active=true]:text-white data-[active=true]:hover:bg-[#AC0021] data-[active=true]:hover:text-white [&[data-active=true]>svg]:text-white overflow-hidden"
                                                >
                                                    <Link href={subItem.href} className="flex items-center w-full">
                                                        {subItem.icon && <subItem.icon className="h-4 w-4 mr-2 shrink-0 transition-colors duration-200 group-hover/menu-sub-item:text-[#ac0021] data-[active=true]:group-hover/menu-sub-item:text-white" />}
                                                        <span className="whitespace-nowrap overflow-hidden transition-colors duration-200">{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(resolveUrl(item.href)) || (item.title === 'Surat' && page.url.startsWith('/buat-surat')) || (item.title === 'Mapping Staff' && page.url.startsWith('/verification-queue'))}
                                tooltip={{ children: item.title }}
                                className="h-10 px-4 w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-[#ac0021] transition-all duration-200 ease-in-out data-[active=true]:bg-[#AC0021] data-[active=true]:text-white data-[active=true]:hover:bg-[#AC0021] data-[active=true]:hover:text-white [&[data-active=true]>svg]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 overflow-hidden"
                            >
                                <Link href={item.href} prefetch className="flex items-center w-full">
                                    {item.icon && <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover/menu-item:text-[#ac0021] data-[active=true]:group-hover/menu-item:text-white" />}
                                    <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-200">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
