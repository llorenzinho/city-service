import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: "cities" })
export class City {
    // City properties
    @Prop({ required: true })
    id: string;
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    code: string;
    @Prop({ required: false, default: 'unavailable' })
    section: string;

    @Prop({ required: true })
    province: string;
    @Prop({ required: true })
    provinceCode: string;

    @Prop({ required: true })
    region: string;
}

export const CitySchema = SchemaFactory.createForClass(City);
export type CityDocument = HydratedDocument<City>;
