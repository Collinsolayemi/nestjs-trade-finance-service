import { Sequelize } from 'sequelize-typescript';

export default async function createDatabaseSequences(sequelize: Sequelize) {
  await Promise.all([
    sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'clause_code_seq'
        ) THEN
          CREATE SEQUENCE "clause_code_seq"
          START WITH 1
          NO MAXVALUE
          CACHE 1;
        END IF;
      END
      $$ LANGUAGE plpgsql;
    `),

    sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'stp_exception_req_seq'
        ) THEN
          CREATE SEQUENCE "stp_exception_req_seq"
          START WITH 1
          NO MAXVALUE
          CACHE 1;
        END IF;
      END
      $$ LANGUAGE plpgsql;
    `),

    sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'reference_number_seq'
        ) THEN
          CREATE SEQUENCE "reference_number_seq"
          START WITH 1
          NO MAXVALUE
          CACHE 1;
        END IF;
      END
      $$ LANGUAGE plpgsql;
    `),

    sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'bfc_reference_number_seq'
        ) THEN
          CREATE SEQUENCE "bfc_reference_number_seq"
          START WITH 1
          NO MAXVALUE
          CACHE 1;
        END IF;
      END
      $$ LANGUAGE plpgsql;
    `),

    sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'guarantees_reference_number_seq'
        ) THEN
          CREATE SEQUENCE "guarantees_reference_number_seq"
          START WITH 1
          NO MAXVALUE
          CACHE 1;
        END IF;
      END
      $$ LANGUAGE plpgsql;
    `),
  ]);
}
