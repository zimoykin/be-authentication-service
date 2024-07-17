import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseModel } from "../../shared/basemodel";
import { USER_ROLE } from "../../auth/enums/user-role.enum";

@Schema({
    timestamps: true,
    collection: 'users'
})
class User extends BaseModel {
    @Prop({ unique: true })
    email: string;

    @Prop()
    name: string;

    @Prop()
    url: string;

    @Prop({ enum: USER_ROLE, required: true, default: USER_ROLE.USER })
    role: USER_ROLE;

    @Prop({ required: true, default: false })
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
UserSchema
    .index({ email: 1 })
    .index({ createdAt: 1 }, {
        partialFilterExpression: { confirmed: false },
        expireAfterSeconds: 20,
        name: 'deleting non confirmed users'
    });



export { User, UserSchema };