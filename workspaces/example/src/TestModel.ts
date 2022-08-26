import { Column, Model, Table } from "sequelize-typescript";

@Table
export class TestModel extends Model {
  @Column declare name: string;
  @Column declare email: string;
}
