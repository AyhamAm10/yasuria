import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1745930859163 implements MigrationInterface {
    name = 'Test1745930859163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" ALTER COLUMN "title_en" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "desc_en"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "desc_en" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "desc_en"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "desc_en" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ALTER COLUMN "title_en" SET NOT NULL`);
    }

}
