package com.goldpet.domain.user.entity

import com.goldpet.config.crypto.BlindIndexConverter
import com.goldpet.config.crypto.EncryptionConverter
import com.goldpet.config.crypto.LocalDateEncryptionConverter
import com.goldpet.domain.common.entity.BaseTimeEntity
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import org.locationtech.jts.geom.Point

@Entity
@Table(name = "users")
class User(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
        @Convert(converter = EncryptionConverter::class)
        @Column(unique = false) // Removed unique constraint as encryption is random IV
        var email: String?,
        @Convert(converter = BlindIndexConverter::class)
        @Column(name = "email_hash", unique = true) // Hash is unique
        var emailHash: String? = null,
        var oauthProvider: String,
        var oauthId: String,
        var username: String?,
        var password: String?,
        var nickname: String?,
        @Convert(converter = EncryptionConverter::class) var name: String?,
        @Convert(converter = LocalDateEncryptionConverter::class)
        var birthDate: LocalDate?, // "YYYY-MM-DD" → AES-256-GCM encrypted
        @Convert(converter = EncryptionConverter::class) var phoneNumber: String?,
        var gender: String?,
        var birthYear: Int?,
        var mainLocationText: String?,
        @Column(columnDefinition = "geometry(Point, 4326)") var mainLocationGeom: Point?,
        var profileImageUrl: String?,
        var goldBalance: Int = 0,
        var isActive: Boolean = true,
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        var status: UserStatus = UserStatus.ACTIVE,
        var mbti: String? = null,
        @Column(columnDefinition = "TEXT") var intro: String? = null,
        @Column(name = "has_pet", nullable = false) var hasPet: Boolean = false,
        @Column(name = "is_notification_enabled", nullable = false)
        var isNotificationEnabled: Boolean = true,
        @Column(name = "is_chat_alert_enabled", nullable = false)
        var isChatAlertEnabled: Boolean = true,
        @Column(name = "is_community_alert_enabled", nullable = false)
        var isCommunityAlertEnabled: Boolean = true,
        @Column(name = "is_marketing_alert_enabled", nullable = false)
        var isMarketingAlertEnabled: Boolean = false,
        @Column(name = "is_location_sharing_enabled", nullable = false)
        var isLocationSharingEnabled: Boolean = true,
        @Column(name = "is_profile_public", nullable = false) var isProfilePublic: Boolean = true,
        @Column(name = "fcm_token") var fcmToken: String? = null,
        @Column(name = "profile_locked_at") var profileLockedAt: LocalDateTime? = null,
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
