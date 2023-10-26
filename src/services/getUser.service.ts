import axios from "axios";
import { UsersResponse } from "../interfaces/UsersResponse";

export const getUser = async (id: number) => {
    try {
        const { data } = await axios.get<UsersResponse>(
            `https://jsonplaceholder.typicode.com/users/${id}`
        );
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
