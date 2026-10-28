// Skema database MySQL untuk CMS portofolio (Drizzle ORM).
// Ubah skema di sini, lalu buat migrasi: npm run db:generate, terapkan: npm run db:migrate
//
// Konten disimpan sebagai dokumen JSON per baris (kolom data), dikelompokkan per koleksi
// (kolom collection). Bentuk dan validasi setiap koleksi ada di src/content/collections.ts.

import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const entries = mysqlTable(
  "entries",
  {
    id: int("id").autoincrement().primaryKey(),
    collection: varchar("collection", { length: 32 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    // public = tampil di portofolio; private = hanya terlihat di CMS (dan lewat tautan berbagi bila dibuat)
    visibility: mysqlEnum("visibility", ["public", "private"]).notNull().default("private"),
    position: int("position").notNull().default(0),
    data: json("data").notNull(),
    // Hash SHA-256 dari token tautan berbagi. Token aslinya hanya ditampilkan sekali di CMS.
    shareHash: varchar("share_hash", { length: 64 }),
    shareCreatedAt: datetime("share_created_at"),
    createdAt: datetime("created_at").notNull(),
    updatedAt: datetime("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("entries_collection_slug").on(t.collection, t.slug),
    uniqueIndex("entries_share_hash").on(t.shareHash),
    index("entries_collection_visibility").on(t.collection, t.visibility),
  ],
);

// Pengaturan tunggal (profil, tautan, metrik), satu baris per kunci.
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: json("value").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// Berkas unggahan (sertifikat PDF atau gambar). Isinya disimpan di disk (UPLOAD_DIR), bukan di public/.
export const files = mysqlTable(
  "files",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    entryId: int("entry_id"),
    storedName: varchar("stored_name", { length: 80 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mime: varchar("mime", { length: 64 }).notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    createdAt: datetime("created_at").notNull(),
  },
  (t) => [index("files_entry").on(t.entryId)],
);

export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    // scrypt, format: scrypt$N$r$p$salt$hash (base64). Null bila hanya login lewat GitHub.
    passwordHash: varchar("password_hash", { length: 255 }),
    githubLogin: varchar("github_login", { length: 64 }),
    active: boolean("active").notNull().default(true),
    createdAt: datetime("created_at").notNull(),
  },
  (t) => [uniqueIndex("admins_email").on(t.email), uniqueIndex("admins_github").on(t.githubLogin)],
);

export const sessions = mysqlTable(
  "sessions",
  {
    // Hash SHA-256 dari token di cookie. Token aslinya tidak pernah disimpan.
    id: varchar("id", { length: 64 }).primaryKey(),
    adminId: int("admin_id").notNull(),
    method: mysqlEnum("method", ["password", "github"]).notNull(),
    expiresAt: datetime("expires_at").notNull(),
    createdAt: datetime("created_at").notNull(),
  },
  (t) => [index("sessions_admin").on(t.adminId)],
);

// Pembatas percobaan login per kunci (alamat IP atau email).
export const loginAttempts = mysqlTable("login_attempts", {
  key: varchar("key", { length: 190 }).primaryKey(),
  count: int("count").notNull().default(0),
  windowStart: datetime("window_start").notNull(),
});
