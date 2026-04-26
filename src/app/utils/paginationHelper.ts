export interface IOptions {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
}

type ICalculatedResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
};

const calculatePagination = (options: IOptions): ICalculatedResult => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy: string = options.sortBy || 'createdAt';
    const sortOrder: string = options.sortOrder || 'desc';

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    };
};

export const paginationHelper = {
    calculatePagination
};
