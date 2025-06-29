'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';

type FormState = {
  message: string;
  success: boolean;
};

export async function executeSql(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = createAdminClient();
    
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'schema.sql');
    
    const sql = await fs.readFile(sqlFilePath, 'utf-8');

    if (!sql) {
        return {
            message: 'Error: schema.sql file is empty or could not be read.',
            success: false,
        }
    }

    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return {
        message: `Error executing SQL: ${error.message}`,
        success: false,
      };
    }

    return {
      message: 'Database schema executed successfully!',
      success: true,
    };
  } catch (err: any) {
    console.error('An unexpected error occurred:', err);
     if (err.code === 'ENOENT') {
      return {
        message: 'Error: supabase/schema.sql file not found.',
        success: false,
      };
    }
    return {
      message: `An unexpected error occurred: ${err.message}`,
      success: false,
    };
  }
}
