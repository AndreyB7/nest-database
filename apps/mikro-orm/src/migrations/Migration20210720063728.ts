import {Migration} from "@mikro-orm/migrations";

export class Migration20210720063728 extends Migration {
  // eslint-disable-next-line @typescript-eslint/require-await
  async up(): Promise<void> {
    this.addSql(
      'create table "user_entity" ("id" serial primary key, "email" varchar not null, "password" varchar null, "roles" text[] not null default \'{user}\');',
    );

    this.addSql(
      'create table "auth_entity" ("id" serial primary key, "refresh_token" varchar not null, "refresh_token_expires_at" bigint not null, "user_id" int4 not null, "time_created_at" timestamptz(0) not null, "time_updated_at" timestamptz(0) not null);',
    );

    this.addSql(
      'alter table "auth_entity" add constraint "auth_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;',
    );
  }
}
