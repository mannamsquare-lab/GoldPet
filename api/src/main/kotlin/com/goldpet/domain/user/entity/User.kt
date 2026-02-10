package com.goldpet.domain.user.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import java.time.LocalDate
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
    
    var birthDate: LocalDate?, // "YYYY-MM-DD"
    
    var phoneNumber: String?,

    var gender: String?,

    var birthYear: Int?,

    var mainLocationText: String?,

    @Column(columnDefinition = "geometry(Point, 4326)")
    var mainLocationGeom: Point?,

    var profileImageUrl: String?,

    var goldBalance: Int = 0,

    var isActive: Boolean = true,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: UserStatus = UserStatus.ACTIVE,

    var mbti: String? = null,
    
    @Column(columnDefinition = "TEXT")
    var intro: String? = null,
    
    @Column(name = "has_pet", nullable = false)
    var hasPet: Boolean = false,

    @Column(name = "is_notification_enabled", nullable = false)
    var isNotificationEnabled: Boolean = true,

    @Column(name = "fcm_token")
    var fcmToken: String? = null,

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    var profileImages: MutableList<UserProfileImage> = mutableListOf(),

    @ManyToMany(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "user_interests",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "interest_id")]
    )
    var interests: MutableSet<Interest> = mutableSetOf(),

    @ManyToMany(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "user_hobbies",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "hobby_id")]
    )
    var hobbies: MutableSet<Hobby> = mutableSetOf()

) : BaseTimeEntity()
