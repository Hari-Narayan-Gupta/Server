const emailUser = process.env.EMAILUSER;

const emailPassword = process.env.PASSWORD;

const secret = process.env.JWT_KEY;

export default {
    emailUser,
    emailPassword,
    secret
};
