import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1744725538544 implements MigrationInterface {
    name = 'Test1744725538544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "broker_offices" ALTER COLUMN "image" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "broker_offices" ALTER COLUMN "image" SET NOT NULL`);
    }

}
