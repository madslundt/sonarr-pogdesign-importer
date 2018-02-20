export interface IScraper {
    process: (fromDate: Date, toDate: Date) => Promise<IItem[]>
}

export interface IItem {
    title: string,
    stars: number
}