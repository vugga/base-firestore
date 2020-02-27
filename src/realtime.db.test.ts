import 'mocha';
import './_init';
import { expect } from 'chai'
import chalk from 'chalk';
import { RealTimeDb } from './reatime.db';

const field = 'symbol';
const demoDb = "test";
const equalTo = 'CRWD'

const store = RealTimeDb.Instance;

describe('Realtime DB', () => {
    it('should query a field', async () => {
        let queryData = await store.readData({
            field,
            path: demoDb,
            equalTo
        });

        console.log(chalk.green(`Query from db`), queryData);
        expect(queryData).not.null;
    })

    it('should save value to a field', async () => {
        let savedData = await store.setData(
            `${demoDb}/${equalTo}`,
            {
                symbol: equalTo,
                time: new Date().getTime()
            });

        console.log(chalk.green(`Query saved to data in db`), savedData);
        expect(savedData).not.null;
    })
})