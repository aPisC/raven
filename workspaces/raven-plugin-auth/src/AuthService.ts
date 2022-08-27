import { Op } from 'sequelize'
import { Repository, Sequelize } from 'sequelize-typescript'
import UserModel from './models/UserModel'

export default class AuthService {
  private readonly userRepository: Repository<UserModel>

  constructor(sequelize: Sequelize) {
    this.userRepository = sequelize.getRepository(UserModel)
  }

  public async findByIdentifier(username: string, email: string): Promise<UserModel | null>
  public async findByIdentifier(identifier: string): Promise<UserModel | null>
  public async findByIdentifier(username: string, email?: string): Promise<UserModel | null> {
    return await this.userRepository.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email ?? username }],
      },
    })
  }
}
