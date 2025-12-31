package com.goldpet.domain.admin.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import jakarta.persistence.*

enum class AdminUserRole {
    SUPER_ADMIN,
    OPERATOR,
    VIEWER
}

@Entity
@Table(name = "admin_users")
class AdminUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    var email: String,

    @Column(nullable = false)
    var passwordHash: String,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: AdminUserRole = AdminUserRole.OPERATOR,

    var otpSecret: String? = null,

    @Column(nullable = false)
    var isActive: Boolean = true

) : BaseTimeEntity()
