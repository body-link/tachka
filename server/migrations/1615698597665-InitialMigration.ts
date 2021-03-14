import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1615698597665 implements MigrationInterface {
    name = 'InitialMigration1615698597665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `record` (`id` varchar(36) NOT NULL, `bucket` varchar(255) NOT NULL, `provider` varchar(255) NOT NULL, `timestamp` int(11) UNSIGNED NOT NULL, `offset` smallint NULL, `data` text NOT NULL, INDEX `IDX_b3947ba90f0925f2a6f6dd7a79` (`bucket`), INDEX `IDX_779ab0c6ed67cbb7b3491da5c7` (`provider`), INDEX `IDX_f6c41a1fdf16e6e21160326f64` (`timestamp`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_f6c41a1fdf16e6e21160326f64` ON `record`");
        await queryRunner.query("DROP INDEX `IDX_779ab0c6ed67cbb7b3491da5c7` ON `record`");
        await queryRunner.query("DROP INDEX `IDX_b3947ba90f0925f2a6f6dd7a79` ON `record`");
        await queryRunner.query("DROP TABLE `record`");
    }

}
