import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseModel } from "../../shared/basemodel";
import { generateHash, generateSalt } from "../../shared/security";

@Schema({
    timestamps: true,
    collection: 'auth'
})
class Auth extends BaseModel {
    @Prop()
    email!: string;

    @Prop()
    hash!: string;

    @Prop()
    salt!: string;

    static new(
        email: string, password: string
    ) {
        const model = new Auth();
        model.email = email;
        model.salt = generateSalt(512);
        model.hash = generateHash(password, model.salt, 32, 512);

        return model;
    }

    checkPassword(password: string) {
        const candidate = generateHash(password, this.salt, 32, 512);
        return candidate === this.hash;
    }
}

const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ email: 1 });


export { Auth, AuthSchema };