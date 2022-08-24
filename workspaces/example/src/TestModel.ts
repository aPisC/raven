import { Column, Model } from "sequelize-typescript";

export class TestModel extends Model {
  @Column declare name: string;
  @Column declare email: string;
}
