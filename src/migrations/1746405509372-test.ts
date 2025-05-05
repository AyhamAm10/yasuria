import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1746405509372 implements MigrationInterface {
    name = 'Test1746405509372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "floors" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "title_en" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "desc_en" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "isActive" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "area" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attribute_value" DROP COLUMN "entity"`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_value_entity_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`ALTER TABLE "attribute_value" ADD "entity" "public"."attribute_value_entity_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attribute" ALTER COLUMN "show_in_search" SET DEFAULT false`);
        await queryRunner.query(`ALTER TYPE "public"."attribute_entity_enum" RENAME TO "attribute_entity_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_entity_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`ALTER TABLE "attribute" ALTER COLUMN "entity" TYPE "public"."attribute_entity_enum" USING "entity"::"text"::"public"."attribute_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_entity_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."specifications_value_entity_enum" RENAME TO "specifications_value_entity_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_value_entity_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`ALTER TABLE "specifications_value" ALTER COLUMN "entity" TYPE "public"."specifications_value_entity_enum" USING "entity"::"text"::"public"."specifications_value_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_value_entity_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."specifications_entity_enum" RENAME TO "specifications_entity_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_entity_enum" AS ENUM('car', 'property')`);
        await queryRunner.query(`ALTER TABLE "specifications" ALTER COLUMN "entity" TYPE "public"."specifications_entity_enum" USING "entity"::"text"::"public"."specifications_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_entity_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."specifications_entity_enum_old" AS ENUM('car', 'properties')`);
        await queryRunner.query(`ALTER TABLE "specifications" ALTER COLUMN "entity" TYPE "public"."specifications_entity_enum_old" USING "entity"::"text"::"public"."specifications_entity_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_entity_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."specifications_entity_enum_old" RENAME TO "specifications_entity_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_value_entity_enum_old" AS ENUM('car', 'properties')`);
        await queryRunner.query(`ALTER TABLE "specifications_value" ALTER COLUMN "entity" TYPE "public"."specifications_value_entity_enum_old" USING "entity"::"text"::"public"."specifications_value_entity_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_value_entity_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."specifications_value_entity_enum_old" RENAME TO "specifications_value_entity_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_entity_enum_old" AS ENUM('car', 'properties')`);
        await queryRunner.query(`ALTER TABLE "attribute" ALTER COLUMN "entity" TYPE "public"."attribute_entity_enum_old" USING "entity"::"text"::"public"."attribute_entity_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_entity_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."attribute_entity_enum_old" RENAME TO "attribute_entity_enum"`);
        await queryRunner.query(`ALTER TABLE "attribute" ALTER COLUMN "show_in_search" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "attribute_value" DROP COLUMN "entity"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_value_entity_enum"`);
        await queryRunner.query(`ALTER TABLE "attribute_value" ADD "entity" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "area" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "isActive" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "desc_en" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "title_en" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "floors"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "status" character varying NOT NULL`);
    }

}
