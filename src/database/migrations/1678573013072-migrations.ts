import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1678573013072 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        tags TEXT[] NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE users
    `);
  }
}
