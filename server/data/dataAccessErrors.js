const NewUserError = {
    EMAIL_ADDR_IN_USE: 'EMAIL_ADDR_IN_USE',
    USERNAME_TAKEN: 'USERNAME_TAKEN'
}

const LoginError = {
    NOT_VERIFIED: 'NOT_VERIFIED',
    INVALID_USERNAME_PASSWORD: 'INVALID_USERNAME_PASSWORD'
}

exports.LoginError = LoginError;
exports.NewUserError = NewUserError;