import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { queryClient } from "@/shared/api";
import { TooltipProvider } from "@/shared/ui/tooltip";

import { Devtools } from "./devtools.tsx";
import { router } from "./router.ts";

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <RouterProvider router={router} />
                <Devtools router={router} />
            </TooltipProvider>
        </QueryClientProvider>
    );
}
