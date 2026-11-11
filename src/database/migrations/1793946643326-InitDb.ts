import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1793946643326 implements MigrationInterface {
  name = 'InitDb1793946643326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "orders_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED')`);
    await queryRunner.query(`CREATE TYPE "payments_method_enum" AS ENUM ('COD', 'BANK_TRANSFER')`);
    await queryRunner.query(`CREATE TYPE "payments_status_enum" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')`);

    await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_category_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "stock" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "isFeatured" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" integer NOT NULL, CONSTRAINT "PK_product_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "product_image" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "imageUrl" character varying(500) NOT NULL, "publicId" character varying(255) NOT NULL, "fileType" character varying(100) NOT NULL, "fileSize" integer NOT NULL, "isMain" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_product_image_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "cart" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_cart_user_id" UNIQUE ("userId"), CONSTRAINT "PK_cart_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "fullName" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "refreshTokenHash" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" integer, CONSTRAINT "UQ_user_email" UNIQUE ("email"), CONSTRAINT "UQ_user_cart_id" UNIQUE ("cartId"), CONSTRAINT "PK_user_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "cart_item" ("id" SERIAL NOT NULL, "cartId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "UQ_cart_item_cart_product" UNIQUE ("cartId", "productId"), CONSTRAINT "PK_cart_item_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "orderCode" character varying NOT NULL, "recipientName" character varying NOT NULL, "recipientPhone" character varying NOT NULL, "shippingAddress" character varying NOT NULL, "totalAmount" numeric(15,2) NOT NULL, "status" "orders_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_orders_order_code" UNIQUE ("orderCode"), CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "productName" character varying NOT NULL, "unitPrice" numeric(15,2) NOT NULL, "quantity" integer NOT NULL, "subtotal" numeric(15,2) NOT NULL, "orderId" integer NOT NULL, CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "method" "payments_method_enum" NOT NULL, "amount" numeric(15,2) NOT NULL, "status" "payments_status_enum" NOT NULL DEFAULT 'PENDING', "transactionCode" character varying(255), "paidAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_payments_order_id" UNIQUE ("orderId"), CONSTRAINT "UQ_payments_transaction_code" UNIQUE ("transactionCode"), CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"))`);

    await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "product_image" ADD CONSTRAINT "FK_product_image_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_cart_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_user_cart" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_cart_item_cart" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_cart_item_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_item"`);
    await queryRunner.query(`DROP TABLE "cart"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "product_image"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TYPE "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "payments_method_enum"`);
    await queryRunner.query(`DROP TYPE "orders_status_enum"`);
  }
}
