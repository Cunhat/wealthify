import { z } from "zod";

export const frequencyMonthsSchema = z.union([
	z.literal("monthly"),
	z.literal("bimonthly"),
	z.literal("quarterly"),
	z.literal("fourMonths"),
	z.literal("semester"),
	z.literal("yearly"),
]);

export type FrequencyMonths = z.infer<typeof frequencyMonthsSchema>;

// Define the frequency options
export const frequencyOptions: {
	value: FrequencyMonths;
	label: string;
	multiplier: number;
	interval: number;
}[] = [
	{ value: "monthly", label: "Every month", multiplier: 12, interval: 1 },
	{ value: "bimonthly", label: "Every 2 months", multiplier: 6, interval: 2 },
	{ value: "quarterly", label: "Every 3 months", multiplier: 4, interval: 3 },
	{ value: "fourMonths", label: "Every 4 months", multiplier: 3, interval: 4 },
	{ value: "semester", label: "Every 6 months", multiplier: 2, interval: 6 },
	{ value: "yearly", label: "Annually", multiplier: 1, interval: 12 },
];
