import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true,
    collection: 'confirmation'
})
class Confirmation {
    @Prop()
    email: string;

    @Prop()
    code: string;

    constructor(
        email: string
    ) {
        this.email = email;
        this.code = '';
        for (let i = 0; i < 6; i++) {
            this.code += Math.floor(Math.random() * 10);
        }
    }
}

const ConfirmSchema = SchemaFactory.createForClass(Confirmation);
ConfirmSchema.index({ email: 1 });
ConfirmSchema.index({ createdAt: 1 }, { expires: '1h' });


export { Confirmation, ConfirmSchema };