import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1745931086391 implements MigrationInterface {
    name = 'Test1745931086391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "model"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "brand"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" ADD "brand" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "model" character varying NOT NULL`);
    }

}
