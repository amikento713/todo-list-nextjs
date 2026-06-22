export interface Book {
    name: string;
    url: string;
}

export interface Task {
    id: number;
    text: string;
    completed: boolean;
    deadline: string;
    book?: Book;
}
