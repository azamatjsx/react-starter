import { barY, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";

import { alphabet } from "../model/demo-data.ts";

const percent = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
});

const letterFrequencyChart = defineChart({
    marks: [
        barY(alphabet, {
            x: "letter",
            y: "frequency",
        }),
    ],
    scales: {
        x: {
            scale: () => scaleBand().padding(0.18),
        },
        y: {
            scale: scaleLinear,
            nice: true,
            grid: true,
            axis: {
                label: "Frequency",
                ticks: { format: (value) => percent.format(value) },
            },
        },
    },

    tooltip,
});

export function ChartPage() {
    return (
        <main className="mx-auto max-w-2xl pt-24">
            <h1 className="mb-6 text-2xl font-semibold">Letter frequency</h1>
            <Chart
                definition={letterFrequencyChart}
                aspectRatio={16 / 9}
                initialWidth={720}
                ariaLabel="English letter frequencies"
            />
        </main>
    );
}
