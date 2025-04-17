import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1744850320616 implements MigrationInterface {
    name = 'Test1744850320616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_3905389899d96c4f1b3619f68d5"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_55cf065871a7e53141b5bcf99d3"`);
        await queryRunner.query(`CREATE TABLE "broker_service" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "serviceId" integer, "brokerOfficeId" integer, CONSTRAINT "PK_9498bd281c587108524dadd046d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "details"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "brokerOfficeId"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "city" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "broker_service" ADD CONSTRAINT "FK_53cecba668dbaca4294b8dcb9c7" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "broker_service" ADD CONSTRAINT "FK_18af5a42ce68e5a9ef53765607d" FOREIGN KEY ("brokerOfficeId") REFERENCES "broker_offices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "broker_service" DROP CONSTRAINT "FK_18af5a42ce68e5a9ef53765607d"`);
        await queryRunner.query(`ALTER TABLE "broker_service" DROP CONSTRAINT "FK_53cecba668dbaca4294b8dcb9c7"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "city" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "brokerOfficeId" integer`);
        await queryRunner.query(`ALTER TABLE "services" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "services" ADD "isActive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "services" ADD "details" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "price" numeric NOT NULL`);
        await queryRunner.query(`DROP TABLE "broker_service"`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_55cf065871a7e53141b5bcf99d3" FOREIGN KEY ("brokerOfficeId") REFERENCES "broker_offices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_3905389899d96c4f1b3619f68d5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
