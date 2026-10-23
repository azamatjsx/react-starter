import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";

// Route files stay thin: they map a URL to a page from the pages layer
export const Route = createFileRoute("/")({
    component: HomePage,
});
