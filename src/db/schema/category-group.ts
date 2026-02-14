import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { category } from "./category";
import { user } from "./user";

export const categoryGroup = pgTable("category_group", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	icon: text("icon").notNull().default("📁"),
	color: text("color").notNull().default("#000000"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const categoryGroupRelations = relations(
	categoryGroup,
	({ many, one }) => ({
		categories: many(category),
		user: one(user, {
			fields: [categoryGroup.userId],
			references: [user.id],
		}),
	}),
);
