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
}[] = [
	{ value: "monthly", label: "Every month", multiplier: 12 },
	{ value: "bimonthly", label: "Every 2 months", multiplier: 6 },
	{ value: "quarterly", label: "Every 3 months", multiplier: 4 },
	{ value: "fourMonths", label: "Every 4 months", multiplier: 3 },
	{ value: "semester", label: "Every 6 months", multiplier: 2 },
	{ value: "yearly", label: "Annually", multiplier: 1 },
];
