import axios from "axios";
import { UsersResponse } from "../interfaces/UsersResponse";

export const getUsers = async () => {
    try {
        const { data } = await axios.get<UsersResponse[]>(
            "https://jsonplaceholder.typicode.com/users"
        );
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
