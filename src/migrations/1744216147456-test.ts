import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1744216147456 implements MigrationInterface {
    name = 'Test1744216147456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super admin', 'admin', 'vendor', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image_url" character varying DEFAULT 'defulte_img', "isActive" boolean NOT NULL DEFAULT true, "phone" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_phone" ON "users" ("phone") `);
        await queryRunner.query(`CREATE TABLE "cars" ("id" SERIAL NOT NULL, "title_ar" character varying NOT NULL, "title_en" character varying NOT NULL, "desc_ar" character varying NOT NULL, "desc_en" character varying NOT NULL, "images" jsonb NOT NULL DEFAULT '[]', "model" character varying NOT NULL, "brand" character varying NOT NULL, "location" character varying NOT NULL, "lat" double precision, "long" double precision, "status" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "price" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ads" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "image_url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "adminId" integer, CONSTRAINT "PK_a7af7d1998037a97076f758fc23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."favorites_item_type_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "item_id" integer NOT NULL, "item_type" "public"."favorites_item_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "properties" ("id" SERIAL NOT NULL, "title_ar" character varying NOT NULL, "title_en" character varying NOT NULL, "desc_ar" character varying NOT NULL, "desc_en" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "location" character varying NOT NULL, "images" jsonb NOT NULL DEFAULT '[]', "lat" double precision, "long" double precision, "status" character varying NOT NULL, "price" numeric NOT NULL, "area" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "location" character varying NOT NULL, "price" numeric NOT NULL, "details" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_permissions_permission_enum" AS ENUM('manage_users', 'login', 'manage_sales', 'manage_services', 'create_ads', 'delete_ads', 'full_access')`);
        await queryRunner.query(`CREATE TABLE "user_permissions" ("permission" "public"."user_permissions_permission_enum" NOT NULL, "id" SERIAL NOT NULL, "userId" integer, CONSTRAINT "PK_01f4295968ba33d73926684264f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`CREATE TABLE "attribute" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying NOT NULL, "entity" "public"."attribute_entity_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attribute_value" ("id" SERIAL NOT NULL, "entity" character varying NOT NULL, "entity_id" integer NOT NULL, "value" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dff76d9cc1db2684732acdb9ca7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_value_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`CREATE TABLE "specifications_value" ("id" SERIAL NOT NULL, "entity" "public"."specifications_value_entity_enum" NOT NULL, "entity_id" integer NOT NULL, "value" character varying, "IsActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1649db21642b8d4f736e688fab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`CREATE TABLE "specifications" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying NOT NULL, "entity" "public"."specifications_entity_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_621aabf71e640ab86f0e8b62a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_6431b6fec12c4090bb357fba2c2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ads" ADD CONSTRAINT "FK_e15e3b11975fe6eedbdca399c1d" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_6b55a80fd17a5bb77b753635496" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_3905389899d96c4f1b3619f68d5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_f05ccc7935f14874d7f89ba030f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_f05ccc7935f14874d7f89ba030f"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_3905389899d96c4f1b3619f68d5"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_6b55a80fd17a5bb77b753635496"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`ALTER TABLE "ads" DROP CONSTRAINT "FK_e15e3b11975fe6eedbdca399c1d"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_6431b6fec12c4090bb357fba2c2"`);
        await queryRunner.query(`DROP TABLE "specifications"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_entity_enum"`);
        await queryRunner.query(`DROP TABLE "specifications_value"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_value_entity_enum"`);
        await queryRunner.query(`DROP TABLE "attribute_value"`);
        await queryRunner.query(`DROP TABLE "attribute"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_entity_enum"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."user_permissions_permission_enum"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "properties"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
        await queryRunner.query(`DROP TYPE "public"."favorites_item_type_enum"`);
        await queryRunner.query(`DROP TABLE "ads"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP INDEX "public"."idx_phone"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
