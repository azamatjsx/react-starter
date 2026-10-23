import { createFileRoute } from "@tanstack/react-router";

import { ChartPage } from "@/pages/chart";

export const Route = createFileRoute("/chart")({
    component: ChartPage,
});
