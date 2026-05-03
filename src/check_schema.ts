import { AppDataSource } from "./data-source";

async function checkSchema() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  const tables = ['quotation_header', 'quotation_detail', 'receipt_header', 'receipt_detail', 'items'];
  
  for (const table of tables) {
    console.log(`--- Columns for ${table} ---`);
    const columns = await queryRunner.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}'
    `);
    console.table(columns);
  }
  
  await AppDataSource.destroy();
}

checkSchema().catch(console.error);
