import { IUser } from './user.interface';
import { LoginResponseDto } from '../dtos';

export interface IAuthUser extends IUser {}

export interface ILoginResponse extends LoginResponseDto {}

