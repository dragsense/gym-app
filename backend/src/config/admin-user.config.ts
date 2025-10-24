import { registerAs } from '@nestjs/config';

export interface superAdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default registerAs(
  'superAdmin',
  (): superAdminConfig => ({
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'admin1245',
    firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
    lastName: process.env.SUPER_ADMIN_LAST_NAME || 'User',
  }),
);
