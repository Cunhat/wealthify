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
export const frequencyOptions: { value: FrequencyMonths; label: string }[] = [
	{ value: "monthly", label: "Every month" },
	{ value: "bimonthly", label: "Every 2 months" },
	{ value: "quarterly", label: "Every 3 months" },
	{ value: "fourMonths", label: "Every 4 months" },
	{ value: "semester", label: "Every 6 months" },
	{ value: "yearly", label: "Annually" },
];
