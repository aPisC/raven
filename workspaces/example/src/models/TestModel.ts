import { Column, Model, Table } from "sequelize-typescript";

@Table
export default class TestModel extends Model {
  @Column declare name: string;
  @Column declare email: string;
}
