import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1742388118305 implements MigrationInterface {
    name = 'Test1742388118305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" ADD "lat" double precision`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "long" double precision`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "lat" double precision`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "long" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "long"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "long"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "lat"`);
    }

}
