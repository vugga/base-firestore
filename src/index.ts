import { firestore } from 'firebase'
import isEmpty from 'lodash/isEmpty';
import { getTimeStamp } from './_utils';

interface IField {
  name: string;
  operator?: any;
  value: string;
}
interface IQuery {
  // for pagination
  limit?: number;
  page?: number;

  // by Id
  id?: any;

  // Field queries
  field?: any,
  min?: any,
  max?: any,
  operator?: any;
  value?: any;
  multiple?: boolean;

  // Data
  data?: any;
}

interface IWhereAll {
  fields: IField[],
  multiple?: boolean;
  limit?: number;
  snapshot?: boolean;
}

interface IDocument {
  [x: string]: any;
}
interface IAddDocumentOptions extends IDocument {
  checkName?: boolean; // name field can be unique, default is set to `true` to check if exiting document with same name,
}

/**
 * This is the Base class to fetch and store data to Firestore
 */
export default class BaseFireStore {
  db: firestore.Firestore;
  collection: string;
  storageRef: string;

  options?: {
    logger?: (event: any) => void;
    debug?: boolean;
  }

  constructor(
    db: firestore.Firestore,
    options?: {
      logger?: (event: any) => void;
      debug?: boolean;
    }
  ) {
    this.db = db;
    this.collection = '';
    this.storageRef = 'images';
    this.options = options; // debug flag
  }

  logger(event: any) {
    // @ts-ignore
    const defaultLogger = () => console.log(event && event.message, event);
    if (this.options && this.options.debug) {
      return this.options.logger ? this.options.logger(event) : defaultLogger();
    }
    return null;
  }


  /**
   * Return the collection name
   * @param {String} collection
   */
  getRef(collection: string): firestore.CollectionReference {
    return this.db.collection(collection);
  }

  /**
   * Return all data from a collection with pagination support.
   * @param {Object} query
   */
  async all(query: IQuery = {}): Promise<{ data: firestore.DocumentData[], total: number }> {
    const limit = query.limit ? query.limit : 1000;
    const page = query.page ? query.page : 1;
    try {
      const data = await this.getRef(this.collection)
        .get()
        .then(async (snapshot: any) => {
          const docsAt = (page - 1) * limit;
          const startAt = snapshot.docs[docsAt];
          const totalPosts = snapshot.docs.length;
          return { startAt, totalPosts };
        });
      const { startAt, totalPosts } = data;
      const nextData = await this.getRef(this.collection)
        // .orderBy('createdAt', 'desc')
        .limit(Number(limit))
        .startAt(startAt)
        .get()
        .then((docSnapshot: any) => {
          const data = docSnapshot.docs.map((doc: any) => {
            return { ...doc.data(), id: doc.id };
          });
          return data;
        });
      return { data: nextData, total: totalPosts };
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetch collection with where conditions
   * @param {Object} query
   */
  async where(query: IQuery = {}): Promise<firestore.DocumentData | any | any[]> {
    const limit = query.limit ? query.limit : 1000;
    const field = query.field ? query.field : null;
    const operator = query.operator ? query.operator : '==';
    const value = query.value ? query.value : null;
    const multiple = query.multiple ? query.multiple : false;
    const data: any = [];
    try {
      await this.getRef(this.collection)
        .limit(Number(limit))
        .where(field, operator, value)
        .get()
        .then((snapshot: any) => {
          snapshot.docs.map((doc: any) => {
            data.push({ ...doc.data(), id: doc.id });
          });
        });
      if (multiple) {
        return data;
      } else {
        return data[0] ? data[0] : null;
      }
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetch collection with where conditions
   * @param {Object} query
   */
  async whereAll(query: IWhereAll): Promise<firestore.DocumentData | any | any[]> {

    const { fields, multiple = false, limit = 1000, snapshot = false } = query;

    const data: any = [];
    try {

      let findQuery: any = this.getRef(this.collection);

      // Add all fields conditions, 
      fields.forEach(field => {
        findQuery = findQuery.where(field.name, field.operator, field.value)
      });

      await findQuery.limit(Number(limit)).get()
        .then((snapshotData: any) => {

          if (snapshot) {
            return snapshotData;
          }

          // do parse data
          snapshotData.docs.map((doc: any) => {
            data.push({ ...doc.data(), id: doc.id });
          });

        });

      if (isEmpty(data)) {
        throw new Error('Data not found');
      }


      if (multiple) {
        return data;
      } else {
        // Return one item only
        return data[0];
      }
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetch documents which falls between two range
   * @param {Object} query
   */
  async range(query: IQuery = {}) {
    const { field, min, max } = query;
    let posts: any[] = [];
    try {
      const data = await this.getRef(this.collection)
        .where(field, '>=', min)
        .where(field, '<=', max)
        .get()
        .then((snapshot: any) => {
          snapshot.docs.map((doc: any) => {
            posts.push({ ...doc.data(), id: doc.id });
          });
          return posts;
        });
      return data;
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
 * Fetch a document by its ID
 * @param id 
 */
  async byId(id: string): Promise<firestore.DocumentData> {
    try {
      return await this.getRef(this.collection)
        .doc(id)
        .get()
        .then((item: any) => {
          return { ...item.data(), id };
        });
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Delete a document by its ID
   * @param id 
   */
  async delete(id: any = null): Promise<firestore.DocumentData> {
    try {
      return this.getRef(this.collection)
        .doc(id)
        .delete() // Deleting a document does not delete its subcollections!
        .then(() => {
          return { id };
        });
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  async byName(name: string): Promise<firestore.DocumentData> {
    try {
      return await this.getRef(this.collection)
        .where('name', '==', name)
        .get()
        .then((snapshot: any) => {
          const docs = snapshot.docs.map((doc: IDocument) => ({ ...doc.data(), id: doc.id }));
          return docs[0]; // first item 
        });
    }
    catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Push a new document under a specific collection
     check if name exists, else update it
   * @param {Object} query
   * @checkName is @true by `default` 
   */
  async add(data: IDocument, options?: IAddDocumentOptions): Promise<firestore.DocumentData> {
    data = { ...data, createdAt: getTimeStamp() };
    try {

      const checkName = options && options.checkName || true;

      if (checkName && data.name) { // and data has name, find it then updated
        const oldByName = await this.byName(data.name);
        if (oldByName) {
          // We have the old by name update it now
          return this.update({
            id: oldByName.id,
            data
          })

        }
      }

      // Default add document
      return this.getRef(this.collection)
        .add(data)
        .then((doc: IDocument) => {
          return this.byId(doc.id);
        });

    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  // if you are not sure weather to add or update
  async set(query: IQuery = {}): Promise<firestore.DocumentData> {
    const id = query.id ? query.id : null; // id is required
    let data = query.data ? query.data : {};
    data = { ...data, updatedAt: getTimeStamp() };
    try {
      const post = await this.getRef(this.collection)
        .doc(id)
        .set(data, { merge: true })
        .then(() => {
          return this.byId(id);
        });
      return post;
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }

  /**
   * Update a document by ID and new data
   * @param {Object} query
   */
  async update(query: IQuery = {}): Promise<firestore.DocumentData> {
    const id = query.id ? query.id : null;
    let data = query.data ? query.data : {};
    data = { ...data, updatedAt: getTimeStamp() };
    try {
      const post = await this.getRef(this.collection)
        .doc(id)
        .update(data)
        .then(() => {
          return this.byId(id);
        });
      return post;
    } catch (error) {
      this.logger(error);
      return Promise.reject(error);
    }
  }
}
