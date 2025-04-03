import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1743105220758 implements MigrationInterface {
    name = 'Test1743105220758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specifications" DROP COLUMN "entity"`);
        await queryRunner.query(`CREATE TYPE "public"."specifications_entity_enum" AS ENUM('car', 'properties')`);
        await queryRunner.query(`ALTER TABLE "specifications" ADD "entity" "public"."specifications_entity_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specifications" DROP COLUMN "entity"`);
        await queryRunner.query(`DROP TYPE "public"."specifications_entity_enum"`);
        await queryRunner.query(`ALTER TABLE "specifications" ADD "entity" character varying NOT NULL`);
    }

}
