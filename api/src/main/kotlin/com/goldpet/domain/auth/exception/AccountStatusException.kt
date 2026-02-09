package com.goldpet.domain.auth.exception

import com.goldpet.domain.user.entity.UserStatus

class AccountStatusException(
    val userStatus: UserStatus,
    val errorCode: String
) : RuntimeException("Account is $userStatus")
