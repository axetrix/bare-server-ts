import { pgTable, timestamp, varchar, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  hashedPassword: text("hashed_password").default("unset").notNull(),
  email: varchar("email", { length: 256 }).unique().notNull(),
});

export type UserDTO = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserSafe = Pick<User, "id" | "email" | "createdAt" | "updatedAt">;

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text("body").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export type ChirpDTO = typeof chirps.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;
