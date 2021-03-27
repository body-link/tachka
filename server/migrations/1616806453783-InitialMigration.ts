import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1616806453783 implements MigrationInterface {
    name = 'InitialMigration1616806453783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `integration_auth` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `integration` varchar(128) NOT NULL, `profile` varchar(128) NOT NULL, `data` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `integration_data` (`id` varchar(128) NOT NULL, `data` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `record` (`id` varchar(128) NOT NULL, `bucket` varchar(255) NOT NULL, `provider` varchar(255) NOT NULL, `timestamp` int UNSIGNED NOT NULL, `offset` smallint NULL, `data` text NOT NULL, INDEX `IDX_b3947ba90f0925f2a6f6dd7a79` (`bucket`), INDEX `IDX_779ab0c6ed67cbb7b3491da5c7` (`provider`), INDEX `IDX_f6c41a1fdf16e6e21160326f64` (`timestamp`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `automation_instance` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `automation` varchar(128) NOT NULL, `options` text NOT NULL, `schedule` varchar(128) NULL, `isOn` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `integration_auth` ADD CONSTRAINT `FK_e3238e63f92b269b188e50349be` FOREIGN KEY (`integration`) REFERENCES `integration_data`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `integration_auth` DROP FOREIGN KEY `FK_e3238e63f92b269b188e50349be`");
        await queryRunner.query("DROP TABLE `automation_instance`");
        await queryRunner.query("DROP INDEX `IDX_f6c41a1fdf16e6e21160326f64` ON `record`");
        await queryRunner.query("DROP INDEX `IDX_779ab0c6ed67cbb7b3491da5c7` ON `record`");
        await queryRunner.query("DROP INDEX `IDX_b3947ba90f0925f2a6f6dd7a79` ON `record`");
        await queryRunner.query("DROP TABLE `record`");
        await queryRunner.query("DROP TABLE `integration_data`");
        await queryRunner.query("DROP TABLE `integration_auth`");
    }

}
