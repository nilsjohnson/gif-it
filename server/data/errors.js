const NewUserError = {
    EMAIL_ADDR_IN_USE: 'EMAIL_ADDR_IN_USE',
    USERNAME_TAKEN: 'USERNAME_TAKEN'
}

const LoginError = {
    NOT_VERIFIED: 'NOT_VERIFIED',
    INVALID_USERNAME_PASSWORD: 'INVALID_USERNAME_PASSWORD'
}

const PasswordResetError = {
    EMAIL_NOT_FOUND: 'EMAIL_NOT_FOUND',
    CODE_NOT_FOUND: 'CODE_NOT_FOUND',
    CODE_INVALID: 'CODE_INVALID',
    CODE_EXPIRED: 'CODE_EXPIRED',
    CODE_USED: 'CODE_USED'
}

exports.PasswordResetError = PasswordResetError;
exports.LoginError = LoginError;
exports.NewUserError = NewUserError;