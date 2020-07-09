import {
  connection as connectionString,
  table as structure,
} from "../properties";

import { Client } from "pg";
import sql from "sql";

sql.setDialect("postgres");
const table = sql.define(structure);

export default async (values) => {
  const db = new Client({ connectionString });
  try {
    await db.connect();
    await db.query("BEGIN");
    for (const value of values) {
      const { rows } = await db.query(
        table
          .select(table.id_registro)
          .from(table)
          .where(table.co_cnes.equals(value.co_cnes))
          .and(table.dt_atendimento.equals(value.dt_atendimento))
          .toQuery()
      );
      if (rows[0] !== undefined) {
        await db.query(
          table
            .update(value)
            .where(table.id_registro.equals(rows[0].id_registro))
            .returning(table.id_registro)
            .toQuery()
        );
      } else {
        await db.query(
          table.insert(value).returning(table.id_registro).toQuery()
        );
      }
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.end();
  }
};
