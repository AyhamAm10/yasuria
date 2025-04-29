import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1745922967816 implements MigrationInterface {
    name = 'Test1745922967816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "icon" character varying`);
        await queryRunner.query(`ALTER TABLE "attribute_value" ADD "attributeId" integer`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_input_type_enum" AS ENUM('text', 'dropdown', 'nested_dropdown')`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "input_type" "public"."attribute_input_type_enum" NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "options" json`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "parent_id" integer`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "parent_value" character varying`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "parentId" integer`);
        await queryRunner.query(`ALTER TABLE "attribute_value" ADD CONSTRAINT "FK_123ac30d8ade936347e4099cc4a" FOREIGN KEY ("attributeId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_cba2ee6bbf10e77188fec67ecbb" FOREIGN KEY ("parentId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_cba2ee6bbf10e77188fec67ecbb"`);
        await queryRunner.query(`ALTER TABLE "attribute_value" DROP CONSTRAINT "FK_123ac30d8ade936347e4099cc4a"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "parent_value"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "options"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP COLUMN "input_type"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_input_type_enum"`);
        await queryRunner.query(`ALTER TABLE "attribute_value" DROP COLUMN "attributeId"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD "type" character varying NOT NULL`);
    }

}
