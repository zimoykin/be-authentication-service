import { USER_ROLE } from "../enums/user-role.enum";

export interface IAuthUser {
    id: string;
    role: USER_ROLE;
    email: string;
}