import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1741105056772 implements MigrationInterface {
    name = 'Test1741105056772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "image_url" character varying DEFAULT 'defulte_img'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image_url"`);
    }

}
