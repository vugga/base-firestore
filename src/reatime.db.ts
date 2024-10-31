import { database } from 'firebase-admin';

interface ReadQuery {
    path: string,
    field: string,
    equalTo: any,
    limit?: number
}
export class RealTimeDb {

    db: database.Database;

    private static _instance: RealTimeDb;

    private constructor(db: database.Database) {
        this.db = db;
    }

    /**
     * getRef
     */
    public getRef(path: string): database.Reference {
        return this.db.ref(path);
    }

    setData = async (path: string, data: any): Promise<any> => {
        await this.db.ref(path).set({ ...data });
        return data;
    }

    readData = async (args: ReadQuery): Promise<any> => {

        const { path, field, equalTo, limit } = args;
        const db = this.db.ref(path);

        return new Promise((res, rej) => {
            db.orderByChild(field).equalTo(equalTo).limitToFirst(limit || 1).once("value")
                .then(snapshot => {
                    const snapValue = snapshot.val();
                    res(snapValue)

                }).catch(e => {
                    console.log('orderByChild snap', e)
                    rej(null)
                });
        })

    }



}

export default RealTimeDb;