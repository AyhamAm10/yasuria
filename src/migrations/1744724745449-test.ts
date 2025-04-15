import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1744724745449 implements MigrationInterface {
    name = 'Test1744724745449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
    }

}
