import { Exclude, Expose } from "class-transformer";
import { USER_ROLE } from "../enums/user-role.enum";

export class UserOutputDto {
    @Expose()
    email: string;

    @Expose()
    name: string;

    @Expose({ name: '___' })
    role: USER_ROLE;

    @Exclude()
    confirmed: boolean;

    constructor(data: any) {
        this.email = data?.email;
        this.name = data?.name;
        this.role = data?.role;
        this.confirmed = data?.confirmed;
    }
}