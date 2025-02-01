import { DataSource } from 'typeorm';
import * as path from 'path';
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: process.env.DBUSER,
        password: process.env.DBPW,
        database: 'realworld',
        entities: [
          path.resolve(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
        ],
        synchronize: false,
      });
    
      return dataSource.initialize();
    },
  },
];

