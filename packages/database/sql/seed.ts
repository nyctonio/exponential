#!/usr/bin/env node
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import models from './schema';
import spinners from 'cli-spinners';
import gradient from 'gradient-string';
import seedData from './seed-data';
import { Client } from 'pg';

const {
  m_user,
  m_exchange,
  m_menu,
  m_submenu,
  m_projectsetting,
  m_functionmaster,
  m_defaultfunctionmapping,
  m_exchangesetting,
  m_userbrokeragesetting,
  m_trademarginsetting,
  m_intradaytrademarginsetting,
  m_userfunctionmapping,
  m_routefunctionmapping,
  m_watchlistcolumn,
  m_userwatchlist,
  m_democreationbalance,
  m_userplsharing,
  m_staticcontent,
} = models;

import { loading } from 'cli-loading-animation';
import { env } from 'env';
// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
let database_name: string = process.argv[3];

const client = new Client({
  host: env.SEED_HOST_NAME,
  user: env.SEED_USER_NAME,
  password: env.SEED_PASSWORD,
  database: 'defaultdb',
  port: parseInt(env.SEED_DATABASE_PORT),
  ssl: { rejectUnauthorized: false },
});

const createDatabase = async (db_name) => {
  try {
    await client.connect(); // gets connection
    await client.query(`CREATE DATABASE ${db_name}`); // sends queries
    return true;
  } catch (error) {
    console.log('error creating database');
    console.log(error.stack);
    return false;
  } finally {
    await client.end(); // closes connection
  }
};

// create menu
let seeder = async () => {
  console.log('seeding database');
  try {
    console.log(
      gradient('red', 'blue').multiline(
        [
          '▄▄                                                                            ▄▄                          ',
          '▀███▀▀▀██▄           ██           ▄██                                   ▄█▀▀▀█▄█                     ▀███ ',
          '  ██    ▀██▄         ██            ██                                  ▄██    ▀█                       ██ ',
          '  ██     ▀██▄█▀██▄ ██████ ▄█▀██▄   ██▄████▄  ▄█▀██▄  ▄██▀███ ▄▄█▀██    ▀███▄     ▄▄█▀██  ▄▄█▀██   ▄█▀▀███ ',
          '  ██      ███   ██   ██  ██   ██   ██    ▀████   ██  ██   ▀▀▄█▀   ██     ▀█████▄▄█▀   ██▄█▀   ██▄██    ██ ',
          '  █▓     ▄██▄███▓█   ██   ▄███▓█   ▓█     ██ ▄███▓█  ▀█████▄▓█▀▀▀▀▀▀         ▀██▓█▀▀▀▀▀▀▓█▀▀▀▀▀▀█▓█    █▓ ',
          '  █▓    ▄█▓▀▓   ▓█   █▓  █▓   ▓█   ▓▓▓   ▄█▓█▓   ▓█       ██▓█▄    ▄   ██     ██▓█▄    ▄▓█▄    ▄▀▓█    █▓ ',
          '  ▓▓     ▓▓▓▓▓▓▓▒▓   ▓▓   ▓▓▓▓▒▓   ▓▓     ▓▓ ▓▓▓▓▒▓  ▀▓   █▓▓▓▀▀▀▀▀▀   ▓     ▀█▓▓▓▀▀▀▀▀▀▓▓▀▀▀▀▀▀▓▓▓    ▓▓ ',
          '  ▓▒    ▓▓▒▀▓   ▒▓   ▓▓  ▓▓   ▒▓   ▒▓▓   ▓▓▓▓▓   ▒▓  ▓▓   ▓▓▒▓▓        ▓▓     ▓▓▒▓▓     ▒▓▓     ▀▒▓    ▓▒ ',
          '▒ ▒ ▒ ▒ ▒  ▒▓▒ ▒ ▓▒  ▒▒▒ ▒▓▒ ▒ ▓▒  ▒ ▒ ▒ ▒▒ ▒▓▒ ▒ ▓▒ ▒ ▒▓▒   ▒ ▒ ▒▒    ▒▓▒ ▒ ▒▓  ▒ ▒ ▒▒  ▒ ▒ ▒▒  ▒ ▒ ▒ ▓ ▒',
        ].join('\n')
      )
    );

    createDatabase(database_name).then(async (res) => {
      if (res) {
        console.log(`${database_name} database created successfully`);
        const { start: seed_start, stop: seed_stop } = loading(
          'seeding database',
          {
            clearOnEnd: true,
            spinner: spinners.line,
          }
        );
        seed_start();

        // console.log('connection closed');
        let entities = [];
        for (let k in models) {
          entities.push(models[k]);
        }
        const AppDataSource = new DataSource({
          type: 'postgres',
          database: database_name,
          host: env.SEED_HOST_NAME,
          password: env.SEED_PASSWORD,
          port: parseInt(env.SEED_DATABASE_PORT),
          username: env.SEED_USER_NAME,
          ssl: {
            rejectUnauthorized: false,
          },
          useUTC: true,
          synchronize: true,
          logging: false,
          entities,
          migrations: [],
          subscribers: [],
        });
        await AppDataSource.initialize();
        console.log('connected to database');
        await AppDataSource.transaction(async (manager) => {
          let newExchnages = await manager.insert(
            m_exchange,
            seedData.exchangesData
          );
          let newMenus = await manager.insert(m_menu, seedData.menuData);
          let subMenus = await manager
            .createQueryBuilder()
            .insert()
            .into(m_submenu)
            .values(seedData.subMenuData)
            .execute();
          let newProjectSettings = await manager.insert(
            m_projectsetting,
            seedData.projectSettingsData
          );
          let functionMaster = await manager
            .createQueryBuilder()
            .insert()
            .into(m_functionmaster)
            .values(seedData.functionMasterData)
            .execute();
          let defaultFuncMapping = await manager
            .createQueryBuilder()
            .insert()
            .into(m_defaultfunctionmapping)
            .values(seedData.defaultFunctionData)
            .execute();
          let newUser = await manager
            .createQueryBuilder()
            .insert()
            .into(m_user)
            .values(seedData.userData)
            .execute();
          let newExchange = await manager
            .createQueryBuilder()
            .insert()
            .into(m_exchangesetting)
            .values(seedData.exchangeSettingData)
            .execute();
          let newBrokerage = await manager
            .createQueryBuilder()
            .insert()
            .into(m_userbrokeragesetting)
            .values(seedData.brokerageSettingsData)
            .execute();
          let newMargin = await manager
            .createQueryBuilder()
            .insert()
            .into(m_trademarginsetting)
            .values(seedData.marginSettingsData)
            .execute();
          let newIntraDay = await manager
            .createQueryBuilder()
            .insert()
            .into(m_intradaytrademarginsetting)
            .values(seedData.intradaySettingsData)
            .execute();
          let userFunctionMapping = await manager
            .createQueryBuilder()
            .insert()
            .into(m_userfunctionmapping)
            .values(seedData.userFunctionData)
            .execute();
          let watchlistColums = await manager
            .createQueryBuilder()
            .insert()
            .into(m_watchlistcolumn)
            .values(seedData.watchlistColumsData)
            .execute();
          let userWatchList = await manager
            .createQueryBuilder()
            .insert()
            .into(m_userwatchlist)
            .values(seedData.watchlistData)
            .execute();
          let routeFunctionMapping = await manager
            .createQueryBuilder()
            .insert()
            .into(m_routefunctionmapping)
            .values(seedData.routeFunctionMappingData)
            .execute();
          let demoCreationBalance = await manager
            .createQueryBuilder()
            .insert()
            .into(m_democreationbalance)
            .values(seedData.demoBalanceData)
            .execute();
          let plShare = await manager
            .createQueryBuilder()
            .insert()
            .into(m_userplsharing)
            .values([
              {
                user: {
                  id: 1,
                },
                companySharing: 0,
                exchange: {
                  id: 1,
                },
              },
              {
                user: {
                  id: 1,
                },
                companySharing: 0,
                exchange: {
                  id: 2,
                },
              },
              {
                user: {
                  id: 1,
                },
                companySharing: 0,
                exchange: {
                  id: 3,
                },
              },
              {
                user: {
                  id: 1,
                },
                companySharing: 0,
                exchange: {
                  id: 4,
                },
              },
            ])
            .execute();
          let tAndC = await manager
            .createQueryBuilder()
            .insert()
            .into(m_staticcontent)
            .values(seedData.termsAndConditionData)
            .execute();
          seed_stop();
          console.log('database seeded successfully');
          return;
        });
        process.exit(0);
      }
    });

    return;
  } catch (e) {
    console.log('error connecting to database', e);
    throw e;
  }
};

let addData = async () => {
  let entities = [];
  for (let k in models) {
    entities.push(models[k]);
  }
  const AppDataSource = new DataSource({
    type: 'postgres',
    database: database_name,
    host: env.SEED_HOST_NAME,
    password: env.SEED_PASSWORD,
    port: parseInt(env.SEED_DATABASE_PORT),
    username: env.SEED_USER_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
    useUTC: true,
    synchronize: true,
    logging: false,
    entities,
    migrations: [],
    subscribers: [],
  });
  await AppDataSource.initialize();
  await AppDataSource.transaction(async (manager) => {
    await manager.insert(
      m_routefunctionmapping,
      seedData.routeFunctionMappingData
    );
  });
};

seeder();
// addData();

// console.log(process.argv)
// readline.question('What is the name of your database? ', async (name) => {
//   database_name = name;
//   await seeder();
//   // await addData();
//   readline.close();
// });
