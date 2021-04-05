import {MigrationInterface, QueryRunner} from "typeorm";

export class TokenMigration1617625391932 implements MigrationInterface {
    name = 'TokenMigration1617625391932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `token` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `jwt` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `token`");
    }

}
