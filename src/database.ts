import { connect } from '@planetscale/database';

export const connection = connect({
    // @ts-ignore
    host: PS_HOST,
    // @ts-ignore
    username: PS_USER,
    // @ts-ignore
    password: PS_PASSWORD
})