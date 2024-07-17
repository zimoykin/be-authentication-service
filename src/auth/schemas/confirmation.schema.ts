import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true,
    collection: 'confirmation'
})
class Confirmation {
    @Prop()
    email: string;

    constructor(
        email: string
    ) {
        this.email = email;
    }
}

const ConfirmSchema = SchemaFactory.createForClass(Confirmation);
ConfirmSchema.index({ email: 1 });
ConfirmSchema.index({ createdAt: 1 }, { expires: '1h' });


export { Confirmation, ConfirmSchema };