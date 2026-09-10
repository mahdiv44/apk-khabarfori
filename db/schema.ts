import {sqliteTable,text,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const previewRecords=sqliteTable('preview_records',{owner:text('owner').notNull(),kind:text('kind').notNull(),id:text('id').notNull(),data:text('data').notNull()},t=>[primaryKey({columns:[t.owner,t.kind,t.id]}),index('preview_owner_kind').on(t.owner,t.kind)]);
