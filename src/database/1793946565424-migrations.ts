import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1793946565424 implements MigrationInterface {
    name = 'Migrations1793946565424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_image\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productId\` int NOT NULL, \`imageUrl\` varchar(500) NOT NULL, \`publicId\` varchar(255) NOT NULL, \`fileType\` varchar(100) NOT NULL, \`fileSize\` int NOT NULL, \`isMain\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`stock\` int NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`isFeatured\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`categoryId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`cartId\` int NOT NULL, \`productId\` int NOT NULL, \`quantity\` int NOT NULL, UNIQUE INDEX \`IDX_86ecfe066ef04fcf69bdbae722\` (\`cartId\`, \`productId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, UNIQUE INDEX \`REL_756f53ab9466eb52a52619ee01\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', \`refreshTokenHash\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cartId\` int NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`REL_342497b574edb2309ec8c6b62a\` (\`cartId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productId\` int NOT NULL, \`productName\` varchar(255) NOT NULL, \`unitPrice\` decimal(15,2) NOT NULL, \`quantity\` int NOT NULL, \`subtotal\` decimal(15,2) NOT NULL, \`orderId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderCode\` varchar(255) NOT NULL, \`recipientName\` varchar(255) NOT NULL, \`recipientPhone\` varchar(255) NOT NULL, \`shippingAddress\` varchar(255) NOT NULL, \`totalAmount\` decimal(15,2) NOT NULL, \`status\` enum ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, UNIQUE INDEX \`IDX_a97c808a83af1497276bf85e5b\` (\`orderCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` int NOT NULL, \`method\` enum ('COD', 'BANK_TRANSFER') NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`status\` enum ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING', \`transactionCode\` varchar(255) NULL, \`paidAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_76d31bcc0845613d4e9b48fb69\` (\`transactionCode\`), UNIQUE INDEX \`REL_af929a5f2a400fdb6913b4967e\` (\`orderId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_image\` ADD CONSTRAINT \`FK_40ca0cd115ef1ff35351bed8da2\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_ff0c0301a95e517153df97f6812\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_29e590514f9941296f3a2440d39\` FOREIGN KEY (\`cartId\`) REFERENCES \`cart\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_75db0de134fe0f9fe9e4591b7bf\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`FK_756f53ab9466eb52a52619ee019\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_342497b574edb2309ec8c6b62aa\` FOREIGN KEY (\`cartId\`) REFERENCES \`cart\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_cdb99c05982d5191ac8465ac010\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_af929a5f2a400fdb6913b4967e1\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_af929a5f2a400fdb6913b4967e1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_cdb99c05982d5191ac8465ac010\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_342497b574edb2309ec8c6b62aa\``);
        await queryRunner.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`FK_756f53ab9466eb52a52619ee019\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_75db0de134fe0f9fe9e4591b7bf\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_29e590514f9941296f3a2440d39\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_ff0c0301a95e517153df97f6812\``);
        await queryRunner.query(`ALTER TABLE \`product_image\` DROP FOREIGN KEY \`FK_40ca0cd115ef1ff35351bed8da2\``);
        await queryRunner.query(`DROP INDEX \`REL_af929a5f2a400fdb6913b4967e\` ON \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_76d31bcc0845613d4e9b48fb69\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_a97c808a83af1497276bf85e5b\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP INDEX \`REL_342497b574edb2309ec8c6b62a\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_756f53ab9466eb52a52619ee01\` ON \`cart\``);
        await queryRunner.query(`DROP TABLE \`cart\``);
        await queryRunner.query(`DROP INDEX \`IDX_86ecfe066ef04fcf69bdbae722\` ON \`cart_item\``);
        await queryRunner.query(`DROP TABLE \`cart_item\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`product_image\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
