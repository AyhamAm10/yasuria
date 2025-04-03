import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1743028420050 implements MigrationInterface {
    name = 'Test1743028420050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "title_ar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "title_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "desc_ar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "desc_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "images" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "item_type"`);
        await queryRunner.query(`CREATE TYPE "public"."favorites_item_type_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "item_type" "public"."favorites_item_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "item_type"`);
        await queryRunner.query(`DROP TYPE "public"."favorites_item_type_enum"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "item_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "desc_en"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "desc_ar"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "title_en"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "title_ar"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "title" character varying NOT NULL`);
    }

}
