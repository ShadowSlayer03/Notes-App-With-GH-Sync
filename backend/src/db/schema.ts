import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    githubId: integer('githubId').unique().notNull(),
    githubRepoId: integer('githubRepoId').unique().notNull(),
    githubAccessToken: text('githubAccessToken', { length: 2048 }).notNull(),
    name: text('name', { length: 100 }),
    email: text('email', { length: 255 }),
    avatarUrl: text('avatarUrl', { length: 2048 }),
    profileUrl: text('profileUrl', { length: 2048 }),
    createdAt: integer('createdAt', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
});

export const sessions = sqliteTable('sessions', {
    tokenHash: text('tokenHash').primaryKey(),
    userId: integer('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
});

export const mediaAssets = sqliteTable('mediaAssets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    notePath: text('notePath'),
    r2Key: text('r2Key').unique().notNull(),
    mimeType: text('mimeType').notNull(),
    size: integer('size').notNull(),

    createdAt: integer('createdAt', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
});

export const sharedLinks = sqliteTable('sharedLinks', {
    shareId: text('shareId')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
    userId: integer('userId')
    .notNull()
    .references(()=> users.id, { onDelete: 'cascade' }),
    noteTitle: text('noteTitle').notNull(),
    noteContent: text('noteContent').notNull()
});

export const deletedNotes = sqliteTable('deletedNotes', {
    id: integer('id')
        .primaryKey({ autoIncrement: true }),
    title: text('title')
        .unique()
        .notNull(),
    desc: text('desc').notNull(),
    folder: text('folder').notNull(),
    deleteCommitSha: text('deleteCommitSha').notNull(),
    previousCommitSha: text('previousCommitSha').notNull(),
    deletedAt: integer('deletedAt', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});