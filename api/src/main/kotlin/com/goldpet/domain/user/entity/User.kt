package com.goldpet.domain.user.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import jakarta.persistence.*
import org.locationtech.jts.geom.Point

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true)
    var email: String?,

    var oauthProvider: String,

    var oauthId: String,

    var username: String?,

    var password: String?,

    var nickname: String?,
    
    var name: String?,
    
    var birthDate: String?,
    
    var phoneNumber: String?,

    var gender: String?,

    var birthYear: Int?,

    var mainLocationText: String?,

    @Column(columnDefinition = "geometry(Point, 4326)")
    var mainLocationGeom: Point?,

    var profileImageUrl: String?,

    var goldBalance: Int = 0,

    var isActive: Boolean = true,
) : BaseTimeEntity()
