import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1746299125380 implements MigrationInterface {
    name = 'Test1746299125380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "car_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_7bfbb82e6b89e82079a62290ff6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "name_en"`);
        await queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "name_ar"`);
        await queryRunner.query(`ALTER TABLE "property_type" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "carTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_db4c9f8a809793590700282613b" FOREIGN KEY ("carTypeId") REFERENCES "car_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_db4c9f8a809793590700282613b"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "carTypeId"`);
        await queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "property_type" ADD "name_ar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "property_type" ADD "icon" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "property_type" ADD "name_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "property_type" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "car_type"`);
    }

}
