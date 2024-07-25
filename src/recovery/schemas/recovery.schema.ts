import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    collection: 'user-recovery'
})
export class Recovery {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    code: string;

    constructor(email: string) {
        this.email = email;
        this.code = '';
        for (let i = 0; i < 6; i++) {
            this.code += Math.floor(Math.random() * 10);
        }
    }
}

export const RecoverySchema = SchemaFactory.createForClass(Recovery);
RecoverySchema.index({ email: 1 }, { unique: true });