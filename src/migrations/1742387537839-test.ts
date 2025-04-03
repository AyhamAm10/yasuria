import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1742387537839 implements MigrationInterface {
    name = 'Test1742387537839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attribute_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`CREATE TABLE "attribute" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying NOT NULL, "entity" "public"."attribute_entity_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attribute_value" ("id" SERIAL NOT NULL, "entity" character varying NOT NULL, "entity_id" integer NOT NULL, "value" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dff76d9cc1db2684732acdb9ca7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specifications" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying NOT NULL, "entity" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_621aabf71e640ab86f0e8b62a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_value_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`CREATE TABLE "specifications_value" ("id" SERIAL NOT NULL, "entity" "public"."specifications_value_entity_enum" NOT NULL, "entity_id" integer NOT NULL, "value" character varying, "IsActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1649db21642b8d4f736e688fab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "specifications"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "specifications"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "features"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "title_ar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "title_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "desc_ar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "desc_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "area" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "area" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "desc_en"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "desc_ar"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "title_en"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "title_ar"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "features" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "specifications" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "specifications" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "specifications_value"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_value_entity_enum"`);
        await queryRunner.query(`DROP TABLE "specifications"`);
        await queryRunner.query(`DROP TABLE "attribute_value"`);
        await queryRunner.query(`DROP TABLE "attribute"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_entity_enum"`);
    }

}
