import BaseFireStore from '.';
import { firestore } from 'firebase-admin';

export const addAutoQueries = (name: string, model: BaseFireStore) => {

    return {

        // Add timeline pagination
        [`${name}Timeline`]: async (_: any, { limit, order, start }: { limit: number, page?: number; order: any, start: Date }): Promise<any> => {
            return model.timelinePagination({ limit, order, start });
        },

        // Get all with pagination
        [`${name}s`]: async (_: any, { limit, page }: { limit: number, page?: number; }): Promise<any> => {
            return model.all({ limit, page });
        },

        // Get by Id

        [`${name}`]: async (_: any, { id }: { id: string }): Promise<firestore.DocumentData | null> => {

            if (!id) {
                console.log('ID Cannot be null for findByID')
                return null;
            }

            return model.byId(id);

        }
    }
}

//  Add createAndUpdate, delete
export const addAutoMutations = (name: string, model: BaseFireStore) => {

    return {

        [`${name}CreateUpdate`]: async (_: any, { input }: any, { req }: any): Promise<any> => {

            const data = input;
            // If update
            if (data.id) {
                return model.set({
                    id: data.id,
                    data
                }) as any;
            }

            return model.add(input);

        },

        [`${name}Delete`]: async (_: any, { input }: any): Promise<boolean> => {

            const id = input && input.id;
            if (!id) {
                console.log('ID cannot be null for deletion')
                return false;
            }

            return await model.delete(input) ? true : false;

        }
    }
}