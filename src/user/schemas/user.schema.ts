import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseModel } from "../../shared/basemodel";

@Schema({
    timestamps: true,
    collection: 'users'
})
class User extends BaseModel {
    @Prop()
    email: string;

    @Prop()
    name: string;

    @Prop()
    url: string;

    @Prop()
    role: 'admin' | 'user';

    @Prop()
    confirmed: boolean;


    constructor(data: any) {
        super();
        this.email = data?.email;
        this.name = data?.name;
        this.url = data?.url;
        this.role = data?.role;
        this.confirmed = data?.confirmed;
    }
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });


export { User, UserSchema };